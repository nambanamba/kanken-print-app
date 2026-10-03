// 「毎日20問」が、書き取りの字がぜんぶ〇になったあとも保たれるかを見る（2026-10-03 ユーザー承認）。
//   node tools/check_review_fill.mjs            ← 入口の自己テスト → 本物
//   node tools/check_review_fill.mjs --selftest ← 自己テストだけ
// 見ること（ダミーの本・公開リポジトリなので本の文面は使わない）:
//   A 書き取りの字がぜんぶ〇・新しい部首/同じ読み/対義語が十分ある日（10-02 の条件）→ 20問・部首6/同じ読み5/対義語4＋書き取りの復習5、
//     復習は「最後に〇にした日が古い順」
//   B 新しい問題がぜんぶ尽きた日 → 書き取りの復習で20問
//   C 前日✕の問題がある日 → ✕を先に入れて20問
//   E きょう✕にした問題は復習にも入れない
//   D 復習に回せる書き取りが少ない日 → 20問に満たなくてよい（別のもので埋めない）
//   ★どの日も: 同じ日の紙に同じ字が重ならない／問題idの重複なし／記録（ITEMS）を書き換えない
// 自己テストの偽物: (a)復習なし（直す前）(b)新しい順 (c)字の重なりを見ない (d)✕の問題も復習に入れる (e)見た目だけ変えた→鳴らない
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST_ONLY = process.argv.includes("--selftest");
const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
function mutate(pairs, name) {
  let out = REAL;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) { console.error("✋ 偽物「" + name + "」を作れません。書きかえ元なし: " + from); process.exit(3); }
    out = out.split(from).join(to);
  }
  return out;
}
const FAKES = [
  ["(a) 復習で埋めない（直す前と同じ）", mutate([["return out.concat(reviewFill(out, target-out.length));", "return out;"]], "a"), true],
  ["(b) 新しい日から先に出す（古い順でない）", mutate([["return da<db?-1:da>db?1:a._i-b._i;", "return da<db?1:da>db?-1:a._i-b._i;"]], "b"), true],
  ["(c) 同じ字の重なりを見ない", mutate([["if(ks.some(function(k){ return used[k]; })) return;", ""]], "c"), true],
  ["(d) ✕の問題も復習に入れる", mutate([["r && r.last===\"o\" && r.date;", "r && r.date;"]], "d"), true],
  ["(e) 見た目だけ変えた（中身は同じ）", mutate([["var used={}, seen={};", "var used = {}, seen = {};"]], "e"), false],
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
    function build(nKaki, nBushu, nOnaji, nTaigi, shareChar) {
      pi = 0;
      const kaki = [], kakiK = [];
      for (let i = 0; i < nKaki; i++) { const k = nk(); kakiK.push(k); kaki.push(mk("k" + i, i + 1, k)); }
      const bushu = [], onaji = [], taigi = [];
      for (let i = 0; i < nBushu; i++) { const ks = [nk(), nk(), nk()]; if (shareChar && i === 0) ks[0] = kakiK[0]; bushu.push({ id: "b" + i, no: i + 1, text: "ダミー", answers: ks.map(k => ({ text: k, around: "□" + P[401] })), kanji: ks }); }
      for (let i = 0; i < nOnaji; i++) onaji.push(mk("o" + i, i + 1, nk()));
      for (let i = 0; i < nTaigi; i++) taigi.push(mk("t" + i, i + 1, nk()));
      const U = (uid, f, items) => ({ unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))], groups: [{ gno: 0, field: f, instruction: "ダミー", items }] });
      BOOK_UNITS = [U("dr_01", "kaki", kaki), U("dr_02", "bushu", bushu), U("dr_03", "onaji", onaji), U("dr_04", "taigi", taigi)];
      window.isVerifiedUnit = () => true;
      return { kaki, kakiK, bushu, onaji, taigi };
    }
    function reset(b, doneKaki) {   // 書き取りは〇（日付は i が小さいほど古い。2問ずつ同じ日）
      ITEMS = {}; KSTATS = {}; WEAK = {}; LOG = []; RECORDS = {}; SESSION = null;
      b.kaki.slice(0, doneKaki).forEach((x, i) => {
        const day = "2026-09-" + String(10 + Math.floor(i / 2)).padStart(2, "0");
        ITEMS[x.id] = { o: 1, x: 0, last: "o", date: day };
        KSTATS[x.kanji[0]] = { kaki: { o: 1, x: 0, run: 1 } };
      });
    }
    const dupes = list => { const seen = {}, d = []; list.forEach(x => (x.it.kanji || []).forEach(k => { if (seen[k]) d.push(k); seen[k] = 1; })); return d; };
    const cnt = list => list.reduce((a, x) => { const f = itemFieldOf(x.it, x.g); a[f] = (a[f] || 0) + 1; return a; }, {});
    const days = [];
    try {
      /* A: 10-02 の条件（書き取りは全部〇・新しい問題は十分ある） */
      let b = build(40, 6, 20, 20, true); reset(b, 40);   // 部首は6問ちょうど（共有の字の部首も必ず出る）
      const before = JSON.stringify(ITEMS);
      let s = composeSheet(20);
      days.push("A:" + s.length);
      if (s.length !== 20) add("A 20問にならない " + s.length);
      const c = cnt(s);
      if (!(c.bushu === 6 && c.onaji === 5 && c.taigi === 4 && c.kaki === 5)) add("A 内訳が 部首6/同じ読み5/対義語4/書き取り復習5 でない " + JSON.stringify(c));
      if (dupes(s).length) add("A 同じ字が重なっている " + dupes(s).join(""));
      if (new Set(s.map(x => x.it.id)).size !== s.length) add("A 問題idが重複");
      const rev = s.filter(x => itemFieldOf(x.it, x.g) === "kaki").map(x => x.it.id);
      if (JSON.stringify(rev) !== JSON.stringify(["k1", "k2", "k3", "k4", "k5"])) add("A 復習が「最後に〇にした日が古い順」でない（k0 は部首と字が重なるので除く） " + rev.join(","));
      if (JSON.stringify(ITEMS) !== before) add("A 記録（ITEMS）が書き換わった");
      /* B: 新しい問題が尽きた日 */
      b = build(40, 6, 5, 4, false); reset(b, 40);
      [].concat(b.bushu, b.onaji, b.taigi).forEach(x => { ITEMS[x.id] = { o: 1, x: 0, last: "o", date: "2026-09-30" }; });
      s = composeSheet(20); days.push("B:" + s.length);
      if (s.length !== 20) add("B 新しい問題が尽きた日に20問にならない " + s.length);
      if (dupes(s).length) add("B 同じ字が重なっている");
      /* C: 前日の✕（書き取り k7 が✕）。✕は1回だけ・復習に✕でない問題だけ */
      b = build(40, 20, 20, 20, false); reset(b, 40);
      ITEMS.k7 = { o: 0, x: 1, last: "x", date: "2026-10-01" }; KSTATS[b.kakiK[7]] = { kaki: { o: 0, x: 1, run: 0 } };
      s = composeSheet(20); days.push("C:" + s.length);
      if (s.length !== 20) add("C 20問にならない " + s.length);
      if (s.map(x => x.it.id).filter(i => i === "k7").length !== 1) add("C ✕の問題が1回だけ入っていない");
      if (dupes(s).length) add("C 同じ字が重なっている");
      /* D: 復習に回せる書き取りが少ない（〇の書き取りは3問だけ） */
      b = build(40, 6, 5, 4, false); reset(b, 3);
      b.kakiK.forEach(k => { KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } }; });
      s = composeSheet(20); days.push("D:" + s.length);
      if (dupes(s).length) add("D 同じ字が重なっている");
      if (s.length > 20) add("D 21問以上になった");
      /* E: きょう✕にした問題（翌日に回す）は、復習にも入れない。書き取りは5問だけ（k0〜k3 は〇、k4 がきょう✕）で、新しい別の語は無い */
      b = build(5, 6, 5, 4, false); reset(b, 4);
      b.kakiK.forEach(k => { KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } }; });   // 字はぜんぶ書けた（一巡のあと）
      ITEMS.k4 = { o: 0, x: 1, last: "x", date: "2026-10-02" };
      s = composeSheet(20); days.push("E:" + s.length);
      if (s.some(x => x.it.id === "k4")) add("E きょう✕にした問題が、復習で紙に出ている");
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
console.log("  日ごとの問数: " + r.days.join(" "));
r.ng.forEach(x => console.log("  NG " + x));
console.log(r.ng.length ? "\n✋ " + r.ng.length + " 件" : "\n★ 全部通りました");
await browser.close(); server.close();
process.exit(r.ng.length ? 1 : 0);
