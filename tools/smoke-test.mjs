// index.html の1日ぶんの流れを、ヘッドレスブラウザで通しで確認する。
//
// 使い方:  node tools/smoke-test.mjs
//
// ★2026-09-11 に作り直した（旧版は tools/smoke-test-old.mjs。前半・申告の流れを前提にしていた）。
// 正しい流れ（ユーザーの指示。司令塔\回答\漢検_毎日の流れのやり直し_2026-09-11.md）:
//   紙に20問（★全部、本から）＝ 前日に✕だった問題 ＋ 次の問題
//   → 子どもが紙に書く → 父親が〇✕ → 「きろく」に入れる → 翌日 ＝ ✕の問題 ＋ 次の問題
//
// ★検査は「失敗の形」で書いてある（司令塔の指定）:
//   ・アプリが自分で作った問題が、紙にも画面にも1問でも出たら失敗
//   ・「書ける／あやしい」を押す画面が出たら失敗
//   ・前日に✕にした問題が、翌日の紙に出てこなかったら失敗
//   ・〇にした問題が、翌日また出たら失敗
//   ・紙の問題が、照合の通っていない単元から出たら失敗
//   ・1問ごとの出典（本の名前・ページ・問番号）が紙に出ていなかったら失敗
//   ⚠️ これは例示であって網羅ではない（D-14 追記）。紙は必ず撮って目で見ること。
//
// ⚠️ 本の問題文は使わない（このファイルは公開リポジトリに入る）。
//    検査用の単元は、ここで作った**ダミーの文面**で組む。

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOT = process.argv.includes("--shot");   // 画面と紙を撮る（出力は一時領域）

let chromium;
try { chromium = await getChromium(); }
catch (e) { console.error(e.message); process.exit(2); }

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const server = http.createServer((req, res) => {
  // Edge / Chrome は自分から /favicon.ico を取りに来る。404 だとコンソールにエラーが出るので 204
  if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }
  const f = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log("  OK   " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "  " + extra : "")); }
};

const browser = await launchBrowser(chromium);
console.log("ブラウザ:", browser._kankenChannel);
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("dialog", d => d.accept());

await page.goto(base + "/index.html", { waitUntil: "networkidle" });

console.log("\n=== 読みこみ ===");
ok("JSエラーが無い", errors.length === 0, errors.join(" | "));
const master = await page.evaluate(() => ({
  n: KANJI_MASTER.length, points: FIELDS.reduce((s, f) => s + f.points, 0)
}));
ok("漢字マスタが読めている（" + master.n + "字）", master.n > 0);
ok("配点の合計が満点と一致", master.points === 200, String(master.points));

/* ---------- ダミーの本を入れる ----------
   日割りの先頭2かたまりの単元を「照合ずみ」、3つ目を「未照合」にする。
   ★単元名を決め打ちしない（日割りの中身は DEFAULT_UNITS で変わる）。 */
const setup = await page.evaluate(() => {
  // アプリが自分で問題を作る関数を、呼ばれたら数えるようにする（1回でも呼ばれたら失敗）
  window.__genCalls = [];
  ["genKakusu", "genBushu", "genOnkun", "genKaki", "genYomi", "buildSession", "startSession", "printPractice"]
    .forEach(n => {
      if (typeof window[n] !== "function") return;
      const orig = window[n];
      window[n] = function () { window.__genCalls.push(n); return orig.apply(this, arguments); };
    });
  window.print = () => { window.__printed = (window.__printed || 0) + 1; };

  const pool = KANJI_MASTER.map(r => r.k);
  let ki = 0;
  function mk(uid, n, field) {
    const items = [];
    for (let i = 1; i <= n; i++) {
      const k = pool[ki++ % pool.length];
      items.push({ id: "q_test_" + uid + "_" + i, no: i, text: "ダミー問題 " + uid + "-" + i,
                   answers: [{ text: "ダミー答え" + i }], kanji: [k] });   // ★本物と同じく field は group にだけ持たせる
    }
    return { unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3)) || 1],
             groups: [{ gno: 0, field, instruction: "ダミーの指示文（" + uid + "）", items }] };
  }
  // 照合ずみ: 書き取り15・部首10（紙の分野）＋読み15（★アプリ側。紙に出たら失敗）
  // 未照合  : 書き取り15（紙に出たら失敗）
  const units = ["dr_08", "dr_25", "dr_09"], n0 = 15, n1 = 10, n2 = 15;
  window.__mk = mk;
  BOOK_UNITS = [mk("dr_01", 15, "yomi"), mk("dr_08", n0, "kaki"), mk("dr_09", n2, "kaki"), mk("dr_25", n1, "bushu")];
  window.__unverified = "dr_09";
  window.isVerifiedUnit = (id) => id !== "dr_09";
  // 状態をまっさらに
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null;
  window.__day = "2099-01-01";
  window.todayStr = () => window.__day;
  renderAll();
  return { units, n0, n1, n2 };
});
console.log("  （ダミー単元: " + setup.units.join(", ") + " / 問数 " + [setup.n0, setup.n1, setup.n2].join(", ") + "）");
ok("検査の前提: 照合ずみ2単元で20問を超える（20問で切れるかを見られる）", setup.n0 + setup.n1 > 20,
   String(setup.n0 + setup.n1));

