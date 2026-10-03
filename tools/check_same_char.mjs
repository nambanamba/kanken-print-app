// 同じ日の紙に、同じ字を答えに持つ問題が2つ出ないか／出さない分で20問が欠けないかを見る（2026-10-03 ユーザー承認）。
//   node tools/check_same_char.mjs            ← 入口の自己テスト → 本物
//   node tools/check_same_char.mjs --selftest ← 自己テストだけ
// 見ること（ダミーの本）:
//   A 通常の日（書き取りは全部〇）: 分野をまたいだ重なり・同じ分野の中の重なり・部首の3字との重なりがあっても、重なり0・20問
//   B 一巡中の日（書き取りがまだ書けていない字を含む）: 書き取りとほかの分野の重なりがあっても、重なり0・20問
//   C 前日✕の問題どうしが同じ字: 1問だけ出る（もう1問は翌日へ）・重なり0・20問
//   ★どの日も 記録（ITEMS）を書き換えない
// 自己テストの偽物: (a)重なりを見ない（直す前）(b)飛ばした枠を埋めない (c)一巡中の組み方で見ない (d)✕どうしを見ない (e)見た目だけ→鳴らない
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST_ONLY = process.argv.includes("--selftest");
const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").split(String.fromCharCode(13)).join("");
function mutate(pairs, name) {
  let out = REAL;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) { console.error("✋ 偽物「" + name + "」を作れません。書きかえ元なし: " + from); process.exit(3); }
    out = out.split(from).join(to);
  }
  return out;
}
const FAKES = [
  ["(a) 同じ字の重なりを見ない（直す前と同じ）", mutate([["var x=cand[f][i]; if(charClash(x, usedC)) continue;", "var x=cand[f][i];"]], "a"), true],
  ["(b) 重なって飛ばした分の代わりを取らない", mutate([["var x=cand[f][i]; if(charClash(x, usedC)) continue;", "var x=cand[f][i]; if(charClash(x, usedC)) break;"], ["i<cand[f].length && nGot<left+retry.length", "i<0 && nGot<left+retry.length"]], "b"), true],
  ["(c) 一巡中の組み方で、重なりを見ない", mutate([["if(charClash(x, used)) return;", ""], ["if(charClash(x, used)){ i++; continue; }", ""]], "c"), true],
  ["(d) ✕の問題どうしの重なりを見ない", mutate([["if(charClash(x, usedC)) return false; charMark(x, usedC); return true;", "return true;"]], "d"), true],
  ["(e) 見た目だけ変えた（中身は同じ）", mutate([["function charsOf(x){ return (x.it.kanji||[]); }", "function charsOf(x){ return x.it.kanji || []; }"]], "e"), false],
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
      /* ダミーの本を、わざと重ねて作る */
      const mkB = (nK) => {
        const b = build(nK, 12, 12, 12, false);
        // onaji i と taigi i を同じ字に（i<6）／taigi 5 は taigi 4 と同じ字／部首 i の1字めを onaji i の字に（i<4）
        for (let i = 0; i < 6; i++) { b.taigi[i].answers[0].text = b.onaji[i].answers[0].text; b.taigi[i].kanji = [b.onaji[i].answers[0].text]; }
        b.taigi[5].answers[0].text = b.taigi[4].answers[0].text; b.taigi[5].kanji = [b.taigi[4].answers[0].text];
        for (let i = 0; i < 4; i++) { b.bushu[i].answers[0].text = b.onaji[i].answers[0].text; b.bushu[i].kanji[0] = b.onaji[i].answers[0].text; }
        return b;
      };
      /* A: 通常の日 */
      let b = mkB(40); reset(b, 40);
      b.kakiK.forEach(k => { KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } }; });
      let before = JSON.stringify(ITEMS);
      let s = composeSheet(20); days.push("A:" + s.length);
      if (s.length !== 20) add("A 20問にならない " + s.length);
      if (dupes(s).length) add("A 同じ字が重なっている " + dupes(s).join(""));
      if (JSON.stringify(ITEMS) !== before) add("A 記録（ITEMS）が書き換わった");
      /* A2: 書き取りも復習も無い日。重なりで飛ばした分は、次の候補で埋めて 部首6・同じ読み5・対義語4 の15問になる */
      b = mkB(0); reset(b, 0);   // 書き取りの本が無い日（第2段階の別の語も復習も無い）
      s = composeSheet(20); days.push("A2:" + s.length);
      const c2 = s.reduce((a, x) => { const f = itemFieldOf(x.it, x.g); a[f] = (a[f] || 0) + 1; return a; }, {});
      if (!(c2.bushu === 6 && c2.onaji === 5 && c2.taigi === 4 && s.length === 15)) add("A2 重なりで飛ばした分を次の候補で埋めていない " + JSON.stringify(c2));
      if (dupes(s).length) add("A2 同じ字が重なっている " + dupes(s).join(""));
      /* B: 一巡中（書き取りの字が、まだ書けていない） */
      b = mkB(40); reset(b, 0);
      b.kaki[0].answers[0].text = b.onaji[0].answers[0].text; b.kaki[0].kanji = [b.onaji[0].answers[0].text];   // 書き取り k0 と onaji 0 が同じ字
      b.kaki[1].answers[0].text = b.onaji[1].answers[0].text; b.kaki[1].kanji = [b.onaji[1].answers[0].text];
      s = composeSheet(20); days.push("B:" + s.length);
      if (!writeRoundActive()) add("B 一巡中になっていない（検査の前提が崩れた）");
      if (s.length !== 20) add("B 20問にならない " + s.length);
      if (dupes(s).length) add("B 同じ字が重なっている " + dupes(s).join(""));
      /* C: 前日✕の問題どうしが同じ字 */
      b = mkB(40); reset(b, 40);
      b.kakiK.forEach(k => { KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } }; });
      b.kaki[8].answers[0].text = b.kakiK[7]; b.kaki[8].kanji = [b.kakiK[7]];
      ITEMS.k7 = { o: 0, x: 1, last: "x", date: "2026-10-01" }; ITEMS.k8 = { o: 0, x: 1, last: "x", date: "2026-10-01" };
      s = composeSheet(20); days.push("C:" + s.length);
      if (s.length !== 20) add("C 20問にならない " + s.length);
      if (dupes(s).length) add("C 同じ字が重なっている " + dupes(s).join(""));
      if (s.filter(x => x.it.id === "k7" || x.it.id === "k8").length !== 1) add("C ✕どうしが重なる日は1問だけのはず " + s.filter(x => x.it.id === "k7" || x.it.id === "k8").length);
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
