/* アプリでやる問題（読み・記号・画数）の画面を、単元ごとに1問ずつ撮る。**照合する人が自分で走らせるための道具。**
 *
 *   set KANKEN_PASS=<合言葉>
 *   node tools/app_preview.mjs --out "<出力先フォルダ>" dr_20 [単元id ...]
 *
 * ★照合がまだ通っていない単元も出せる（照合する前に画面で解けるかを見るため）。
 *   ⚠️ この道具の中だけで「照合ずみ」とみなしている。アプリ本体・端末の記録には何も書かない。
 * ⚠️ 出力先は必ず `--out` で、リポジトリの外に。合言葉は環境変数から（print_sheets.mjs と同じ）。
 *
 * 出るもの（1問につき）:
 *   <単元id>_<問番号>.png  … 答える前の画面（音訓・記号・画数）／読みは「こたえを見る」を押した後も
 *   <単元id>_info.json     … 画面に出ている指示文・問題（ルビ込み）・ボタンの文字・出典
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { getChromium, launchBrowser } from "./browser.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const args = process.argv.slice(2);
const oi = args.indexOf("--out");
if (oi < 0 || !args[oi + 1]) { console.error("使い方: node tools/app_preview.mjs --out <出力先フォルダ> <単元id> [...]"); process.exit(2); }
const OUT = path.resolve(args[oi + 1]);
if (OUT.startsWith(ROOT)) { console.error("★中止: 出力先が kanken-print-app の中です → " + OUT); process.exit(3); }
// --figures … 本から切り出した図（crop_figures.py）を、この道具の中だけで問題に入れて撮る。
//             暗号データへの取り込み（build_quiz）より前に、図が画面で見分けられるかを照合するため。端末には保存しない
const withFigures = args.includes("--figures");
const want = args.filter((a, i) => i !== oi && i !== oi + 1 && a !== "--figures");
if (!want.length) { console.error("単元idを1つ以上指定してください（例: dr_20）"); process.exit(2); }
const pass = process.env.KANKEN_PASS;
if (!pass) { console.error("★中止: 環境変数 KANKEN_PASS に合言葉を入れてください。"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

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
await p.setViewportSize({ width: 420, height: 900 });
await p.goto("http://127.0.0.1:" + srv.address().port + "/index.html", { waitUntil: "networkidle" });
await p.click('.tab[data-page="setei"]');
await p.fill("#q-pass", pass);
await p.click('button:has-text("よみこむ")');
try { await p.waitForFunction(() => window.BOOK_UNITS !== null, { timeout: 30000 }); }
catch { console.error("★中止: 合言葉で復号できませんでした。"); await b.close(); srv.close(); process.exit(3); }
await p.click('.tab[data-page="kyou"]');

/* 図を取ってくる（平文JSON → crop_figures.py --json → {問題id: data URI}）。ファイルは作らない */
function figuresFor(u) {
  const dirs = ["漢検書き起こし_ドリル", "漢検書き起こし_ノート"].map(d => path.resolve(ROOT, "..", "司令塔", d, "data", u + ".json"));
  const src = dirs.find(f => fs.existsSync(f));
  // ★見つからなかったら黙って0枚にしない（claude-e0: リポジトリの外に展開したツリーで走らせて空振りした）
  if (!src) { console.log(`  ★ ${u}: 平文JSONが見つかりません（探した場所: ${dirs.join(" / ")}）。図は入りません`); return null; }
  const out = execFileSync("python", [path.join(HERE, "crop_figures.py"), "--json", src], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out || "{}");
}

for (const u of want) {
  if (withFigures) {
    const figs = figuresFor(u);
    if (!figs) { process.exitCode = 1; continue; }
    const n = await p.evaluate((figs) => {
      let n = 0;
      BOOK_UNITS.forEach(un => (un.groups || []).forEach(g => (g.items || []).forEach(it => { if (figs[it.id]) { it.figureImg = figs[it.id]; n++; } })));
      return n;
    }, figs);
    console.log(`  ${u}: 図を ${n} 枚入れました（この道具の中だけ）`);
  }
  // この道具の中だけ、指定した単元を照合ずみとみなす。★保存はしない（save を止める）
  const ids = await p.evaluate((u) => {
    window.save = () => {};
    const keep = window.isVerifiedUnit;
    window.isVerifiedUnit = (id) => id === u || keep(id);
    const xs = appAllItems().filter(x => x.u.unitId === u);
    const ord = {};
    // ★選択肢はアプリ本体と同じ appChoicesOf で取る。送りがなは本に選択肢が無く okuriPlan が作るので、
    //   it.choices を見ると並べ替えが一度も起きず「全問アが正解」に見えていた（claude-e0 の指摘 No.27）
    xs.forEach(x => { const f = itemFieldOf(x.it, x.g), ch = appChoicesOf(x.it, f);
      if (SHUFFLE_CHOICE_FIELDS.indexOf(f) >= 0 && ch.length > 1) ord[x.it.id] = randPerm(ch.length, null); });
    APP_S = { v: APP_VERSION, date: todayStr(), ids: xs.map(x => x.it.id), pos: 0, ord, res: {}, step: {} };
    return APP_S.ids;
  }, u);
  if (!ids.length) { console.log(`  ${u}: アプリで出す問題がありません（紙の分野か、図が要る問題だけ）`); continue; }
  const info = [];
  for (let i = 0; i < ids.length; i++) {
    const row = await p.evaluate((i) => {
      APP_S.pos = i;
      // ★アプリの問題は専用の画面（page-app）にある（2026-09-11 から）。開いてから撮る
      openApp();
      const box = document.getElementById("ap-box");
      window.scrollTo(0, 0);
      const x = appIndex()[APP_S.ids[i]];
      return { no: x.it.no, cite: bookCite(x), screen: box.innerText,
               questionHtml: box.querySelector(".ap-q") ? box.querySelector(".ap-q").innerHTML : "",
               buttons: [...box.querySelectorAll("button")].map(e => e.textContent) };
    }, i);
    await p.screenshot({ path: path.join(OUT, `${u}_${row.no}.png`) });
    // 図があれば、タップして2倍に広げた画面も撮る（太い画が見分けられるかの照合用）
    if (await p.$('#ap-box .ap-fig img')) {
      await p.click('#ap-box .ap-fig img');
      await p.screenshot({ path: path.join(OUT, `${u}_${row.no}_zoom.png`) });
      await p.evaluate(() => { document.getElementById("fig-zoom").style.display = "none"; });
      row.figure = true;
    }
    if (await p.$('#ap-box [data-act="show"]')) {
      await p.click('#ap-box [data-act="show"]');
      row.afterShow = await p.evaluate(() => document.getElementById("ap-box").innerText);
      await p.screenshot({ path: path.join(OUT, `${u}_${row.no}_shown.png`) });
    }
    info.push(row);
  }
  fs.writeFileSync(path.join(OUT, u + "_info.json"), JSON.stringify(info, null, 1), "utf8");
  console.log(`  ${u}: ${ids.length}問を撮りました`);
}
console.log(`\n出力先: ${OUT}`);
console.log("JSエラー:", errs.length ? errs.join(" | ") : "なし");
await b.close(); srv.close();