console.log("\n=== 画面に「できる／できない」が無い ===");
await page.click('.tab[data-page="kyou"]');
const scr = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter(b => b.offsetParent !== null)
    .map(b => b.textContent.trim());
  return { btns, body: document.body.innerText };
});
ok("★「書ける」「あやしい」「読める」を押すボタンが無い",
   !scr.btns.some(t => /書ける|あやしい|読める|はじめる/.test(t)), scr.btns.join(" / "));
ok("★「まえはん」「えらぶ問題」が画面に無い", !/まえはん|えらぶ問題|こうはん/.test(scr.body));
ok("「きょうの紙を印刷」がある", scr.btns.some(t => /きょうの紙を印刷/.test(t)));

console.log("\n=== 1日目の紙 ===");
const d1 = await page.evaluate(() => {
  printSessionPractice();
  const region = document.getElementById("print-region");
  const trs = [...region.querySelectorAll(".p-body tr")];
  const blocks = buildPaperBlocks();
  const rows = blocks.flatMap(b => b.rows);
  return {
    n: trs.length,
    ids: rows.map(r => r.id),
    cites: trs.map(tr => tr.querySelector(".p-cite") ? tr.querySelector(".p-cite").textContent : ""),
    nos: trs.map(tr => tr.querySelector(".p-no").textContent.trim()),
    allBook: blocks.every(b => b.src === "book") && rows.every(r => /^q_test_/.test(r.id)),
    fromUnverified: rows.filter(r => r.id.indexOf("q_test_" + window.__unverified + "_") === 0).length,
    yomiOnPaper: rows.filter(r => r.field === "yomi" || r.id.indexOf("q_test_dr_01_") === 0).length,
    fields: rows.map(r => r.field),
    gen: window.__genCalls.slice(),
    printed: window.__printed || 0,
    kyouList: document.querySelectorAll("#ky-list tr").length
  };
});
ok("紙が出た（印刷が呼ばれた）", d1.printed === 1 && d1.n > 0, `${d1.printed} / ${d1.n}行`);
ok("★1日の紙は20問", d1.n === 20, String(d1.n));
ok("★紙の問題は全部、本の問題（アプリが作った問題が無い）", d1.allBook);
ok("★アプリの問題生成が1回も呼ばれていない", d1.gen.length === 0, d1.gen.join(","));
ok("★照合の通っていない単元の問題が出ていない", d1.fromUnverified === 0, String(d1.fromUnverified));
ok("★読みの問題が紙に1問も出ていない（読みはアプリ側）", d1.yomiOnPaper === 0, String(d1.yomiOnPaper));
ok("★紙は手で書く分野だけ（書き取り・部首・同じ読み・送りがな・対義語）",
   d1.fields.every(f => ["kaki", "bushu", "onaji", "okuri", "taigi"].includes(f)), [...new Set(d1.fields)].join(","));
ok("出せない分野の枠は、ほかの紙の分野で埋まっている（書き取り15＋部首5）",
   d1.fields.filter(f => f === "kaki").length === 15 && d1.fields.filter(f => f === "bushu").length === 5,
   `kaki ${d1.fields.filter(f => f === "kaki").length} / bushu ${d1.fields.filter(f => f === "bushu").length}`);

console.log("\n=== 配点比で混ぜる ===");
const mix = await page.evaluate(() => {
  const keepU = BOOK_UNITS, keepV = window.isVerifiedUnit, keepS = SESSION, keepI = ITEMS;
  BOOK_UNITS = keepU.concat([window.__mk("dr_26", 10, "onaji"), window.__mk("dr_23", 10, "okuri"),
                             window.__mk("dr_21", 10, "taigi"), window.__mk("dr_17", 10, "erabi"),
                             window.__mk("dr_19", 10, "kakusu")]);
  window.isVerifiedUnit = () => true;
  ITEMS = {};
  const c = {}; composeSheet().forEach(x => { const f = itemFieldOf(x.it, x.g); c[f] = (c[f] || 0) + 1; });
  const q = paperQuota(20);
  BOOK_UNITS = keepU; window.isVerifiedUnit = keepV; SESSION = keepS; ITEMS = keepI;
  return { c, q };
});
ok("★配点比の割り振りは 書き取り8・部首4・同じ読み3・送りがな3・対義語2",
   mix.q.kaki === 8 && mix.q.bushu === 4 && mix.q.onaji === 3 && mix.q.okuri === 3 && mix.q.taigi === 2 &&
   Object.keys(mix.q).length === 5, JSON.stringify(mix.q));
ok("★全分野がそろえば、紙はその割り振りどおりに混ざる",
   mix.c.kaki === 8 && mix.c.bushu === 4 && mix.c.onaji === 3 && mix.c.okuri === 3 && mix.c.taigi === 2,
   JSON.stringify(mix.c));
ok("★漢字えらび・画数（アプリ側）は紙に出ない", !mix.c.erabi && !mix.c.kakusu && !mix.c.yomi, JSON.stringify(mix.c));
ok("★1問ごとに出典が出ている（本の名前・ページ・問番号）",
   d1.cites.length === d1.n && d1.cites.every(c => /^（ドリル p\d+(-\d+)? の \d+）$/.test(c)),
   d1.cites.slice(0, 3).join(" "));
