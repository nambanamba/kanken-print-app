// 「テスト → 結果を登録 → 練習を印刷 → あしたのテストを印刷」の流れを見る（2026-10-07 ユーザー依頼）
//   node tools/check_same_day.mjs                  ← 入口の自己テスト → 本物
//   node tools/check_same_day.mjs --selftest       ← 自己テストだけ
//   node tools/check_same_day.mjs --shot <フォルダ> ← 本物で、画面と印刷の見本を撮る（公開しない場所に出すこと。ダミーの本）
// 見ること（ダミーの本・公開リポジトリなので本の文面は使わない）:
//   S1 紙を記録するまでは、続きのボタンが出ない
//   S2 きょう✕だった問題が、練習の紙に入る（✕だけ・きょうの紙の番号のまま）
//   S3 あしたの紙が、きょうの結果を反映している（✕の問題が入る・〇にした問題は入らない・20問・同じ字が重ならない）。記録（ITEMS/KSTATS/LOG）は書き換えない
//   S4 まとめて印刷 = 練習 → あしたのテスト の順。印刷し直しても同じ紙。おかわりの紙はあしたの紙と重ならない
//   S5 あした開くと、その紙が きょうの紙 になっていて、採点して記録できる。二重に記録しない（何度開き直しても）
//   S6 何日か開かなかったら、その紙は「◯月◯日の紙」として残る
//   S7 書き出しにあしたの紙が入る
// 自己テストの偽物: (a)直す前の版 (b)あしたを あした と読みかえない (c)採り入れたあと消さない (d)練習に〇の問題も入れる (e)あしたの紙を保存しない (f)見た目だけ→鳴らない (g)おかわりが あしたの紙と重なる
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST_ONLY = process.argv.includes("--selftest");
const SHOT = process.argv.includes("--shot") ? process.argv[process.argv.indexOf("--shot") + 1] : null;
const CR = String.fromCharCode(13);
const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").split(CR).join("");
const BEFORE = execFileSync("git", ["show", "b90b938:index.html"], { cwd: ROOT, maxBuffer: 1 << 28 }).toString("utf8").split(CR).join("");
function mutate(pairs, name) {
  let out = REAL;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) { console.error("✋ 偽物「" + name + "」を作れません。書きかえ元なし: " + from); process.exit(3); }
    out = out.split(from).join(to);
  }
  return out;
}
const FAKES = [
  ["(a) 直す前の版（つづきのボタンが無い）", BEFORE, true],
  ["(b) あしたの紙を組むとき「きょう」をあしたに読みかえない", mutate([["function todayStr(){ return DAY_OVERRIDE || ymd(new Date()); }", "function todayStr(){ return ymd(new Date()); }"]], "b"), true],
  ["(c) 採り入れたあと NEXT を消さない（二重に入る）", mutate([["  NEXT=null; save(K_NEXT,NEXT);\n}\nfunction todaySheet(){", "}\nfunction todaySheet(){"], ["if(SESSION && SESSION.nid && SESSION.nid===NEXT.nid){ NEXT=null; save(K_NEXT,NEXT); return; }", ""]], "c"), true],
  ["(d) 練習に〇の問題も入れる", mutate([["if(wrong){ var c=Object.assign({}, r);", "if(true){ var c=Object.assign({}, r);"]], "d"), true],
  ["(e) あしたの紙を保存しない（あした開いても出ない）", mutate([["  save(K_NEXT,NEXT);\n  return NEXT;", "  return NEXT;"]], "e"), true],
  ["(f) 見た目だけ変えた（中身は同じ）", mutate([["var DAY_OVERRIDE=null;", "var DAY_OVERRIDE = null;"]], "f"), false],
  ["(g) おかわりの紙が あしたの紙と重なる", mutate([["Object.keys(HOLD).forEach(function(id){ ex[id]=1; });", ""]], "g"), true],
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

/* ダミーの本（本の文面は使わない）。書き取り20字×3通り・部首・同じ読み・対義語 各12 */
const BOOK = () => {
  const P = KANJI_MASTER.map(r => r.k).filter(c => /^[一-鿿]$/.test(c));
  let pi = 0; const nk = () => P[pi++];
  const mk = (id, no, k) => ({ id, no, text: "テスト" + id, target: null, targetNth: 0, answers: [{ text: k, around: "□" + P[400] }], kanji: [k] });
  const chars = [], kaki = [];
  for (let j = 0; j < 20; j++) { const k = nk(); chars.push(k); for (let t = 0; t < 3; t++) kaki.push(mk("k" + j + "_" + t, j * 3 + t + 1, k)); }
  const bushu = [], onaji = [], taigi = [];
  for (let i = 0; i < 12; i++) { const ks = [nk(), nk(), nk()]; bushu.push({ id: "b" + i, no: i + 1, text: "ダミー", answers: ks.map(k => ({ text: k, around: "□" + P[401] })), kanji: ks }); }
  for (let i = 0; i < 12; i++) onaji.push(mk("o" + i, i + 1, nk()));
  for (let i = 0; i < 12; i++) taigi.push(mk("t" + i, i + 1, nk()));
  const U = (uid, f, items) => ({ unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))], groups: [{ gno: 0, field: f, instruction: "ダミー", items }] });
  BOOK_UNITS = [U("dr_01", "kaki", kaki), U("dr_02", "bushu", bushu), U("dr_03", "onaji", onaji), U("dr_04", "taigi", taigi)];
  window.isVerifiedUnit = () => true;
  window.print = () => { window.__printed = (window.__printed || 0) + 1; };
  window.alert = m => { (window.__alerts = window.__alerts || []).push(String(m)); };
  window.confirm = () => true;
  return chars;
};
/* 状態: 全部の字が一度〇（第2段階）。記録は localStorage にも書く */
const STATE = bookSrc => {
  const chars = (0, eval)("(" + bookSrc + ")")();
  ITEMS = {}; KSTATS = {}; WEAK = {}; LOG = []; RECORDS = {}; SESSION = null; NEXT = null;
  chars.forEach((k, j) => {
    KSTATS[k] = { kaki: { o: 1, x: 0, run: 1 } };
    ITEMS["k" + j + "_0"] = { o: 1, x: 0, last: "o", date: "2026-09-20" };
    if (j < 10) ITEMS["k" + j + "_1"] = { o: 1, x: 0, last: "o", date: "2026-09-21" };
  });
  save(K_ITEMS, ITEMS); save(K_KSTAT, KSTATS); save(K_WEAK, WEAK); save(K_LOG, LOG); save(K_REC, RECORDS); save(K_SESSION, SESSION); save(K_NEXT, NEXT);
  renderAll();
};

