// 出題の2段階（書ける → いろいろな使い方）を見る（2026-10-03 ユーザー承認。6級でも同じ作り）
//   node tools/check_variety.mjs            ← 入口の自己テスト → 本物
//   node tools/check_variety.mjs --selftest ← 自己テストだけ
// 見ること（ダミーの本・公開リポジトリなので本の文面は使わない）:
//   S1 まだ書けていない字がある → 第1段階（writeRoundActive）
//   S2 全部の字が一度は〇 → 第2段階: まだ出していない書き取りの「別の語」が出る・出た通り数が少ない字から・20問・同じ字が重ならない・記録を書き換えない
//   S3 第2段階で✕が付いた → 第1段階に戻さない／✕の問題は翌日1回だけ出る／20問
//   S4 「本でやった」の必ず出す印が残っている字 → まだ書けていない扱い（第1段階）
// 自己テストの偽物: (a)直す前の版 (b)通り数の少ない順にしない (c)✕で第1段階に戻る (d)第2段階で別の語を出さない (e)見た目だけ→鳴らない
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST_ONLY = process.argv.includes("--selftest");
const CR = String.fromCharCode(13);
const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").split(CR).join("");
const BEFORE = execFileSync("git", ["show", "eaf9fc6:index.html"], { cwd: ROOT, maxBuffer: 1 << 28 }).toString("utf8").split(CR).join("");
function mutate(pairs, name) {
  let out = REAL;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) { console.error("✋ 偽物「" + name + "」を作れません。書きかえ元なし: " + from); process.exit(3); }
    out = out.split(from).join(to);
  }
  return out;
}
const FAKES = [
  ["(a) 直す前の版（第2段階で別の語を出さない・✕で第1段階に戻る）", BEFORE, true],
  ["(b) 出た通り数の少ない字から にしない（本の順）", mutate([["return (a.fail-b.fail) || (a.avg-b.avg) || (a.i-b.i);", "return (a.i-b.i);"]], "b"), true],
  ["(c) 第2段階の✕で第1段階に戻る", mutate([["return !!(st && (st.o||0)>0);", "return !!(st && (st.o||0)>0 && (st.run||0)>0);"]], "c"), true],
  ["(d) 第2段階でも別の語を出さない（字が書けた書き取りは除く）", mutate([["cand[f]=apartThin(varietyOrder(cand[f]), seen);", "cand[f]=apartThin(varietyOrder(cand[f]).filter(function(x){ return !(itemFieldOf(x.it,x.g)===\"kaki\" && kakiAllWritten(x)); }), seen);"]], "d"), true],
  ["(e) 見た目だけ変えた（中身は同じ）", mutate([["function charFailing(k){ var st=", "function charFailing(k){ var  st="]], "e"), false],
];