ok("番号は紙全体の通し番号（1〜20）", d1.nos.join(",") === Array.from({ length: d1.n }, (_, i) => i + 1).join(","),
   d1.nos.join(","));
ok("「きょう」の画面にも同じ問題数が並ぶ", d1.kyouList === d1.n, String(d1.kyouList));

console.log("\n=== その日の紙は固定（採点を入れても変わらない） ===");
const fix = await page.evaluate(() => {
  const before = todaySheetItems().map(x => x.it.id).join(",");
  // 3問目と7問目の字を✕にする（キーは「問題id|字」）
  renderMarks();
  const marks = [...document.querySelectorAll("#mark-box .mark")];
  const pick = [marks[2], marks[6]];
  pick.forEach(m => m.click());
  const after = todaySheetItems().map(x => x.it.id).join(",");
  const rows = todayPaperRows();
  return { same: before === after, nMarks: marks.length, xIds: [rows[2].id, rows[6].id],
           oIds: rows.filter((r, i) => i !== 2 && i !== 6).map(r => r.id),
           xShown: document.querySelectorAll("#mark-box .mark.x").length,
           citeInKiroku: /ドリル p\d+/.test(document.getElementById("mark-box").textContent) };
});
ok("✕を押しても、その日の紙の中身が変わらない", fix.same);
ok("「きろく」に紙と同じ数の〇が並ぶ", fix.nMarks === 20, String(fix.nMarks));
ok("✕が2つ付いた", fix.xShown === 2, String(fix.xShown));
ok("「きろく」にも出典が出ている（本と照らせる）", fix.citeInKiroku);

await page.evaluate(() => saveSheetResult());
const saved = await page.evaluate(() => ({
  items: Object.keys(ITEMS).length, x: Object.keys(ITEMS).filter(k => ITEMS[k].last === "x"),
  saved: SESSION.saved, again: (() => { const n = Object.keys(ITEMS).length; saveSheetResult();
    return Object.values(ITEMS).reduce((a, r) => a + r.o + r.x, 0); })()
}));
ok("記録: 20問ぶん問題ごとに残った", saved.items === 20, String(saved.items));
ok("記録: ✕の問題は2つ", saved.x.length === 2 && saved.x.every(id => fix.xIds.includes(id)), saved.x.join(","));
ok("同じ日に2回押しても二重に数えない", saved.again === 20, String(saved.again));

console.log("\n=== 2日目の紙 ===");
const d2 = await page.evaluate(() => {
  window.__day = "2099-01-02";
  renderAll();
  const rows = buildPaperBlocks().flatMap(b => b.rows);
  return { ids: rows.map(r => r.id), n: rows.length };
});
ok("★前日に✕にした問題が、翌日の紙に出ている", fix.xIds.every(id => d2.ids.includes(id)), d2.ids.slice(0, 3).join(","));
ok("★✕の問題が紙の先頭に来ている（できていない問題が優先）",
   d2.ids.slice(0, 2).sort().join() === fix.xIds.slice().sort().join(), d2.ids.slice(0, 2).join(","));
ok("★〇にした問題が、翌日また出ていない", !fix.oIds.some(id => d2.ids.includes(id)));
ok("2日目も、あれば20問まで出る（✕2＋次の問題）", d2.n === Math.min(20, 2 + (setup.n0 + setup.n1 - 20)), String(d2.n));

// 2日目: ✕の問題を〇にして記録 → 3日目には出ない
const d3 = await page.evaluate(() => {
  saveSheetResult();   // 全部〇
  window.__day = "2099-01-03";
  renderAll();
  return { ids: todaySheetItems().map(x => x.it.id) };
});
ok("★✕だった問題を〇にしたら、次の日は出ない", !fix.xIds.some(id => d3.ids.includes(id)), d3.ids.join(","));
ok("照合ずみの問題を全部やり終えたら、紙は空（足すために作らない）", d3.ids.length === 0, String(d3.ids.length));
const gen2 = await page.evaluate(() => window.__genCalls.slice());
ok("★ここまでアプリの問題生成が1回も呼ばれていない", gen2.length === 0, gen2.join(","));

console.log("\n=== 照合の取り下げ ===");
const wd = await page.evaluate((u0) => {
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null;
  window.__day = "2099-02-01";
  const keep = window.isVerifiedUnit;
  todaySheetItems();                                   // この日の紙が決まる
  window.isVerifiedUnit = (id) => id !== u0 && id !== window.__unverified;   // 途中で取り下げ
  const ids = todaySheetItems().map(x => x.it.id);
  window.isVerifiedUnit = keep;
  return { leaked: ids.filter(id => id.indexOf("q_test_" + u0 + "_") === 0).length };
}, setup.units[0]);
ok("★その日の途中で照合が取り下げられた単元は、紙から落ちる", wd.leaked === 0, String(wd.leaked));