async function inspect(html) {
  SERVE = html;
  const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo", viewport: { width: 420, height: 900 } });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", e => errs.push(String(e))); page.on("dialog", d => d.accept());
  const open = async (day, init) => {
    await page.clock.setFixedTime(new Date(day + "T10:00:00+09:00"));
    await page.goto(base + "/index.html", { waitUntil: "networkidle" });
    if (init) await page.evaluate(STATE, BOOK.toString()); else await page.evaluate(BOOK);
    await page.evaluate(() => renderAll());
  };
  const tab = t => page.click('.tab[data-page="' + t + '"]');
  const snap = () => page.evaluate(() => JSON.stringify({ i: ITEMS, k: KSTATS, w: WEAK, l: LOG, r: RECORDS }));
  const r = await (async () => {
    const ng = [], add = s => ng.push(s), notes = [];
    try {
      /* ---- 1日目 10/05 ---- */
      await open("2026-10-05", true);
      await tab("kyou");
      const day1 = await page.evaluate(() => ({ ids: todaySheet().ids.slice(), n: todaySheetItems().length, after: (document.getElementById("after-box").innerHTML + document.getElementById("ky-after").innerHTML) }));
      notes.push("きょう " + day1.n + "問");
      if (day1.n !== 20) add("S0 きょうの紙が20問でない " + day1.n);
      if (day1.after.trim()) add("S1 記録する前から、つづきのボタンが出ている");
      await tab("kiroku");
      /* 先頭の2つを✕にして記録する */
      const wrongIds = await page.evaluate(() => {
        renderMarks();
        const els = [...document.querySelectorAll("#mark-box .mark")].slice(0, 2); els.forEach(e => e.click());
        return els.map(e => e.dataset.key.split("|")[0]);
      });
      await page.evaluate(() => saveSheetResult());
      const afterSave = await page.evaluate(() => ({ btn: !!document.getElementById("btn-both") && !!document.getElementById("btn-practice") && !!document.getElementById("btn-next"),
        practiceDisabled: document.getElementById("btn-practice").disabled, saved: SESSION.saved }));
      if (!afterSave.saved) add("S1 記録できていない");
      if (!afterSave.btn) add("S1 記録したあと、練習・あしたのテスト・まとめて のボタンが出ない");
      if (afterSave.practiceDisabled) add("S2 ✕があるのに、練習のボタンが押せない");
      const before = await snap();
      /* S2 練習の中身 */
      const pr = await page.evaluate(() => practiceBlocksOfToday().map(b => b.rows.map(r => ({ id: r.id, no: r.no }))).flat());
      if (pr.length !== 2 || pr.map(x => x.id).sort().join() !== wrongIds.slice().sort().join()) add("S2 練習が✕の問題だけになっていない " + JSON.stringify(pr) + " / ✕=" + wrongIds);
      const nos = await page.evaluate(() => todayPaperRows().filter(r => r.kanji.some(k => SESSION.results[markKey(r.id, k)] === "x")).map(r => r.no));
      if (pr.map(x => x.no).sort().join() !== nos.slice().sort().join()) add("S2 練習の番号が きょうの紙の番号と違う " + pr.map(x => x.no) + " / " + nos);
      /* S4 まとめて印刷 */
      await page.evaluate(() => printAfterTest("both"));
      const pbody = await page.evaluate(() => {
        const region = document.getElementById("print-region");
        const sheets = [...region.querySelectorAll(".p-sheet")];
        return { printed: window.__printed || 0, kinds: sheets.map(s => s.classList.contains("p-ansheet") ? (/れんしゅう/.test(s.textContent) ? "P" : "A") : "T"),
          dates: sheets.map(s => (s.querySelector(".p-sub") || {}).textContent || ""), nOnPractice: sheets.filter(s => /れんしゅう/.test(s.textContent)).length };
      });
      notes.push("印刷の並び " + pbody.kinds.join(""));
      const firstT = pbody.kinds.indexOf("T"), lastP = pbody.kinds.lastIndexOf("P");
      if (!pbody.printed) add("S4 印刷が呼ばれていない");
      if (pbody.kinds[0] !== "P" || firstT < 0 || lastP > firstT) add("S4 練習 → あしたのテスト の順になっていない " + pbody.kinds.join(""));
      if (!pbody.dates.some(d => /10月6日|2026-10-06/.test(d))) add("S4 あしたのテストの見出しの日付があしたになっていない " + JSON.stringify(pbody.dates));
      const nx = await page.evaluate(() => NEXT && ({ date: NEXT.date, ids: NEXT.ids.slice(), nid: NEXT.nid, from: NEXT.from }));
      if (!nx) add("S3 あしたの紙（NEXT）が作られていない");
      else {
        notes.push("あした " + nx.ids.length + "問");
        if (nx.date !== "2026-10-06") add("S3 あしたの紙の日付が 2026-10-06 でない " + nx.date);
        if (nx.ids.length !== 20) add("S3 あしたの紙が20問でない " + nx.ids.length);
        if (wrongIds.some(id => nx.ids.indexOf(id) < 0)) add("S3 きょう✕の問題が、あしたの紙に入っていない（今日の結果が反映されていない）");
        const okToday = day1.ids.filter(id => wrongIds.indexOf(id) < 0);
        if (okToday.some(id => nx.ids.indexOf(id) >= 0)) add("S3 きょう〇にした問題が、あしたの紙にも入っている");
        const dup = await page.evaluate(ids => { const idx = bookIndex(), seen = {}, d = []; ids.forEach(id => (idx[id].it.kanji || []).forEach(k => { if (seen[k]) d.push(k); seen[k] = 1; })); return d; }, nx.ids);
        if (dup.length) add("S3 あしたの紙で同じ字が重なっている " + dup.join(""));
      }
      if ((await snap()) !== before) add("S3 紙を作る・刷るだけで、記録（ITEMS/KSTATS/WEAK/LOG）が書き換わった");
      /* 印刷し直しても同じ紙 */
      await page.evaluate(() => printAfterTest("next"));
      const nx2 = await page.evaluate(() => NEXT && ({ ids: NEXT.ids.slice(), nid: NEXT.nid }));
      if (!nx2 || !nx || nx2.nid !== nx.nid || nx2.ids.join() !== nx.ids.join()) add("S4 印刷し直したら、あしたの紙が変わった");
      /* おかわりは、あしたの紙と重ならない */
      const ex = await page.evaluate(() => { startExtraSheet(); return SESSION.ids.slice(); });
      if (nx && ex.some(id => nx.ids.indexOf(id) >= 0)) add("S4 おかわりの紙が、あしたの紙と同じ問題を含む");
      /* おかわりを入れたせいで、きょうの紙の記録（SESSION）が置きかわるので、1日目の状態を作り直す */
      /* S7 書き出し */
      const exp = await page.evaluate(() => JSON.stringify(exportData().records[K_NEXT]) === JSON.stringify(NEXT));
      if (!exp) add("S7 書き出しに あしたの紙が入っていない");

      /* ---- 2日目 10/06（開き直す）。おかわりを出したあとなので、おかわりの紙は採点せず、あしたの紙になっているかを見る ---- */
      // おかわりの紙は未記録のまま日付が変わる → 「記録していない紙」が先に残る（今までの決まり）。ここでは1日目をやり直して、きれいな流れを見る
      await open("2026-10-05", true);
      await tab("kiroku");
      const w2 = await page.evaluate(() => { renderMarks(); const els = [...document.querySelectorAll("#mark-box .mark")].slice(0, 2); els.forEach(e => e.click()); saveSheetResult(); printAfterTest("both"); return NEXT.ids.slice(); });
      const S1 = await page.evaluate(() => localStorage.getItem(K_NEXT) !== null && JSON.parse(localStorage.getItem(K_NEXT)) && JSON.parse(localStorage.getItem(K_SESSION)).saved);
      if (!S1) add("S5 あしたの紙か記録が、保存されていない");
      const keepStore = await page.evaluate(() => { const o = {}; Object.keys(localStorage).filter(k => k.indexOf("kanken7_") === 0).forEach(k => { o[k] = localStorage.getItem(k); }); return o; });
      await open("2026-10-06", false);
      await tab("kyou");
      const d2 = await page.evaluate(() => ({ date: SESSION && SESSION.date, saved: SESSION && SESSION.saved, ids: SESSION && SESSION.ids.slice(), nextGone: NEXT === null,
        note: /前の日に印刷しておいた/.test(document.getElementById("ky-info").textContent), items: todaySheetItems().length }));
      if (d2.date !== "2026-10-06" || d2.saved || d2.ids.join() !== w2.join()) add("S5 あした開いたら、印刷したあしたの紙がきょうの紙になっていない " + JSON.stringify({ date: d2.date, saved: d2.saved, same: d2.ids && d2.ids.join() === w2.join() }));
      if (!d2.nextGone) add("S5 採り入れたあと NEXT が残っている");
      if (!d2.note) add("S5 「前の日に印刷しておいた」の案内が出ない");
      if (d2.items !== 20) add("S5 採点する問題が20問でない " + d2.items);
      const logBefore = await page.evaluate(() => LOG.length);
      await tab("kiroku");
      await page.evaluate(() => { renderMarks(); [...document.querySelectorAll("#mark-box .mark")].slice(0, 1).forEach(e => e.click()); saveSheetResult(); });
      const rec = await page.evaluate(() => ({ saved: SESSION.saved, log: LOG.length, items: Object.keys(ITEMS).filter(id => ITEMS[id].date === "2026-10-06").length, date: SESSION.date }));
      if (!rec.saved || rec.log - logBefore !== 20 || rec.items !== 20) add("S5 あしたの紙の採点が記録されていない " + JSON.stringify(rec) + " 履歴+" + (rec.log - logBefore));
      /* 二重に記録しない: 何度も開き直す・もう一度記録する・描き直す */
      const afterRec = await snap();
      await page.evaluate(() => { saveSheetResult(); renderAll(); renderAll(); });
      await open("2026-10-06", false);
      await page.evaluate(() => { renderAll(); todaySheet(); });
      const again = await page.evaluate(() => ({ log: LOG.length, nextNull: NEXT === null, sessionDate: SESSION.date, saved: SESSION.saved }));
      if ((await snap()) !== afterRec) add("S5 開き直したら、記録が変わった（二重に記録された）");
      if (again.log !== rec.log || !again.nextNull) add("S5 二重に入った " + JSON.stringify(again));
      // 同じ日の紙は、いったん記録したら、あしたの紙は あさって
      const nextAgain = await page.evaluate(() => { const n = ensureNext(false); return n && n.date; });
      if (nextAgain !== "2026-10-07") add("S5 2日目にも続きを出すと、あさってのぶんの紙になるはず " + nextAgain);

      /* ---- S6 何日か開かなかった ---- */
      await page.evaluate(ks => { Object.keys(localStorage).filter(k => k.indexOf("kanken7_") === 0).forEach(k => localStorage.removeItem(k)); Object.keys(ks).forEach(k => localStorage.setItem(k, ks[k])); }, keepStore);
      await open("2026-10-08", false);
      const d3 = await page.evaluate(() => ({ date: SESSION && SESSION.date, pending: sheetPending(), ids: SESSION && SESSION.ids.slice(), info: /10月6日の紙/.test(document.getElementById("ky-info").textContent) }));
      if (d3.date !== "2026-10-06" || !d3.pending || d3.ids.join() !== w2.join() || !d3.info) add("S6 何日か開かなかったとき、その紙が「10月6日の紙」として残っていない " + JSON.stringify({ date: d3.date, pending: d3.pending, info: d3.info }));
    } catch (e) { add("検査の途中で止まった " + String(e && e.message || e).split("\n")[0]); }
    return { ng, notes };
  })();
  await ctx.close();
  if (errs.length) r.ng.push("JSエラー " + errs.slice(0, 2).join("|"));
  return r;
}

