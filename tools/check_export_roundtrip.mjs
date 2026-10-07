// 引越し検査: 「全部の箱に値を入れる → 書き出す → 空のプロファイルで読み込む → localStorage が一致」（2026-10-03 ユーザー承認）
//   node tools/check_export_roundtrip.mjs            ← 入口の自己テスト → 本物
//   node tools/check_export_roundtrip.mjs --selftest ← 自己テストだけ
// 見ること:
//   1 index.html にある kanken7_* のキーを全部数え、「移す」か「移さない」かが決まっていること（新しい箱が増えたら、ここで止まる）
//   2 移すキーの箱に値を入れた端末 A で書き出し → 空の端末 B で読み込む → 移すキーが全部一致（受検日・1回の問数・目次・doneDays を含む）
//   3 合言葉の鍵は、ファイルにも B にも入らない。本が未読込なら、読み込みの完了で合言葉の案内が出る
//   4 古い形式（format 1・直す前の版 e7d38e8 が書いたファイル）も読める。そのとき受検日・1回の問数・目次は B のまま
//   5 読み込む前に戻す（undo）で、移すキーが読み込む前に戻る
// 自己テストの偽物: (a)直す前の版 (b)鍵もファイルに入れる (c)読み込みが設定を戻さない (d)古い形式が読めない (e)案内が出ない (f)見た目だけ→鳴らない
// ⚠️ ダミーの値だけ使う（本の文面は使わない）。
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELFTEST_ONLY = process.argv.includes("--selftest");
const BEFORE_FIX = "e7d38e8";   // format 1 の書き出しだった最後の版（コミットで固定）
const CR = String.fromCharCode(13);
const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").split(CR).join("");
const OLD = execFileSync("git", ["show", BEFORE_FIX + ":index.html"], { cwd: ROOT, maxBuffer: 1 << 28 }).toString("utf8").split(CR).join("");

/* 箱の分類。新しい kanken7_ のキーが index.html に増えたら、どちらかに足すまでこの検査は止まる */
const MOVED = ["items_v1", "kstats_v1", "weak_v1", "log_v1", "records_v1", "session_v1", "app_v1", "units_v1", "settings_v1", "next_sheet_v1", "last_saved_v1"].map(k => "kanken7_" + k);
const NOT_MOVED = {
  kanken7_qkey_v1: "合言葉の鍵（ファイルに入れない。入れるとファイルから本の問題が読める）",
  kanken7_import_backup_v1: "読み込む前の状態の控え（端末の中だけ）",
  kanken7_sheet_v1: "どこにも書かれない箱（読み出しだけ残っている）",
};

function mutate(src, pairs, name) {
  let out = src;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) { console.error("✋ 偽物「" + name + "」を作れません。書きかえ元なし: " + from); process.exit(3); }
    out = out.split(from).join(to);
  }
  return out;
}
const FAKES = [
  ["(a) 直す前の版（format 1・受検日と目次が移らない）", OLD, true],
  ["(b) 合言葉の鍵もファイルに入れる", mutate(REAL, [["EXPORT_KEYS.concat(EXPORT_KEYS_V2).forEach(function(k){ o.records[k]=load(k,null); });", "EXPORT_KEYS.concat(EXPORT_KEYS_V2).forEach(function(k){ o.records[k]=load(k,null); }); o.records[\"kanken7_qkey_v1\"]=load(\"kanken7_qkey_v1\",null);"]], "b"), true],
  ["(c) 読み込みが 受検日・1回の問数 を戻さない", mutate(REAL, [["if(typeof st.examDate===\"string\"", "if(false && typeof st.examDate===\"string\""]], "c"), true],
  ["(d) 古い形式（format 1）のファイルが読めない", mutate(REAL, [["(o.format!==1 && o.format!==2)", "(o.format!==2)"]], "d"), true],
  ["(e) 読み込みのあと、合言葉の案内が出ない", mutate(REAL, [["(bookLoaded() ? \"\" :", "(true ? \"\" :"]], "e"), true],
  ["(f) 見た目だけ変えた（中身は同じ）", mutate(REAL, [["var EXPORT_KEYS_V2=[K_UNITS];", "var EXPORT_KEYS_V2 = [K_UNITS];"]], "f"), false],
];