console.log("\n=== 本でやった日の「できなかった字」 ===");
const bk = await page.evaluate(() => {
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null;
  window.__day = "2099-03-01";
  // 日割りの先頭で使っている字を1つ、「できなかった字」として入れる
  const x = bookAllItems()[3];
  const k = x.it.kanji[0];
  document.getElementById("b-wrong").value = k;
  saveDidInBook();
  window.__day = "2099-03-02";
  const ids = todaySheetItems().map(y => y.it.id);
  const hit = todaySheetItems().filter(y => y.it.kanji.includes(k)).length;
  return { k, hit, first: ids[0] === x.it.id };
});
ok("★本でやった日に入れた字が、次の紙に出る", bk.hit >= 1, bk.k);

console.log("\n=== 空の日 ===");
const empty = await page.evaluate(() => {
  const keep = window.isVerifiedUnit;
  window.isVerifiedUnit = () => false;
  SESSION = null; window.__day = "2099-04-01";
  document.getElementById("print-region").innerHTML = "<div>まえの紙</div>";
  printSessionPractice();
  const left = document.getElementById("print-region").innerHTML;
  window.isVerifiedUnit = keep;
  return { left };
});
ok("★出すものが無いとき、前に作った紙が残っていない", empty.left === "", empty.left.slice(0, 30));

console.log("\n=== 紙のはみ出し（★本物と同じくらい長い文で） ===");
// ⚠️ 2026-09-11、ダミーの短い文ではテストが通り、本物の紙は折り線を越えていた。
//    長さは本物の平文から測った値に合わせる（書き取り 中央15字・最大19字／部首 最大23字・答え4つ／注意 最大35字）。
//    ★測り方はアプリの sheetsFit とは別（D-13）: 印刷用CSSで組んだ紙の、行の下端と折り線の位置を比べる。
async function measurePaper(label, prep) {
  await page.evaluate(prep);
  await page.evaluate(() => printSessionPractice());
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: 794, height: 1123 });
  const m = await page.evaluate(() => {
    const sheets = [...document.querySelectorAll("#print-region .p-sheet")];
    return sheets.map(s => {
      const top = s.getBoundingClientRect().top;
      const fold = s.querySelector(".p-fold").getBoundingClientRect().top - top;
      const bottom = Math.max(...[...s.querySelectorAll(".p-body tr, .p-body .p-sec, .p-body .p-pool")]
        .map(e => e.getBoundingClientRect().bottom - top));
      const key = s.querySelector(".p-key");
      const rows = s.querySelectorAll(".p-body tr").length;
      const cites = s.querySelectorAll(".p-body .p-cite").length;
      return { h: Math.round(s.getBoundingClientRect().height), fold: Math.round(fold), bottom: Math.round(bottom),
               keyOver: key.scrollHeight - key.clientHeight, rows, cites };
    });
  });
  await page.emulateMedia({ media: null });
  const total = m.reduce((a, s) => a + s.rows, 0);
  ok(`${label}: 問題が折り線より上に収まっている（${m.length}枚・${total}問）`,
     m.every(s => s.bottom <= s.fold), m.map(s => `下端${s.bottom}/折り線${s.fold}`).join(" "));
  ok(`${label}: 1枚の高さがA4のまま（重なっていない）`, m.every(s => Math.abs(s.h - 1123) <= 2), m.map(s => s.h).join(","));
  ok(`${label}: 答えが答えの欄からはみ出していない`, m.every(s => s.keyOver <= 1), m.map(s => s.keyOver).join(","));
  ok(`${label}: どの行にも出典がある`, m.every(s => s.cites === s.rows), m.map(s => `${s.cites}/${s.rows}`).join(" "));
  return { m, total };
}
await page.evaluate(() => {
  const pool = KANJI_MASTER.map(r => r.k); let ki = 0;
  const long = (n) => "ながいぶんのダミー".repeat(4).slice(0, n);
  function mkL(uid, mat, pages, n, field, len, nAns, noteLen) {
    const items = [];
    for (let i = 1; i <= n; i++) {
      const ks = Array.from({ length: nAns }, () => pool[ki++ % pool.length]);
      items.push({ id: "q_long_" + uid + "_" + i, no: i, text: long(len - (i % 3)),
                   answers: ks.map((k, j) => ({ text: "こたえ" + j, around: nAns > 1 ? "□" : null })),
                   ruby: nAns > 1 ? ks.map(() => ({ yomi: "よみ" })) : [],
                   kanji: ks, note: (noteLen && i % 5 === 0) ? long(noteLen) : null });
    }
    return { unitId: uid, mat, srcPages: pages, groups: [{ gno: 0, field,
             instruction: { text: long(40), ruby: [] }, items }] };
  }
  window.__longUnits = [
    mkL("dr_08", "dr", [8], 15, "kaki", 19, 1, 35), mkL("dr_09", "dr", [9], 15, "kaki", 19, 1, 35),
    mkL("dr_10", "dr", [10], 15, "kaki", 19, 1, 0), mkL("dr_25", "dr", [25], 10, "bushu", 23, 4, 27),
    mkL("tn_08", "tn", [16, 17], 40, "kaki", 19, 1, 35)
  ];
  window.isVerifiedUnit = () => true;
});
await measurePaper("きょうの20問（書き取り16＋部首4）", () => {
  BOOK_UNITS = window.__longUnits; RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null;
  window.__day = "2099-06-01";
});
await measurePaper("1単元40問（ノート・2ページの回）", () => {
  BOOK_UNITS = window.__longUnits;
  SESSION = { v: SHEET_VERSION, date: todayStr(), ids: bookAllItems().filter(x => x.u.unitId === "tn_08").map(x => x.it.id), results: {}, saved: false };
});
await measurePaper("5分野そろった日（書き取り・部首・同じ読み・送りがな・対義語）", () => {
  const base = JSON.parse(JSON.stringify(window.__longUnits));
  const mkF = (uid, field, n) => { const u = JSON.parse(JSON.stringify(base[0])); u.unitId = uid; u.srcPages = [Number(uid.slice(3))];
    u.groups[0].field = field; u.groups[0].pool = field === "taigi" ? ["あさ", "がい", "さ", "ねん", "ぼう", "りょう"] : null;
    u.groups[0].items = u.groups[0].items.slice(0, n).map((it, i) => Object.assign({}, it, { id: "q_five2_" + uid + "_" + i,
      givenKanji: field === "okuri" ? KANJI_MASTER[i].k : undefined })); return u; };
  BOOK_UNITS = base.concat([mkF("dr_26", "onaji", 8), mkF("dr_23", "okuri", 8), mkF("dr_21", "taigi", 8)]);
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null; window.__day = "2099-06-03";
});
await measurePaper("✕の問題が5単元から来た日（見出しが多い）", () => {
  BOOK_UNITS = window.__longUnits; RECORDS = {}; WEAK = {}; KSTATS = {}; SESSION = null; ITEMS = {};
  ["dr_08", "dr_09", "dr_10", "dr_25", "tn_08"].forEach(u => [1, 2, 3, 4].forEach(i => { ITEMS["q_long_" + u + "_" + i] = { o: 0, x: 1, last: "x" }; }));
  window.__day = "2099-06-02";
});