const MIME = { ".html": "text/html", ".js": "text/javascript" };
let SERVE = REAL;
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html";
  if (rel === "index.html") { res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" }); return res.end(SERVE); }
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;
const browser = await launchBrowser(await getChromium());

async function inspect(html) {
  SERVE = html;
  const page = await browser.newPage();
  const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("dialog", d => d.accept());
  await page.clock.setFixedTime(new Date("2026-10-02T10:00:00+09:00"));
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  const r = await page.evaluate(() => {
    const ng = [], add = s => ng.push(s);
    const P = KANJI_MASTER.map(r => r.k).filter(c => /^[一-鿿]$/.test(c));
    let pi = 0; const nk = () => P[pi++];
    const mk = (id, no, k) => ({ id, no, text: "テスト" + id, target: null, targetNth: 0, answers: [{ text: k, around: "□" + P[400] }], kanji: [k] });
    const dupes = list => { const seen = {}, d = []; list.forEach(x => (x.it.kanji || []).forEach(k => { if (seen[k]) d.push(k); seen[k] = 1; })); return d; };
    /* 書き取りの字20字。各字に3通り（_0 _1 _2）。字10〜19は _0 だけ〇（通り数1）、字0〜9は _0 と _1 が〇（通り数2。本の順では先に来る）。新しい部首・同じ読み・対義語は十分 */
    function build() {
      pi = 0;
      const chars = [], kaki = [];
      for (let j = 0; j < 20; j++) { const k = nk(); chars.push(k); for (let t = 0; t < 3; t++) kaki.push(mk("k" + j + "_" + t, j * 3 + t + 1, k)); }
      const bushu = [], onaji = [], taigi = [];
      for (let i = 0; i < 12; i++) { const ks = [nk(), nk(), nk()]; bushu.push({ id: "b" + i, no: i + 1, text: "ダミー", answers: ks.map(k => ({ text: k, around: "□" + P[401] })), kanji: ks }); }
      for (let i = 0; i < 12; i++) onaji.push(mk("o" + i, i + 1, nk()));
      for (let i = 0; i < 12; i++) taigi.push(mk("t" + i, i + 1, nk()));
      const U = (uid, f, items) => ({ unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))], groups: [{ gno: 0, field: f, instruction: "ダミー", items }] });
      BOOK_UNITS = [U("dr_01", "kaki", kaki), U("dr_02", "bushu", bushu), U("dr_03", "onaji", onaji), U("dr_04", "taigi", taigi)];
      window.isVerifiedUnit = () => true;
      ITEMS = {}; KSTATS = {}; WEAK = {}; LOG = []; RECORDS = {}; SESSION = null;
      chars.forEach((k, j) => {
        KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } };
        ITEMS["k" + j + "_0"] = { o: 1, x: 0, last: "o", date: "2026-09-20" };
        if (j < 10) ITEMS["k" + j + "_1"] = { o: 1, x: 0, last: "o", date: "2026-09-21" };
      });
      return { chars };
    }
    const days = [];
    try {
      /* S1 まだ書けていない字がある */
      let b = build();
      KSTATS[b.chars[3]] = { kaki: { o: 0, x: 1, run: 0 } };
      if (!writeRoundActive()) add("S1 まだ書けていない字があるのに、第1段階になっていない");
      /* S2 全部の字が書けた → 第2段階 */
      b = build();
      if (writeRoundActive()) add("S2 全部の字が書けたのに、第1段階のまま");
      const before = JSON.stringify(ITEMS);
      let s = composeSheet(20); days.push("S2:" + s.length);
      const kaki = s.filter(x => itemFieldOf(x.it, x.g) === "kaki");
      days.push("別の語:" + kaki.length);
      if (s.length !== 20) add("S2 20問にならない " + s.length);
      if (kaki.length < 5) add("S2 書き取りの別の語が出ていない " + kaki.length);
      if (kaki.some(x => ITEMS[x.it.id])) add("S2 一度やった同じ問題が出ている（別の語でない）");
      if (kaki.some(x => b.chars.indexOf(x.it.kanji[0]) < 10)) add("S2 出た通り数が多い字（字0〜9）が先に出ている。少ない字（字10〜19）から出るはず");
      if (dupes(s).length) add("S2 同じ字が重なっている " + dupes(s).join(""));
      if (JSON.stringify(ITEMS) !== before) add("S2 記録（ITEMS）が書き換わった");
      /* S3 第2段階で✕（字0の別の語が✕・きのう） */
      b = build();
      ITEMS.k0_1 = { o: 0, x: 1, last: "x", date: "2026-10-01" };
      KSTATS[b.chars[0]] = { kaki: { o: 1, x: 1, run: 0 } };
      if (writeRoundActive()) add("S3 第2段階の✕で、第1段階に戻っている");
      s = composeSheet(20); days.push("S3:" + s.length);
      if (s.length !== 20) add("S3 20問にならない " + s.length);
      if (s.filter(x => x.it.id === "k0_1").length !== 1) add("S3 ✕の問題が翌日に1回だけ出ていない");
      if (dupes(s).length) add("S3 同じ字が重なっている " + dupes(s).join(""));
      /* S4 「本でやった」の印 */
      b = build();
      WEAK[b.chars[2]] = { wrong: 1, got: false, must: true };
      if (!writeRoundActive()) add("S4 「本でやった」の必ず出す印が残っている字があるのに、第1段階にならない");
    } catch (e) { add("検査の途中で止まった " + (e && e.stack || e)); }
    return { ng, days };
  });
  await page.close();
  if (errs.length) r.ng.push("JSエラー " + errs.join("|"));
  return r;
}

console.log("=== 入口の自己テスト ===");
let selfFail = 0;
for (const [name, html, ring] of FAKES) {
  const r = await inspect(html), rang = r.ng.length > 0, ok = rang === ring;
  if (!ok) selfFail++;
  console.log((ok ? "  OK " : "  NG ") + name + " → " + (rang ? "鳴った（" + r.ng.length + "件。例: " + r.ng[0] + "）" : "鳴らなかった"));
}
if (selfFail) { console.log("\n✋ 自己テストが " + selfFail + " 件落ちました。結果は出しません。"); await browser.close(); server.close(); process.exit(3); }
if (SELFTEST_ONLY) { await browser.close(); server.close(); process.exit(0); }
console.log("\n=== 本物の index.html ===");
const r = await inspect(REAL);
console.log("  " + r.days.join(" "));
r.ng.forEach(x => console.log("  NG " + x));
console.log(r.ng.length ? "\n✋ " + r.ng.length + " 件" : "\n★ 全部通りました");
await browser.close(); server.close();
process.exit(r.ng.length ? 1 : 0);