const MIME = { ".html": "text/html", ".js": "text/javascript" };
let SERVE = REAL;
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html";
  if (rel === "index.html") { res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" }); return res.end(SERVE); }
  if (rel === "old.html") { res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" }); return res.end(OLD); }
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;
const browser = await launchBrowser(await getChromium());

/* 端末 A の中身（全部の箱に値）。形は実際の保存と同じ。値はダミー */
const SECRET = "SECRET-KEY-DUMMY-0123";
const A_VALUES = {
  kanken7_items_v1: { q_a_1: { o: 2, x: 1, last: "x", date: "2026-10-01" }, q_a_2: { o: 1, x: 0, last: "o", date: "2026-09-30" } },
  kanken7_kstats_v1: { 甲: { kaki: { o: 2, x: 1, run: 0 } } },
  kanken7_weak_v1: { 甲: { wrong: 1, got: false, must: true, lastAt: 1790000000000 } },
  kanken7_log_v1: [{ t: 1790000000000, date: "2026-10-01", src: "paper", id: "q_a_1", f: "kaki", cite: "x", kanji: [{ k: "甲", ok: false }], extra: 0 }],
  kanken7_records_v1: { dr_01: { correct: 0, total: 0, field: "kaki", date: "2026-10-01", via: "sheet" } },
  kanken7_session_v1: { v: 6, date: "2026-10-02", ids: ["q_a_1"], results: { "q_a_1|甲": "x" }, saved: false, boxMM: 14 },
  kanken7_app_v1: { date: "2026-10-02", ids: ["a1"], pos: 1 },
  kanken7_next_sheet_v1: { v: 6, date: "2026-10-03", ids: ["q_a_2"], results: {}, saved: false, boxMM: 18, nid: "n1_1", from: "2026-10-02" },
  kanken7_last_saved_v1: { v: 6, date: "2026-10-02", savedOn: "2026-10-02", ids: ["q_a_1"], results: { "q_a_1|甲": "x" }, boxMM: 18 },
  kanken7_units_v1: [{ id: "dr_01", field: "kaki", pages: "3-4", qs: 9, label: "L", mat: "dr" }, { id: "x_custom", field: "kaki", pages: "1", qs: 3, label: "手直し", mat: "dr" }],
  kanken7_settings_v1: { examDate: "2026-11-14", appCount: 30, doneDays: ["2026-10-01", "2026-10-02"] },
  kanken7_qkey_v1: SECRET,
  kanken7_import_backup_v1: { at: "x", records: {} },
  kanken7_sheet_v1: { dummy: 1 },
};
/* 端末 C の中身（古い形式の読み込みで「触られない」ことを見る。A と全部ちがう） */
const C_VALUES = {
  kanken7_items_v1: { q_c_1: { o: 1, x: 0, last: "o", date: "2026-09-01" } },
  kanken7_units_v1: [{ id: "c_custom", field: "kaki", pages: "9", qs: 1, label: "C", mat: "dr" }],
  kanken7_settings_v1: { examDate: "2026-12-01", appCount: 40, doneDays: ["2026-09-01"] },
};

async function newPage(url) {
  const ctx = await browser.newContext();     // ★空のプロファイル（localStorage が空）
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", e => errs.push(String(e)));
  const dialogs = [];
  page.on("dialog", d => { dialogs.push(d.message()); d.accept(); });
  await page.goto(url, { waitUntil: "networkidle" });
  return { ctx, page, errs, dialogs };
}
async function fill(page, values) {
  await page.evaluate(v => { for (const [k, x] of Object.entries(v)) localStorage.setItem(k, JSON.stringify(x)); }, values);
  await page.reload({ waitUntil: "networkidle" });
}
const dump = page => page.evaluate(() => {
  const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o;
});
const same = (a, b) => JSON.stringify(sortKeys(JSON.parse(a))) === JSON.stringify(sortKeys(JSON.parse(b)));
function sortKeys(x) { return Array.isArray(x) ? x.map(sortKeys) : (x && typeof x === "object") ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sortKeys(x[k])])) : x; }