console.log("\n=== 紙で解けるか（○の中の漢字・組の番号） ===");
const gv = await page.evaluate(() => {
  const u = { unitId: "dr_23", mat: "dr", srcPages: [23], groups: [
    { gno: 0, blockNo: 1, blockLabel: "(1)", field: "okuri", instruction: "ダミー（○の中の漢字）", items: [1, 2, 3].map(i => ({
      id: "q_gv_" + i, no: i, text: "ダミーの文 " + i, target: "文", answers: [{ text: "こたえ" }], kanji: [KANJI_MASTER[i].k], givenKanji: KANJI_MASTER[i].k })) },
    { gno: 0, blockNo: 2, blockLabel: "(2)", field: "okuri", instruction: "ダミー（○の中の漢字）", items: [1, 2].map(i => ({
      id: "q_gv2_" + i, no: i, text: "ダミーの文B " + i, target: "文", answers: [{ text: "こたえ" }], kanji: [KANJI_MASTER[10 + i].k], givenKanji: KANJI_MASTER[10 + i].k })) }
  ] };
  BOOK_UNITS = [u]; window.isVerifiedUnit = () => true; ITEMS = {}; SESSION = null; window.__day = "2099-06-10";
  printSessionPractice();
  const r = document.getElementById("print-region");
  return { given: [...r.querySelectorAll(".p-given")].map(e => e.textContent),
           want: u.groups.flatMap(g => g.items.map(i => i.givenKanji)),
           cites: [...r.querySelectorAll(".p-cite")].map(e => e.textContent) };
});
ok("★○の中の漢字（givenKanji）が、全部の問題で紙に出ている", gv.given.join("") === gv.want.join(""), gv.given.join("") + " / " + gv.want.join(""));
ok("★組が2つある単元は、出典に組の番号が入る（(1)の1 と (2)の1 を区別できる）",
   gv.cites.includes("（ドリル p23 (1) の 1）") && gv.cites.includes("（ドリル p23 (2) の 1）"), gv.cites.join(" "));

console.log("\n=== 1枚に収める（2枚目がスカスカにならない） ===");
// 司令塔のきまり: 「2枚目が5問以下なら1枚に収める（あふれた分は翌日）。本当に多いときは2枚でよい」
// 「注意」の付く問題の割合を変えて、1枚に入らない日を何通りか作る
const scen = [];
for (const every of [1, 2, 3, 4]) {
  scen.push(await page.evaluate((every) => {
    BOOK_UNITS = JSON.parse(JSON.stringify(window.__longUnits));
    BOOK_UNITS.forEach(u => u.groups.forEach(g => g.items.forEach((it, i) => { it.note = (i % every === 0) ? "ながいちゅういのダミー".repeat(4) : null; })));
    window.isVerifiedUnit = () => true;
    RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null; window.__day = "2099-06-1" + every;
    const composed = composeSheet().length;
    printSessionPractice();
    const r = document.getElementById("print-region");
    const perSheet = [...r.querySelectorAll(".p-sheet")].map(s => s.querySelectorAll(".p-body tr").length);
    return { every, composed, ids: SESSION.ids.length, perSheet, rows: perSheet.reduce((a, b) => a + b, 0),
             boxMM: SESSION.boxMM, slotH: r.querySelector(".p-slot").style.height };
  }, every));
}
const desc = scen.map(s => `注意${s.every}問に1つ: ${s.perSheet.join("+")}問/組んだ${s.composed}`).join(" ／ ");
ok("検査の前提: 削って1枚にする日が、少なくとも1つある", scen.some(s => s.perSheet.length === 1 && s.rows < s.composed), desc);
ok("★2枚目以降が5問以下の紙を出していない", scen.every(s => s.perSheet.length === 1 || s.perSheet.slice(1).every(n => n > 5)), desc);
ok("★1枚にしたときに削ったのは5問まで", scen.every(s => s.perSheet.length > 1 || s.composed - s.rows <= 5), desc);
ok("2枚に分けるときは、枚ごとの問数がそろっている（18＋2 のようにしない）",
   scen.every(s => s.perSheet.length === 1 || Math.max(...s.perSheet) - Math.min(...s.perSheet) <= 1), desc);