async function shots(dir) {
  SERVE = REAL;
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo", viewport: { width: 420, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); page.on("dialog", d => d.accept());
  await page.clock.setFixedTime(new Date("2026-10-05T10:00:00+09:00"));
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await page.evaluate(STATE, BOOK.toString());
  await page.click('.tab[data-page="kiroku"]');
  await page.evaluate(() => { renderMarks(); [...document.querySelectorAll("#mark-box .mark")].slice(0, 2).forEach(e => e.click()); saveSheetResult(); });
  await page.locator("#page-kiroku").screenshot({ path: path.join(dir, "01_きろく_記録したあと.png") });
  await page.evaluate(() => printAfterTest("both"));
  await page.locator("#page-kiroku").screenshot({ path: path.join(dir, "02_きろく_あしたの紙を作ったあと.png") });
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: 794, height: 1123 });
  const sheets = await page.locator("#print-region .p-sheet").all();
  let i = 0;
  for (const s of sheets) { i++; if (i > 6) break; await s.screenshot({ path: path.join(dir, "03_印刷_" + String(i).padStart(2, "0") + ".png") }); }
  console.log("撮影: " + dir + "（" + Math.min(i, 6) + " 枚 + 画面2枚 / 印刷は全 " + sheets.length + " 枚）");
  await ctx.close();
}

if (SHOT) { await shots(SHOT); await browser.close(); server.close(); process.exit(0); }
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
console.log("  " + r.notes.join(" / "));
r.ng.forEach(x => console.log("  NG " + x));
console.log(r.ng.length ? "\n✋ " + r.ng.length + " 件" : "\n★ 全部通りました");
await browser.close(); server.close();
process.exit(r.ng.length ? 1 : 0);