async function inspect(html) {
  SERVE = html;
  const ng = [], add = s => ng.push(s);
  // 1 箱の数え上げ
  const keys = [...new Set(REAL.match(/kanken7_[a-z_0-9]+_v\d/g))];
  keys.forEach(k => { if (!MOVED.includes(k) && !NOT_MOVED[k]) add("★新しい箱 " + k + " が増えた。移すか移さないかを、この検査に書いてください"); });
  MOVED.forEach(k => { if (!keys.includes(k)) add("検査の一覧にある箱 " + k + " が index.html に無い"); });

  // 2・3 A → B
  const A = await newPage(base + "/index.html");
  await fill(A.page, A_VALUES);
  const text = await A.page.evaluate(() => JSON.stringify(exportData(), null, 1));
  const aStore = await dump(A.page);
  await A.ctx.close();
  if (text.includes(SECRET)) add("★書き出したファイルに合言葉の鍵が入っている");
  const B = await newPage(base + "/index.html");
  const ok = await B.page.evaluate(t => importFromText(t), text);
  if (!ok) add("読み込みが完了しなかった（空の端末）");
  const bStore = await dump(B.page);
  MOVED.forEach(k => {
    if (!(k in bStore)) { add("★移っていない箱: " + k); return; }
    if (!same(aStore[k], bStore[k])) add("★値がちがう箱: " + k + "  A=" + aStore[k].slice(0, 80) + " B=" + bStore[k].slice(0, 80));
  });
  if ("kanken7_qkey_v1" in bStore) add("★合言葉の鍵が B に入っている");
  if (!B.dialogs.some(m => m.includes("合言葉"))) add("★読み込みの完了で、合言葉を入れる案内が出ない");
  // 画面に出ている受検日・目次が、読み込み直後に変わっているか（再読み込みなし）
  const live = await B.page.evaluate(() => ({ exam: SET.examDate, app: SET.appCount, hasCustom: UNITS.some(u => u.id === "x_custom") }));
  if (live.exam !== "2026-11-14" || live.app !== 30 || !live.hasCustom) add("★読み込み直後の画面の状態が戻っていない " + JSON.stringify(live));
  if (B.errs.length) add("JSエラー " + B.errs.join("|"));
  await B.ctx.close();

  // 4 古い形式（直す前の版が書いた format 1）→ C（受検日などは C のまま）
  const Aold = await newPage(base + "/old.html");
  await fill(Aold.page, A_VALUES);
  const oldText = await Aold.page.evaluate(() => JSON.stringify(exportData(), null, 1));
  await Aold.ctx.close();
  if (JSON.parse(oldText).format !== 1) add("検査の前提が崩れた（古い版の書き出しが format 1 でない）");
  const C = await newPage(base + "/index.html");
  await fill(C.page, C_VALUES);
  const cBefore = await dump(C.page);
  const okOld = await C.page.evaluate(t => importFromText(t), oldText);
  if (!okOld) add("古い形式（format 1）のファイルが読めない");
  else {
    const cAfter = await dump(C.page);
    ["kanken7_items_v1", "kanken7_kstats_v1", "kanken7_weak_v1", "kanken7_log_v1", "kanken7_records_v1", "kanken7_session_v1", "kanken7_app_v1"].forEach(k => {
      if (!(k in cAfter) || !same(A_VALUES[k] ? JSON.stringify(A_VALUES[k]) : "null", cAfter[k])) add("古い形式: 記録の箱がファイルの内容になっていない " + k);
    });
    if (!same(cBefore.kanken7_units_v1, cAfter.kanken7_units_v1)) add("★古い形式の読み込みが、この端末の目次を書きかえた");
    const sb = JSON.parse(cBefore.kanken7_settings_v1), sa = JSON.parse(cAfter.kanken7_settings_v1);
    if (sa.examDate !== sb.examDate || sa.appCount !== sb.appCount) add("★古い形式の読み込みが、この端末の受検日・1回の問数を書きかえた");
    if (JSON.stringify(sa.doneDays) !== JSON.stringify(A_VALUES.kanken7_settings_v1.doneDays)) add("古い形式: doneDays がファイルの内容になっていない");
    // 5 新しい形式を C に読み込んでから undo → 読み込む前（cAfter）に戻る
    const okNew = await C.page.evaluate(t => importFromText(t), text);
    const undone = okNew && await C.page.evaluate(() => undoImport());
    const cUndo = await dump(C.page);
    MOVED.forEach(k => {
      if ((k in cAfter) !== (k in cUndo) || (k in cAfter && !same(cAfter[k], cUndo[k]))) add("★読み込む前に戻しても元に戻らない箱: " + k);
    });
    if (!undone) add("読み込む前に戻せなかった");
  }
  if (C.errs.length) add("JSエラー " + C.errs.join("|"));
  await C.ctx.close();
  return ng;
}

console.log("=== 入口の自己テスト ===");
let selfFail = 0;
for (const [name, html, ring] of FAKES) {
  const ng = await inspect(html), rang = ng.length > 0, ok = rang === ring;
  if (!ok) selfFail++;
  console.log((ok ? "  OK " : "  NG ") + name + " → " + (rang ? "鳴った（" + ng.length + "件。例: " + ng[0] + "）" : "鳴らなかった"));
}
if (selfFail) { console.log("\n✋ 自己テストが " + selfFail + " 件落ちました。結果は出しません。"); await browser.close(); server.close(); process.exit(3); }
if (SELFTEST_ONLY) { await browser.close(); server.close(); process.exit(0); }
console.log("\n=== 本物の index.html ===");
const ng = await inspect(REAL);
ng.forEach(x => console.log("  NG " + x));
console.log(ng.length ? "\n✋ " + ng.length + " 件" : "\n★ 全部通りました（移すキー " + MOVED.length + " 個・移さないキー " + Object.keys(NOT_MOVED).length + " 個）");
await browser.close(); server.close();
process.exit(ng.length ? 1 : 0);