ok("紙と「きろく」の問題数が一致（削った問題は、その日の記録に入らない）", scen.every(s => s.ids === s.rows), desc);
// ★5分野そろう日に削るときは、配点の比を保ったまま全体を縮める（書き取りから先に削らない。司令塔判断）
const five = await page.evaluate(() => {
  // ★削り方（比の保ち方）だけを見るため、「1枚に入るのは17問まで」と決めて測る。
  //   紙の高さで決めると、ダミーの文の長さしだいで「削らずに入る」「6問以上あふれて2枚」になり、場面が作れない。
  //   紙の高さそのものは、上の「紙のはみ出し」で別に検査している。
  const base = JSON.parse(JSON.stringify(window.__longUnits));
  const mkF = (uid, field, n) => { const u = JSON.parse(JSON.stringify(base[0])); u.unitId = uid; u.srcPages = [Number(uid.slice(3))];
    u.groups[0].field = field; u.groups[0].items = u.groups[0].items.slice(0, n).map((it, i) => Object.assign({}, it, { id: "q_five_" + uid + "_" + i })); return u; };
  BOOK_UNITS = base.concat([mkF("dr_26", "onaji", 8), mkF("dr_23", "okuri", 8), mkF("dr_21", "taigi", 8)]);
  window.isVerifiedUnit = () => true; RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null; window.__day = "2099-06-20";
  const keepFit = window.sheetsFit;
  window.sheetsFit = (region) => region.querySelectorAll(".p-sheet").length === 1 && region.querySelectorAll(".p-body tr").length <= 17;
  const items = todaySheetItems();
  window.sheetsFit = keepFit;
  const c = {}; items.forEach(x => { const f = itemFieldOf(x.it, x.g); c[f] = (c[f] || 0) + 1; });
  const n = SESSION.ids.length;
  return { c, n, q: paperQuota(n), sheets: 1 };
});
ok("検査の前提: 5分野そろった日で、1枚に入る数（17問）まで削っている", five.n === 17, `${five.n}問`);
ok("★削っても、各分野の数は配点比のまま（書き取りを先に削っていない）",
   ["kaki", "bushu", "onaji", "okuri", "taigi"].every(f => (five.c[f] || 0) === Math.max(1, five.q[f])) , `${JSON.stringify(five.c)} / 比 ${JSON.stringify(five.q)}`);
ok("★削っても、どの分野も0問にならない", ["kaki", "bushu", "onaji", "okuri", "taigi"].every(f => (five.c[f] || 0) >= 1), JSON.stringify(five.c));
ok("★書き取りがいちばん多いまま", ["bushu", "onaji", "okuri", "taigi"].every(f => (five.c.kaki || 0) >= (five.c[f] || 0)), JSON.stringify(five.c));
const trimmed = scen.filter(s => s.perSheet.length === 1 && s.rows < s.composed);
ok("★削って1枚にした日も、書くマスは減らす前の問数で決まる高さのまま（小さくして詰め込んでいない）",
   trimmed.every(s => s.slotH === s.boxMM + "mm"), trimmed.map(s => `${s.slotH}/${s.boxMM}`).join(" "));

