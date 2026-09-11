/* ★本物のデータで「きょうの紙」が1枚に収まり、折り線を越えないかを測る。
 *
 *   set KANKEN_PASS=<合言葉>
 *   node tools/check_real_paper.mjs [--all-units]
 *
 * なぜあるか（2026-09-11）:
 *   ダミーの短い文ではテストが通り、本物の紙は折り線を越えていた（1日に4回）。
 *   smoke-test（ダミー）は公開リポジトリで誰でも走らせられるが、本物の長さは再現しきれない。
 *   → **配信の前に、本物で1回測る。**合言葉が要るので publish.mjs には入れていない（手で走らせる）。
 *
 * 見るもの（止める＝終了コード1）:
 *   ・きょうの紙が1枚である（2枚目が5問以下の紙を出していない）
 *   ・どの紙も、問題の最後の行が折り線より上
 *   ・答えが答えの欄からはみ出していない
 *   ・分野の数が配点比のまま（書き取りを先に削っていない）・どの分野も0にしない
 *   --all-units … 照合ずみの単元ごとの紙も同じく測る（照合担当の print_sheets と同じ出し方）
 * 出力は数字だけ（問題文は出さない）。
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pass = process.env.KANKEN_PASS;
if (!pass) { console.error("★中止: 環境変数 KANKEN_PASS に合言葉を入れてください。"); process.exit(2); }
const allUnits = process.argv.includes("--all-units");

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, r) => {
  if (q.url === "/favicon.ico") { r.writeHead(204); return r.end(); }
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html");
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const b = await launchBrowser(await getChromium());
const p = await b.newPage();
const errs = [];
p.on("pageerror", e => errs.push(String(e)));
p.on("dialog", d => d.accept());
await p.goto("http://127.0.0.1:" + srv.address().port + "/index.html", { waitUntil: "networkidle" });
await p.click('.tab[data-page="setei"]');
await p.fill("#q-pass", pass);
await p.click('button:has-text("よみこむ")');
try { await p.waitForFunction(() => window.BOOK_UNITS !== null, { timeout: 30000 }); }
catch { console.error("★中止: 合言葉で復号できませんでした。"); await b.close(); srv.close(); process.exit(3); }

let fail = 0;
const ok = (name, cond, extra = "") => { console.log((cond ? "  OK   " : "  FAIL ") + name + (extra ? "  " + extra : "")); if (!cond) fail++; };

async function measure(label, prep, arg) {
  await p.evaluate(prep, arg);
  await p.emulateMedia({ media: "print" });
  await p.setViewportSize({ width: 794, height: 1123 });
  const m = await p.evaluate(() => {
    window.print = () => {};
    printSessionPractice();
    return [...document.querySelectorAll("#print-region .p-sheet")].map(s => {
      const top = s.getBoundingClientRect().top;
      const fold = s.querySelector(".p-fold").getBoundingClientRect().top - top;
      const bottom = Math.max(...[...s.querySelectorAll(".p-body tr, .p-body .p-sec, .p-body .p-pool, .p-body .p-example")].map(e => e.getBoundingClientRect().bottom - top));
      const key = s.querySelector(".p-key");
      return { rows: s.querySelectorAll(".p-body tr").length, fold: Math.round(fold), bottom: Math.round(bottom), keyOver: key.scrollHeight - key.clientHeight };
    }).concat([{ exWant: buildPaperBlocks().filter(b => b.example).length, exHave: document.querySelectorAll("#print-region .p-example").length }]);
  });
  const ex = m.pop();
  ok(`${label}: 本の〈例〉が紙に出ている（${ex.exHave}/${ex.exWant}）`, ex.exHave === ex.exWant);
  await p.emulateMedia({ media: null });
  ok(`${label}: 折り線より上（${m.length}枚・${m.map(s => s.rows).join("+")}問）`, m.length > 0 && m.every(s => s.bottom <= s.fold), m.map(s => `${s.bottom}/${s.fold}`).join(" "));
  ok(`${label}: 答えが欄に収まる`, m.every(s => s.keyOver <= 1), m.map(s => s.keyOver).join(","));
  return m;
}

console.log("=== きょうの紙（本物） ===");
const day = await measure("きょう", () => { SESSION = null; });
const comp = await p.evaluate(() => {
  const c = {}; todaySheetItems().forEach(x => { const f = itemFieldOf(x.it, x.g); c[f] = (c[f] || 0) + 1; });
  return { c, n: SESSION.ids.length, q: paperQuota(SESSION.ids.length),
           avail: PAPER_FIELDS.filter(f => bookAllItems().some(x => itemFieldOf(x.it, x.g) === f && !ITEMS[x.it.id])) };
});
ok("きょうの紙は1枚（2枚目が5問以下の紙を出していない）", day.length === 1 || day.slice(1).every(s => s.rows > 5), day.map(s => s.rows).join("+"));
ok("出せる分野はどれも1問以上", comp.avail.every(f => (comp.c[f] || 0) >= 1), `${JSON.stringify(comp.c)} / 出せる分野 ${comp.avail.join(",")}`);
ok("書き取りがいちばん多い（書き取りを先に削っていない）", Object.keys(comp.c).every(f => (comp.c.kaki || 0) >= comp.c[f]), JSON.stringify(comp.c));
console.log(`  （${comp.n}問: ${JSON.stringify(comp.c)}／配点比 ${JSON.stringify(comp.q)}）`);

if (allUnits) {
  console.log("\n=== 単元ごとの紙（照合ずみ） ===");
  const units = await p.evaluate(() => [...new Set(bookAllItems().map(x => x.u.unitId))]);
  for (const u of units) {
    await measure(u, (u) => { SESSION = { v: SHEET_VERSION, date: todayStr(), ids: bookAllItems().filter(x => x.u.unitId === u).map(x => x.it.id), results: {}, saved: false, _tool: true }; }, u);
  }
}
// ★送りがな（アプリの3択）: 長さで選ぶ作戦が、でたらめより得をしないか（本物の全問）
const ob = await p.evaluate(() => okuriBias());
ok("送りがな: 長さで選ぶ作戦が、でたらめより15ポイント以上得をしない", ob.ok, JSON.stringify({ three: ob.three, two: ob.two, skip: ob.skip, edge: ob.edge }));
const okPaper = await p.evaluate(() => bookAllItems().filter(x => itemFieldOf(x.it, x.g) === "okuri").length);
ok("送りがなは紙に出ない", okPaper === 0, String(okPaper));
ok("JSエラーが無い", errs.length === 0, errs.join(" | "));
await p.evaluate(() => { localStorage.clear(); });
await b.close(); srv.close();
console.log(fail ? `\n★★ ${fail} 件。配信しないでください。` : "\n★ 本物の紙: 全部OK");
process.exit(fail ? 1 : 0);