console.log("\n=== アプリでやる問題（読み・記号・画数） ===");
// ダミー: 読み15・漢字えらび10・じゅく語作り10・音訓10・画数10（すべて本の形式どおりの形）
await page.evaluate(() => {
  const pool = KANJI_MASTER.map(r => r.k); let ki = 0;
  const KANA = ["ア", "イ", "ウ", "エ", "オ"];
  function mkA(uid, n, field) {
    const items = [];
    for (let i = 1; i <= n; i++) {
      const it = { id: "q_app_" + uid + "_" + i, no: i, ruby: [], text: "アプリのダミー " + uid + "-" + i };
      if (field === "yomi") { it.answers = [{ text: "よみ" + i }]; it.kanji = [pool[ki++ % pool.length]]; }
      if (field === "kakusu") { it.text = pool[ki % pool.length]; it.answers = [{ text: String(3 + (i % 9)) }]; it.kanji = [pool[ki++ % pool.length]]; }
      if (field === "erabi") {
        const cs = [0, 1, 2].map(j => pool[ki + j]); ki += 3;
        it.choices = cs.map((c, j) => KANA[j] + " " + c); it.answers = [{ text: it.choices[i % 3] }]; it.kanji = [cs[i % 3]];
      }
      if (field === "jukugo") {
        const cs = [0, 1, 2, 3, 4].map(j => pool[ki + j]); ki += 5;
        it.text = "□" + pool[ki] + "・" + pool[ki] + "□";
        it.choices = cs.map((c, j) => KANA[j] + " " + c);
        it.answers = [{ text: it.choices[4], around: "□" + pool[ki] }, { text: it.choices[1], around: pool[ki] + "□" }];
        it.kanji = [cs[4], cs[1]];
      }
      if (field === "onkun") {
        it.text = pool[ki % pool.length]; it.ruby = [{ base: it.text, yomi: "よみ", nth: 1 }];
        it.choices = ["ア", "イ"]; it.answers = [{ text: i % 2 ? "ア" : "イ" }]; it.kanji = [pool[ki++ % pool.length]];
      }
      items.push(it);
    }
    // 画数は、本と同じく「図が要る問題（何画目）」を1問まぜる（アプリには出ない）
    if (field === "kakusu") items.push({ id: "q_app_" + uid + "_fig", no: 99, ruby: [], text: pool[0], needsFigure: true, answers: [{ text: "3" }], kanji: [pool[0]] });
    const ins = field === "onkun" ? "次の漢字の読みは、音読み（ア）ですか、訓読み（イ）ですか。記号で答えなさい。" : "ダミーの指示文（" + uid + "）";
    return { unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))], groups: [{ gno: 0, field, instruction: { text: ins, ruby: [] }, items }] };
  }
  window.__appUnits = [mkA("dr_01", 15, "yomi"), mkA("dr_17", 10, "erabi"), mkA("dr_19", 10, "kakusu"),
                       mkA("dr_20", 10, "onkun"), mkA("dr_54", 10, "jukugo")];
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null; APP_S = null;
  window.__day = "2099-07-01"; window.__genCalls = [];
  renderAll();
});
await page.click('.tab[data-page="kyou"]');

// いま出ている問題に答える（ok=true なら正解を、false ならまちがいを選ぶ）。画面のボタンを押す
async function answerCurrent(okWanted) {
  return await page.evaluate((okWanted) => {
    const s = APP_S, id = s.ids[s.pos], x = appIndex()[id], it = x.it, f = itemFieldOf(it, x.g);
    const box = document.getElementById("ap-box");
    const btn = (sel) => box.querySelector(sel);
    const info = { id, f, before: box.innerText };
    if (f === "yomi") {
      info.hadSelfBeforeShow = !!btn('[data-act="yomi-o"]');
      btn('[data-act="show"]').click();
      info.answerShown = document.getElementById("ap-box").innerText.includes(it.answers[0].text);
      document.getElementById("ap-box").querySelector(okWanted ? '[data-act="yomi-o"]' : '[data-act="yomi-x"]').click();
    } else if (f === "kakusu") {
      const want = parseInt(it.answers[0].text, 10);
      // ★全角で入れても読めること
      document.getElementById("ap-num").value = String(okWanted ? want : want + 1).replace(/\d/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
      btn('[data-act="num"]').click();
    } else {
      info.labels = [...box.querySelectorAll('[data-act="pick"]')].map(b => b.textContent);
      it.answers.forEach((a, i) => {
        const b2 = document.getElementById("ap-box");
        const btns = [...b2.querySelectorAll('[data-act="pick"]')];
        const body = choiceBody(a.text);
        const target = okWanted ? btns.find(b => choiceBody(it.choices[+b.dataset.ci]) === body)
                                : btns.find(b => choiceBody(it.choices[+b.dataset.ci]) !== body);
        target.click();
      });
    }
    info.res = APP_S.res[id];
    info.fb = document.getElementById("ap-box").innerText;
    document.getElementById("ap-box").querySelector('[data-act="next"]').click();
    return info;
  }, okWanted);
}
const a1 = await page.evaluate(() => {
  const s = todayApp(); const c = {};
  s.ids.forEach(id => { const y = appIndex()[id]; const f = itemFieldOf(y.it, y.g); c[f] = (c[f] || 0) + 1; });
  return { n: s.ids.length, c, allBook: s.ids.every(id => /^q_app_/.test(id)), q: appQuota(20),
           ordErabi: s.ids.filter(id => /dr_17/.test(id)).map(id => (s.ord[id] || []).join("")),
           ordOnkun: s.ids.filter(id => /dr_20/.test(id)).map(id => s.ord[id]) };
});
ok("アプリの問題は20問", a1.n === 20, String(a1.n));
ok("★アプリの問題は全部、本の問題", a1.allBook);
ok("★配点比 読み6・漢字えらび4・じゅく語作り4・音訓4・画数2",
   a1.c.yomi === 6 && a1.c.erabi === 4 && a1.c.jukugo === 4 && a1.c.onkun === 4 && a1.c.kakusu === 2, JSON.stringify(a1.c));
ok("★音訓は選択肢を並べ替えない", a1.ordOnkun.every(o => o === undefined), JSON.stringify(a1.ordOnkun));

const log = [];
for (let i = 0; i < 20; i++) log.push(await answerCurrent(i % 3 !== 0));   // 3問に1問はまちがえる
const yomiLog = log.filter(l => l.f === "yomi");
ok("★読み: 答えを見る前に「読めた／読めなかった」は押せない（ボタンが無い）", yomiLog.length > 0 && yomiLog.every(l => !l.hadSelfBeforeShow));
ok("★読み: 「こたえを見る」で答えが出る", yomiLog.every(l => l.answerShown));
ok("読み: 押したとおりに記録される", yomiLog.every((l, i) => l.res && typeof l.res.ok === "boolean"));
const pickLog = log.filter(l => l.f === "erabi" || l.f === "jukugo");
ok("★記号: 正解の中身を選べば〇・ちがう中身なら✕（記号ではなく中身で判定）",
   log.every((l, i) => l.res && l.res.ok === (i % 3 !== 0)), log.map(l => l.f + ":" + (l.res && l.res.ok)).join(" "));
ok("★記号（漢字えらび・じゅく語作り）: ボタンの記号は、画面の並び順に ア・イ・ウ… と振り直してある（本の記号を持ち回らない）",
   pickLog.length > 0 && pickLog.every(l => l.labels.every((t, i) => t.startsWith("アイウエオ"[i] + "　"))),
   pickLog.map(l => l.labels.join("/")).slice(0, 2).join(" | "));
const kkLog = log.filter(l => l.f === "kakusu");
ok("★図が要る問題を外した組では「図が要る問題はアプリでは出ません」と出す（指示文が出ていない問を指すため）",
   kkLog.length > 0 && kkLog.every(l => /図が要る問題は、アプリでは出ません/.test(l.before)));
ok("図が要る問題の無い組では、その一言を出さない", log.filter(l => l.f !== "kakusu").every(l => !/図が要る問題/.test(l.before)));
const onLog = log.filter(l => l.f === "onkun");
ok("★音訓: 選択肢はア（音読み）→イ（訓読み）の順のまま", onLog.every(l => l.labels.join("/") === "ア　音読み/イ　訓読み"), onLog.map(l => l.labels.join("/")).join(" | "));
ok("★音訓: 問題の字にルビ（読み）が出ている", onLog.every(l => /よみ/.test(l.before)));
ok("画数: 数字（全角でも）で答えられる", log.filter(l => l.f === "kakusu").every(l => l.res));
const end1 = await page.evaluate(() => document.getElementById("ap-box").innerText);
ok("20問おわると「おわり」になる", /おわり/.test(end1), end1.slice(0, 40));
ok("★「書ける」「あやしい」は出ていない", !log.some(l => /書ける|あやしい/.test(l.before + l.fb)));

// 2日目
const xIds = log.filter(l => l.res && !l.res.ok).map(l => l.id), oIds = log.filter(l => l.res && l.res.ok).map(l => l.id);
const a2 = await page.evaluate((xIds) => {
  const before = {}; xIds.forEach(id => { before[id] = (APP_S.ord[id] || []).join(""); });
  window.__day = "2099-07-02"; renderAll();
  const s = todayApp();
  return { ids: s.ids, sameOrd: xIds.filter(id => before[id] && s.ord[id] && s.ord[id].join("") === before[id]) };
}, xIds);
ok("★前日に✕だった問題が、翌日また出る", xIds.every(id => a2.ids.includes(id)), `${xIds.length}問`);
ok("★前日に〇だった問題は、翌日出ない", !oIds.some(id => a2.ids.includes(id)));
ok("★記号: 同じ問題を2回目に出したとき、選択肢の並びが前回と同じではない", a2.sameOrd.length === 0, a2.sameOrd.join(","));
const gen3 = await page.evaluate(() => window.__genCalls.slice());
ok("★アプリの問題でも、問題生成が1回も呼ばれていない", gen3.length === 0, gen3.join(","));

if (SHOT) {
  const out = path.join(os.tmpdir(), "kanken_shot");
  await page.setViewportSize({ width: 420, height: 900 });
  await page.evaluate(() => { APP_S = null; ITEMS = {}; window.__day = "2099-08-01"; renderAll();
    document.getElementById("ap-card").scrollIntoView(); });
  await page.screenshot({ path: path.join(out, "app_q.png"), fullPage: true });
}

ok("最後までJSエラーが無い", errors.length === 0, errors.join(" | "));

if (SHOT) {
  // 画面と紙を撮る。**出力は一時領域**（リポジトリに入れない）
  const out = path.join(os.tmpdir(), "kanken_shot");
  fs.mkdirSync(out, { recursive: true });
  await page.evaluate(() => {
    RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null;
    window.__day = "2099-05-01"; renderAll();
    const marks = [...document.querySelectorAll("#mark-box .mark")];
    renderMarks();
    [...document.querySelectorAll("#mark-box .mark")].slice(0, 2).forEach(m => m.click());
    saveSheetResult();
    window.__day = "2099-05-02"; renderAll();
  });
  await page.setViewportSize({ width: 420, height: 900 });
  await page.click('.tab[data-page="kyou"]');
  await page.screenshot({ path: path.join(out, "kyou.png"), fullPage: true });
  await page.click('.tab[data-page="kiroku"]');
  await page.screenshot({ path: path.join(out, "kiroku.png"), fullPage: true });
  await page.evaluate(() => printSessionPractice());
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.screenshot({ path: path.join(out, "paper.png"), fullPage: true });
  await page.emulateMedia({ media: null });
  console.log("\n撮影: " + out);
}

console.log(`\n${pass}/${pass + fail} 通過`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
