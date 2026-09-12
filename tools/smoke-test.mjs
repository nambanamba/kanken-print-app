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
// ★出し直し（正解するまで）の画面を撮る。B-12「実機で、わざと間違えて、目で見る」ため
const SHOT_RETRY = process.argv.includes("--shot-retry");
const SHOT_PEEK = process.argv.includes("--shot-peek");   // 下見の画面を撮る

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
// ★照合ずみが書き取り・部首の2分野だけの日（司令塔の「失敗とみなすもの」の場面）。分野の上限（配点比＋1問）で止まる
const CAP = await page.evaluate(() => fieldCaps(PAPER_FIELDS, SHEET_TARGET));
ok("★照合ずみが2分野だけの日は、上限で止まる（書き取り11＋部首6＝17問。20問に埋めない）", d1.n === CAP.kaki + CAP.bushu && d1.n < 20, `${d1.n} / 上限 ${JSON.stringify(CAP)}`);
ok("★紙の問題は全部、本の問題（アプリが作った問題が無い）", d1.allBook);
ok("★アプリの問題生成が1回も呼ばれていない", d1.gen.length === 0, d1.gen.join(","));
ok("★照合の通っていない単元の問題が出ていない", d1.fromUnverified === 0, String(d1.fromUnverified));
ok("★読みの問題が紙に1問も出ていない（読みはアプリ側）", d1.yomiOnPaper === 0, String(d1.yomiOnPaper));
ok("★紙は手で書く分野だけ（書き取り・部首・同じ読み・対義語。送りがなは2026-09-11にアプリへ）",
   d1.fields.every(f => ["kaki", "bushu", "onaji", "taigi"].includes(f)), [...new Set(d1.fields)].join(","));
ok("★どの分野も上限を超えない（書き取り11・部首6）",
   d1.fields.filter(f => f === "kaki").length === CAP.kaki && d1.fields.filter(f => f === "bushu").length === CAP.bushu,
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
ok("★配点比の割り振りは 書き取り9・部首5・同じ読み4・対義語2（紙＝86点分）",
   mix.q.kaki === 9 && mix.q.bushu === 5 && mix.q.onaji === 4 && mix.q.taigi === 2 &&
   Object.keys(mix.q).length === 4, JSON.stringify(mix.q));
ok("★全分野がそろえば、紙はその割り振りどおりに混ざる",
   mix.c.kaki === 9 && mix.c.bushu === 5 && mix.c.onaji === 4 && mix.c.taigi === 2,
   JSON.stringify(mix.c));
ok("★送りがなは紙に1問も出ない（アプリへ移した）", !mix.c.okuri, JSON.stringify(mix.c));
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
ok("「きろく」に紙と同じ数の〇が並ぶ", fix.nMarks === d1.n, String(fix.nMarks));
ok("✕が2つ付いた", fix.xShown === 2, String(fix.xShown));
ok("「きろく」にも出典が出ている（本と照らせる）", fix.citeInKiroku);

await page.evaluate(() => saveSheetResult());
const saved = await page.evaluate(() => ({
  items: Object.keys(ITEMS).length, x: Object.keys(ITEMS).filter(k => ITEMS[k].last === "x"),
  saved: SESSION.saved, again: (() => { const n = Object.keys(ITEMS).length; saveSheetResult();
    return Object.values(ITEMS).reduce((a, r) => a + r.o + r.x, 0); })()
}));
ok("記録: 紙の問題ぶん、問題ごとに残った", saved.items === d1.n, String(saved.items));
ok("記録: ✕の問題は2つ", saved.x.length === 2 && saved.x.every(id => fix.xIds.includes(id)), saved.x.join(","));
ok("同じ日に2回押しても二重に数えない", saved.again === d1.n, String(saved.again));

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
ok("2日目: ✕2＋残りの本の問題（上限以内）", d2.n === Math.min(20, 2 + (setup.n0 + setup.n1 - d1.n)), String(d2.n));

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
      const bottom = Math.max(...[...s.querySelectorAll(".p-body tr, .p-body .p-sec, .p-body .p-pool, .p-body .p-example")]
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
    { gno: 0, blockNo: 1, blockLabel: "(1)", field: "kaki", instruction: "ダミー（○の中の漢字）", example: { text: "れいのダミー文", answers: ["れいのこたえ"], givenKanji: KANJI_MASTER[0].k }, items: [1, 2, 3].map(i => ({
      id: "q_gv_" + i, no: i, text: "ダミーの文 " + i, target: "文", answers: [{ text: "こたえ" }], kanji: [KANJI_MASTER[i].k], givenKanji: KANJI_MASTER[i].k })) },
    { gno: 0, blockNo: 2, blockLabel: "(2)", field: "kaki", instruction: "ダミー（○の中の漢字）", items: [1, 2].map(i => ({
      id: "q_gv2_" + i, no: i, text: "ダミーの文B " + i, target: "文", answers: [{ text: "こたえ" }], kanji: [KANJI_MASTER[10 + i].k], givenKanji: KANJI_MASTER[10 + i].k })) }
  ] };
  BOOK_UNITS = [u]; window.isVerifiedUnit = () => true; ITEMS = {}; SESSION = null; window.__day = "2099-06-10";
  printSessionPractice();
  const r = document.getElementById("print-region");
  return { given: [...r.querySelectorAll(".p-body tr .p-given")].map(e => e.textContent),   // 問題の行の○だけ（〈例〉の○は数えない）
           want: u.groups.flatMap(g => g.items.map(i => i.givenKanji)),
           cites: [...r.querySelectorAll(".p-cite")].map(e => e.textContent),
           examples: [...r.querySelectorAll(".p-example")].map(e => e.textContent) };
});
ok("★○の中の漢字（givenKanji）が、全部の問題で紙に出ている", gv.given.join("") === gv.want.join(""), gv.given.join("") + " / " + gv.want.join(""));
ok("★本の〈例〉が紙に出ている（〈例〉のある組の数だけ・中身つき）", gv.examples.length === 1 && /れいのダミー文/.test(gv.examples[0]) && /れいのこたえ/.test(gv.examples[0]), JSON.stringify(gv.examples));
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
    const slotHs = [...new Set([...r.querySelectorAll(".p-slot")].map(e => e.style.height))];
    // 最後の1枚以外は「入るだけ詰まっている」か: その枚に次の1問を足すと入らないこと（測って確かめる）
    const blocks = buildPaperBlocks(); let from = 0, packedFull = true;
    BOX_OVERRIDE = DAILY_BOX_MM;
    perSheet.slice(0, -1).forEach(n => { r.innerHTML = renderSheet(sliceBlocks(blocks, from, from + n + 1), 1, 2); if (sheetsFit(r)) packedFull = false; from += n; });
    BOX_OVERRIDE = null; r.innerHTML = "";
    return { every, composed, ids: SESSION.ids.length, perSheet, rows: perSheet.reduce((a, b) => a + b, 0), slotHs, packedFull };
  }, every));
}
const desc = scen.map(s => `注意${s.every}問に1つ: ${s.perSheet.join("+")}問/組んだ${s.composed}`).join(" ／ ");
// ★2026-09-11 ユーザー指示「書き問題20問、なければそこまで」→ 20問は削らない。入らなければ2枚（司令塔の「1枚に収める」より優先）
ok("★1枚に収めるために削らない（組んだ数＝紙の問数）。組む数は分野の上限まで", scen.every(s => s.rows === s.composed && s.composed <= 20), desc);
ok("検査の前提: 1枚に入らず2枚になる日がある（2枚の組み方を見られる）", scen.some(s => s.perSheet.length === 2), desc);
ok("空の紙を出さない", scen.every(s => s.perSheet.every(n => n > 0)), desc);
// ★ユーザー指示「書くところは大きめ・枚数は問わない」→ 毎日の紙はマスを大きく固定し、1枚目から入るだけ詰める
ok("★毎日の紙の書くマスは、大きいまま（どの日も同じ高さ・小さくして詰め込まない）",
   scen.every(s => s.slotHs.length === 1 && s.slotHs[0] === "18mm"), scen.map(s => s.slotHs.join("/")).join(" "));
ok("2枚以上のときは、1枚目から入るだけ詰めている（半分空いた紙を出さない）", scen.every(s => s.packedFull), desc);
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
const PAPER_FIELDS_T = ["kaki", "bushu", "onaji", "taigi"];
ok("★1枚に17問しか入らない日も、20問は削らない", five.n === 20, `${five.n}問`);
ok("★各分野の数は配点比のまま",
   PAPER_FIELDS_T.every(f => (five.c[f] || 0) === Math.max(1, five.q[f])) , `${JSON.stringify(five.c)} / 比 ${JSON.stringify(five.q)}`);
ok("★どの分野も0問にならない", PAPER_FIELDS_T.every(f => (five.c[f] || 0) >= 1), JSON.stringify(five.c));
ok("★書き取りがいちばん多いまま", ["bushu", "onaji", "taigi"].every(f => (five.c.kaki || 0) >= (five.c[f] || 0)), JSON.stringify(five.c));
// ★前の版で組んだ「まだ記録していない」きょうの紙は、作り直す（送りがなが紙から外れた・20問を削らない、の反映）。
//   記録ずみの紙は作り直さない（記録と紙がずれるため）
const rebuild = await page.evaluate(() => {
  BOOK_UNITS = window.__longUnits; window.isVerifiedUnit = () => true; RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {};
  window.__day = "2099-06-30";
  const some = bookAllItems().slice(0, 12).map(x => x.it.id);
  SESSION = null; const fresh = composeSheet().length;
  SESSION = { v: 4, date: todayStr(), ids: some, results: {}, saved: false };
  const a = todaySheetItems().length;
  SESSION = { v: 4, date: todayStr(), ids: some, results: {}, saved: true };
  const b = todaySheetItems().length;
  return { a, b, fresh };
});
ok("★前の版の、まだ記録していないきょうの紙は作り直す（いまの決まりで組んだ数になる）", rebuild.a === rebuild.fresh && rebuild.a !== 12, `${rebuild.a} / ${rebuild.fresh}`);
ok("前の版でも、記録ずみのきょうの紙は作り直さない", rebuild.b === 12, String(rebuild.b));

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
    const ins = field === "onkun" ? "ダミーの指示: 音読み（ア）／訓読み（イ）"   /* ★本の指示文をそのまま書かない（公開リポジトリ）。アプリが見る「音読み（ア）」「訓読み（イ）」だけを含む */ : "ダミーの指示文（" + uid + "）";
    const example = field === "onkun" ? { text: "れいの字", answers: ["イ"], ruby: [] }
      // ★dr_19 と同じ形: 〈例〉が2つあり range で出し分ける。出す問（1〜10）に合う〈例〉だけが出ること（claude-e0 No.26）
      : field === "kakusu" ? [{ text: "あうれい", answers: ["3"], range: [1, 10] }, { text: "あわないれい", answers: ["6"], range: [90, 99] }] : null;
    return { unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))], groups: [{ gno: 0, field, instruction: { text: ins, ruby: [] }, example, items }] };
  }
  // 送りがな（本と同じ形: ——線はカタカナ、答えは「○の漢字＋送りがな」）。ことばはどれも一般の語
  const OK = [["正","タダシイ","正しい"],["付","ツケル","付ける"],["養","ヤシナウ","養う"],["争","アラソウ","争う"],["連","ツラナル","連なる"],
              ["表","アラワス","表す"],["加","クワワル","加わる"],["浅","アサイ","浅い"],["伝","ツタエル","伝える"],["失","ウシナウ","失う"],
              ["群","ムラガル","群がる"],["教","オシエル","教える"]];
  const okuriUnit = { unitId: "dr_23", mat: "dr", srcPages: [23], groups: [{ gno: 0, field: "okuri",
    instruction: { text: "ダミー（○の中の漢字と送りがな）", ruby: [] }, example: null,
    items: OK.map(([k, t, a], i) => ({ id: "q_app_okuri_" + (i + 1), no: i + 1, ruby: [], text: "ダミー" + t + "。", target: t,
      givenKanji: k, answers: [{ text: a }], kanji: [k] })) }] };
  window.__okuriUnit = okuriUnit;
  window.__appUnits = [mkA("dr_01", 15, "yomi"), mkA("dr_17", 10, "erabi"), mkA("dr_19", 10, "kakusu"),
                       mkA("dr_20", 10, "onkun"), mkA("dr_54", 10, "jukugo"), okuriUnit];
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; SESSION = null; APP_S = null;
  window.__day = "2099-07-01"; window.__genCalls = [];
  renderAll();
});
await page.click('.tab[data-page="kyou"]');

// いま出ている問題に答える（ok=true なら正解を、false ならまちがいを選ぶ）。画面のボタンを押す
async function answerCurrent(okWanted) {
  return await page.evaluate((okWanted) => {
    const s = APP_S, id = s.ids[s.pos], x = appIndex()[id], it = x.it, f = itemFieldOf(it, x.g), CH = appChoicesOf(it, f);
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
        const target = okWanted ? btns.find(b => choiceBody(CH[+b.dataset.ci]) === body)
                                : btns.find(b => choiceBody(CH[+b.dataset.ci]) !== body);
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
ok("★配点比どおり（読み・漢字えらび・じゅく語作り・音訓・画数・送りがな）",
   Object.keys(a1.q).every(f => (a1.c[f] || 0) === a1.q[f]) && a1.c.okuri >= 1, JSON.stringify(a1.c) + " / " + JSON.stringify(a1.q));
ok("★音訓は選択肢を並べ替えない", a1.ordOnkun.every(o => o === undefined), JSON.stringify(a1.ordOnkun));

const log = [];
// ★別画面・のこり何問・続きから（ユーザー指示「アプリでやる、は、別画面にして、あと何問とか」）
const en0 = await page.evaluate(() => ({ entry: document.getElementById("ap-entry").innerText,
  appVisible: document.getElementById("page-app").classList.contains("active") }));
ok("★きょう画面には入口のボタンだけ（のこり20問）。問題は出さない", /のこり 20問/.test(en0.entry) && !en0.appVisible, en0.entry.slice(0, 60));
await page.evaluate(() => openApp());
const op = await page.evaluate(() => ({ active: document.getElementById("page-app").classList.contains("active"),
  kyou: document.getElementById("page-kyou").classList.contains("active"), top: document.querySelector("#ap-box .ap-top").innerText }));
ok("★押すと専用の画面になる（きょう画面は隠れる）", op.active && !op.kyou);
ok("★上に「1 / 20」と「のこり 20 問」", op.top.includes("1 / 20") && /のこり\s*20\s*問/.test(op.top), op.top);
for (let i = 0; i < 3; i++) log.push(await answerCurrent(i % 3 !== 0));
const mid3o = await page.evaluate(() => ({ top: document.querySelector("#ap-box .ap-top").innerText, n: APP_S.ids.length, pos: APP_S.pos }));
const mid3 = mid3o.top;
// ★3問のうち1問をまちがえたので、その1問が列にもどって 20→21 問になる（2026-09-12「正解するまで出し直す」）
ok("★答えるたびに「のこり」が減る（3問答えて、まちがえた1問がもどるので 21問中のこり18）",
   mid3o.n === 21 && mid3.includes("4 / 21") && /のこり\s*18\s*問/.test(mid3), mid3 + " / n=" + mid3o.n);
await page.evaluate(() => closeApp());
const back = await page.evaluate(() => ({ entry: document.getElementById("ap-entry").innerText,
  kyou: document.getElementById("page-kyou").classList.contains("active") }));
ok("★途中でやめてきょう画面に戻れる。入口は「つづきから・のこり18問」", back.kyou && /つづきから/.test(back.entry) && /のこり 18問/.test(back.entry), back.entry.slice(0, 60));
await page.evaluate(() => openApp());
const re = await page.evaluate(() => document.querySelector("#ap-box .ap-top").innerText);
ok("★もう一度開くと、続きから（4問目）", re.includes("4 / 21"), re);
// ★おわりまで答える。3問に1問はまちがえるので、まちがえた分は列にもどって出し直しになる。
//   「20回」ではなく **列が尽きるまで** 回す（出し直しで列が伸びるため）。i は通しの番号（まちがえる位置は変えない）
let rtGuard = 0;
while (await page.evaluate(() => APP_S.pos < APP_S.ids.length) && rtGuard++ < 200) {
  log.push(await answerCurrent(log.length % 3 !== 0));
}
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
// ダミーの画数: 〈例〉の range が [1,10]（出す問）と [90,99]（図の要る問 no.99）。指示文は1つ（本と同じ形）
ok("★図の要る問題を外した組で、指示文が分かれていないときは「どの番号が出ないか・いまはどの番号か」を書く",
   kkLog.length > 0 && kkLog.every(l => /90〜99 の問題は図が要るので、アプリでは出ません/.test(l.before) && /いまは 1〜10 の問題です/.test(l.before)),
   kkLog.map(l => l.before.slice(0, 120)).slice(0, 1).join(""));
ok("図が要る問題の無い組では、その一言を出さない", log.filter(l => l.f !== "kakusu").every(l => !/図が要る/.test(l.before)));
// ★指示文が範囲ごとに分かれている（instructionByRange）ときは、その問の範囲の指示文だけを出し、図の一言も出さない
const ibr = await page.evaluate(() => {
  const g = { field: "kakusu", instruction: { text: "ふたつまとめたしじぶん", ruby: [] },
    instructionByRange: [{ range: [1, 13], text: "なんかくめのしじ", ruby: [] }, { range: [14, 26], text: "そうかくすうのしじ", ruby: [] }],
    example: [{ text: "れい1", answers: ["3"], range: [1, 13] }, { text: "れい2", answers: ["6"], range: [14, 26] }],
    items: [{ no: 3, needsFigure: true }, { no: 15 }] };
  return { ins15: instructionFor(g, 15), note15: figureNote(g, 15), ins3: instructionFor(g, 3), note3: figureNote(g, 3),
           plain: instructionFor({ instruction: { text: "ふつうのしじ", ruby: [] } }, 5) };
});
ok("★instructionByRange があれば、その問の範囲の指示文だけ（総画数の問に「太い画」の文を出さない）",
   ibr.ins15 === "そうかくすうのしじ" && ibr.ins3 === "なんかくめのしじ" && ibr.plain === "ふつうのしじ", JSON.stringify(ibr));
ok("★指示文が分かれていれば、図の要らない範囲（総画数）には「図が要る」の一言を出さない", ibr.note15 === "" && /1〜13 のうち 1問は、アプリに出せません/.test(ibr.note3), JSON.stringify(ibr));
const onLog = log.filter(l => l.f === "onkun");
ok("★音訓: 選択肢はア（音読み）→イ（訓読み）の順のまま", onLog.every(l => l.labels.join("/") === "ア　音読み/イ　訓読み"), onLog.map(l => l.labels.join("/")).join(" | "));
ok("★アプリ: 本の〈例〉が画面に出ている（〈例〉のある組）", onLog.every(l => /〈例〉 れいの字 → イ/.test(l.before)), onLog.map(l => l.before.slice(0, 80)).slice(0, 1).join(""));
ok("アプリ: 〈例〉の無い組には〈例〉を出さない", log.filter(l => l.f !== "onkun" && l.f !== "kakusu").every(l => !/〈例〉/.test(l.before)));
const kk2 = log.filter(l => l.f === "kakusu");
ok("★アプリ: 〈例〉が2つある組では、出している問の range に合う〈例〉だけを出す（合わない〈例〉は出さない）",
   kk2.length > 0 && kk2.every(l => /あうれい → 3/.test(l.before) && !/あわないれい/.test(l.before)), kk2.map(l => l.before.slice(0, 90)).slice(0, 1).join(""));
ok("★音訓: 問題の字にルビ（読み）が出ている", onLog.every(l => /よみ/.test(l.before)));
ok("画数: 数字（全角でも）で答えられる", log.filter(l => l.f === "kakusu").every(l => l.res));
const end1 = await page.evaluate(() => document.getElementById("ap-box").innerText);
ok("★やり直しもふくめて ぜんぶ おわると「おわり」になる", /おわり/.test(end1), end1.slice(0, 40));
ok("★おわりの画面に正解数を出さない", !/\d+\s*問/.test(end1) && !/せいかい\s*\d/.test(end1), end1.slice(0, 80));
ok("まちがえた問題があった日は「あした もう一回出るよ」", /あした もう一回出るよ/.test(end1), end1.slice(0, 80));
const en2 = await page.evaluate(() => { closeApp(); return document.getElementById("ap-entry").innerText; });
ok("おわったあとの入口は「おわり」と出る", /おわり/.test(en2), en2.slice(0, 40));
ok("★「書ける」「あやしい」は出ていない", !log.some(l => /書ける|あやしい/.test(l.before + l.fb)));

// 2日目
// ★出し直しで同じ id が log に何度も出る。「〇の問題」は **一度も✕になっていない** ものだけ（2026-09-12）
const xIds = [...new Set(log.filter(l => l.res && !l.res.ok).map(l => l.id))];
const oIds = [...new Set(log.filter(l => l.res && l.res.ok).map(l => l.id))].filter(id => !xIds.includes(id));
const a2 = await page.evaluate((xIds) => {
  const before = {}; xIds.forEach(id => { before[id] = (APP_S.ord[id] || []).join(""); });
  window.__day = "2099-07-02"; renderAll();
  const s = todayApp();
  return { ids: s.ids, sameOrd: xIds.filter(id => before[id] && s.ord[id] && s.ord[id].join("") === before[id]) };
}, xIds);
ok("★前日に✕だった問題が、翌日また出る", xIds.every(id => a2.ids.includes(id)), `${xIds.length}問`);
ok("★前日に〇だった問題は、翌日出ない", !oIds.some(id => a2.ids.includes(id)));
ok("★記号: 同じ問題を2回目に出したとき、選択肢の並びが前回と同じではない", a2.sameOrd.length === 0, a2.sameOrd.join(","));
console.log("");
console.log("=== 送りがな（アプリ・3択） ===");
const ok1 = await page.evaluate(() => {
  const plan = okuriPlan(), u = window.__okuriUnit;
  const res = u.groups[0].items.map(it => { const q = plan[it.id] || {}; return { ans: it.answers[0].text, K: it.givenKanji, choices: q.choices, skip: q.skip, pattern: q.pattern }; });
  const onPaper = bookAllItems().filter(x => itemFieldOf(x.it, x.g) === "okuri").length;
  return { res, bias: okuriBias(), onPaper };
});
const okRes = ok1.res.filter(r => r.choices);
ok("検査の前提: 送りがなの問題に選択肢ができている", okRes.length >= 10, `${okRes.length}/${ok1.res.length}`);
ok("★送りがな: 紙には1問も出ない", ok1.onPaper === 0, String(ok1.onPaper));
ok("★送りがな: 正解は本のデータのまま（選択肢の1つめ＝本の答え）", okRes.every(r => r.choices[0] === r.ans));
ok("★送りがな: まちがいは切れ目をずらしただけ（○の漢字＋かな・正解と別）",
   okRes.every(r => r.choices.slice(1).every(c => c[0] === r.K && /^[ぁ-ゖ]+$/.test(c.slice(1)) && c !== r.ans)), okRes.map(r => r.choices.join("/")).slice(0, 3).join(" | "));
ok("★送りがな: 通則1の許容（表わす など6語）はまちがいにしない",
   okRes.every(r => !r.choices.some(c => ["表わす", "著わす", "現われる", "行なう", "断わる", "賜わる"].includes(c))), (okRes.find(r => r.K === "表") || {}).choices + "");
ok("★送りがな: 短い側のまちがいも作っている（司令塔決定）", okRes.some(r => r.choices.slice(1).some(c => c.length < r.ans.length)));
ok("★送りがな: 長さで選ぶ作戦が、でたらめより15ポイント以上得をしない", ok1.bias.ok, JSON.stringify(ok1.bias));
// ★D-17: わざと「いつもまん中」にすると、上の検査が落ちること（検査が鳴ることの確認）
const mid = await page.evaluate(() => {
  // 送りがなの全問を「短い1・長い1」の3択（正解がいつもまん中）にした計画に差しかえて測る
  const keepPlan = window.okuriPlan, plan = {};
  window.__okuriUnit.groups[0].items.forEach(it => { const r = okuriAnalyze(it); if (r.ok && r.cands[-1] && r.cands[1]) plan[it.id] = { pattern: "C", choices: [r.correct, r.cands[-1], r.cands[1]] }; });
  window.okuriPlan = () => plan;
  const b = okuriBias();
  window.okuriPlan = keepPlan;
  return Object.assign(b, { n: Object.keys(plan).length });
});
ok("★（検査の自己試験）いつもまん中にすると、偏りの検査が鳴る", mid.ok === false && mid.edge.middle > 0.15, JSON.stringify(mid.edge));
// 位置: 同じ問題を何度も出したとき、正解の位置が1〜3番目に散らばる
const pos = await page.evaluate(() => {
  const it = window.__okuriUnit.groups[0].items.find(i => (okuriPlan()[i.id] || {}).choices && okuriPlan()[i.id].choices.length === 3);
  const cnt = [0, 0, 0]; let prev = null, same = 0;
  for (let k = 0; k < 300; k++) { const o = randPerm(3, prev); if (prev && o.join() === prev.join()) same++; cnt[o.indexOf(0)]++; prev = o; }
  return { cnt, same };
});
ok("★送りがな: 正解の位置が1・2・3番目に散らばる（300回で各2割以上）", pos.cnt.every(c => c >= 60), pos.cnt.join(","));
ok("★送りがな: 続けて同じ並びにならない", pos.same === 0, String(pos.same));
// ★本から切り出した図（figureImg）がある「図の要る問題」は、アプリに出す（2026-09-11 dr_19 の13問で試行）
const figT = await page.evaluate(() => {
  // 1x1 の白いPNG（ダミー）。⚠️ "data:" と "image/png" を分けて書く（画像の関門がこのファイルを止めないように）
  const PNG = "data:" + "image/png;base64," + "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGP4DwABAQEAG7buVgAAAABJRU5ErkJggg==";
  const g = { gno: 0, field: "kakusu", instruction: { text: "ダミー（太い画は何画目）", ruby: [] }, items: [
    { id: "q_fig_1", no: 1, text: "字", needsFigure: true, figureImg: PNG, answers: [{ text: "3" }], kanji: ["字"] },
    { id: "q_fig_2", no: 2, text: "字", needsFigure: true, answers: [{ text: "4" }], kanji: ["字"] },
    { id: "q_fig_3", no: 3, text: "字", needsFigure: true, figureImg: "data:text/html,xx", answers: [{ text: "4" }], kanji: ["字"] }] };
  BOOK_UNITS = [{ unitId: "dr_19", mat: "dr", srcPages: [19], groups: [g] }]; window.isVerifiedUnit = () => true;
  ITEMS = {}; APP_S = null; window.__day = "2099-09-01";
  const ids = appAllItems().map(x => x.it.id);
  const s = todayApp(); s.pos = s.ids.indexOf("q_fig_1"); renderApp();
  const box = document.getElementById("ap-box");
  figZoom(PNG); const zi = document.querySelector("#fig-zoom img").getBoundingClientRect();
  const zoomFits = zi.width > 100 && zi.left >= 0 && zi.right <= window.innerWidth + 0.5 && zi.bottom <= window.innerHeight + 0.5;
  document.getElementById("fig-zoom").style.display = "none";
  return { ids, img: !!box.querySelector(".ap-fig img"), hint: /タップすると 大きくなる/.test(box.innerText), note: figureNote(g, 1), zoomFits, zi: [zi.left, zi.right, zi.bottom, window.innerWidth, window.innerHeight].map(Math.round) };
});
ok("★切り出した図がある「図の要る問題」はアプリに出る／図が無い・PNGでないものは出ない",
   figT.ids.join() === "q_fig_1", figT.ids.join());
ok("★図がある問題は、画面に図を出す", figT.img);
ok("★図のそばに「タップすると大きくなる」と出る（大きくしないと分からない字があるため）", figT.hint, "");
ok("★タップして広げた図は、画面の中に字全体が収まる（端が切れない）", figT.zoomFits, JSON.stringify(figT.zi));
ok("★図が入っている問題は「出せない」に数えない（図の無い no.2 と、PNGでない no.3 の2問）", /アプリに出せない問題が 2問/.test(figT.note), figT.note);
ok("★図つきの画面に「図が要る問題は出ません」と書かない（目の前と食い違う）", !/図が要る問題は、アプリでは出ません/.test(figT.note), figT.note);
// 版の表示（配信のたびに自動で変わる。手で書かない）
const ver = await page.evaluate(() => document.getElementById("app-version").textContent);
ok("せっていに版（配信の時刻）が出る", /^版 \d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(ver), ver);
console.log("");
console.log("=== 予想得点（測った量に比例させる） ===");
// ★ユーザー発見「まだ20問しかやってないのに130点って？？」: 1問でも解いた分野の配点をまるごと「測った」にしていた
const sc = await page.evaluate(() => {
  const pool = KANJI_MASTER.map(r => r.k);
  function setStats(spec) {   // spec: {分野: [正解数, まちがい数]} を、字ごとの記録にばらして入れる
    KSTATS = {}; RECORDS = {}; let ki = 0;
    Object.keys(spec).forEach(f => { const [o, x] = spec[f];
      for (let i = 0; i < o; i++) { const k = pool[ki++]; (KSTATS[k] = KSTATS[k] || {})[f] = { o: 1, x: 0 }; }
      for (let i = 0; i < x; i++) { const k = pool[ki++]; (KSTATS[k] = KSTATS[k] || {})[f] = { o: 0, x: 1 }; } });
    renderOuen();
    return { score: document.getElementById("s-score").textContent, cap: document.getElementById("s-caption").textContent, e: estimate() };
  }
  const one = setStats({ kaki: [1, 0] });
  // 今日の紙20問＋アプリ20問くらい（書き取り9・部首の字17・同じ読み4・対義語2／読み16・じゅく語の字8）。ほぼ全部正解
  const day = setStats({ kaki: [8, 1], bushu: [15, 2], onaji: [4, 0], taigi: [2, 0], yomi: [15, 1], jukugo: [8, 0] });
  const want = 40 * 9 / 20 + 20 * Math.min(1, 17 / 10) + 16 * 4 / 8 + 10 * 2 / 5 + 30 * 16 / 30 + 20 * 8 / 10;
  // 本番1回ぶん以上（全分野を本番の問数ぶん）
  const full = setStats({ kaki: [16, 4], yomi: [24, 6], erabi: [8, 2], kakusu: [8, 2], onkun: [8, 2], taigi: [4, 1], okuri: [6, 1], bushu: [8, 2], onaji: [6, 2], jukugo: [8, 2] });
  KSTATS = {}; renderOuen();
  return { one, day, want: Math.round(want), full };
});
ok("★1問だけ解いた状態では、点数を出さない", /—/.test(sc.one.score) && /まだ点数は出せません/.test(sc.one.cap), sc.one.score + " / " + sc.one.cap);
ok("★1問だけなら「測った点」は配点のごく一部（書き取り1問＝40×1/20＝2点分）", sc.one.e.coveredPoints === 2, String(sc.one.e.coveredPoints));
ok("★20問＋20問の日も、点数を出さない（130点のような数を出さない）", /—/.test(sc.day.score), sc.day.score + " / " + sc.day.cap);
ok("★「測った点」が、実際にやった数に釣り合っている（配点×やった数÷本番の問数）", sc.day.e.coveredPoints === sc.want, `${sc.day.e.coveredPoints} / 計算 ${sc.want}`);
ok("★1問も解いていない分野は「測った」に入らない", sc.day.e.measuredByField.erabi === undefined && sc.day.e.measuredByField.kakusu === undefined, JSON.stringify(sc.day.e.measuredByField));
ok("本番1回ぶん以上やれば、点数が出る", /\d+/.test(sc.full.score) && !/—/.test(sc.full.score), sc.full.score + " / " + sc.full.cap);
console.log("");
console.log("=== やった問題の一覧・〇✕の訂正・記録を消す ===");
const lg = await page.evaluate(() => {
  BOOK_UNITS = window.__longUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
  window.__day = "2099-10-01";
  const ids = todaySheetItems().map(x => x.it.id);
  saveSheetResult();                                   // 全部〇で記録
  const n1 = LOG.length, src1 = LOG.every(e => e.src === "paper" && e.date === "2099-10-01");
  renderLog();
  const rows = document.querySelectorAll("#log-box .log-row").length;
  // 3問目の字を ✕ に訂正（一覧のボタンを押す）
  const target = LOG[2];
  document.querySelector('#log-box .mark[data-i="2"][data-ki="0"]').click();
  const afterX = { last: ITEMS[target.id].last, weak: !!WEAK[target.kanji[0].k] };
  window.__day = "2099-10-02"; SESSION = null;
  const next1 = todaySheetItems().map(x => x.it.id);
  // もう一度押して 〇 に戻す
  document.querySelector('#log-box .mark[data-i="2"][data-ki="0"]').click();
  const afterO = ITEMS[target.id].last;
  SESSION = null;
  const next2 = todaySheetItems().map(x => x.it.id);
  return { n: ids.length, n1, src1, rows, afterX, inNext1: next1.includes(target.id), firstNext1: next1[0] === target.id,
           afterO, inNext2: next2.includes(target.id) };
});
ok("紙を記録すると、1問ずつ一覧に残る（紙・日付つき）", lg.n1 === lg.n && lg.src1 && lg.rows === lg.n, `${lg.n1}/${lg.n} 行${lg.rows}`);
ok("★〇を✕に直すと、その問題は✕になる（もうすこしの字にも入る）", lg.afterX.last === "x" && lg.afterX.weak, JSON.stringify(lg.afterX));
ok("★✕に直した問題は、翌日の紙に出る（先頭に）", lg.inNext1 && lg.firstNext1);
ok("★✕を〇に直し戻すと、翌日の紙には出ない", lg.afterO === "o" && !lg.inNext2, lg.afterO);
const lg2 = await page.evaluate(() => {
  // アプリで1問まちがえる → 一覧に出る → 〇に直す
  window.__day = "2099-10-03"; APP_S = null;
  const before = LOG.length;
  appRecord("q_app_x1", "yomi", ["愛"], [false], false, null);
  const e = LOG[LOG.length - 1];
  const i = LOG.length - 1;
  renderLog();
  document.querySelector('#log-box .mark[data-i="' + i + '"][data-ki="0"]').click();
  const fixed = ITEMS["q_app_x1"].last;
  // きょうの分だけ消す（2099-10-03 の記録だけ）
  const beforeReset = LOG.length;
  resetToday();
  const r1 = { gone: !LOG.some(x => x.date === "2099-10-03"), item: ITEMS["q_app_x1"] === undefined, kept: LOG.length === beforeReset - 1 };
  // ぜんぶ消す
  const exam = SET.examDate;
  resetAll();
  return { added: LOG.length, appSrc: e.src === "app", fixed, r1, all: { log: LOG.length, items: Object.keys(ITEMS).length, kstats: Object.keys(KSTATS).length, exam: SET.examDate === exam } };
});
ok("アプリで解いた問題も一覧に残る", lg2.appSrc);
ok("★アプリの問題も〇✕を直せる", lg2.fixed === "o", lg2.fixed);
ok("★「きょうの分だけ消す」は、きょうの記録だけを消す（前の日は残る）", lg2.r1.gone && lg2.r1.item && lg2.r1.kept, JSON.stringify(lg2.r1));
ok("★「ぜんぶ消す」は記録を全部消し、受検日は残す", lg2.all.log === 0 && lg2.all.items === 0 && lg2.all.kstats === 0 && lg2.all.exam, JSON.stringify(lg2.all));
// ★照合ずみが「読み」と「じゅく語作り」だけの日（ユーザーの端末で起きたと思われる形）。上限で止まり、20問に埋めない
const two = await page.evaluate(() => {
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = (id) => id === "dr_01" || id === "dr_54";
  ITEMS = {}; APP_S = null; window.__day = "2099-11-01";
  const s = todayApp(); const c = {}; s.ids.forEach(id => { const y = appIndex()[id]; const f = itemFieldOf(y.it, y.g); c[f] = (c[f] || 0) + 1; });
  const cap = fieldCaps(APP_FIELDS, APP_TARGET);
  // 前の版（v1）の未回答の分は組み直される／答えた分はそのまま
  APP_S = { v: 1, date: todayStr(), ids: ["q_app_dr_54_1"], pos: 0, ord: {}, res: {}, step: {} };
  const rebuilt = todayApp().ids.length;
  APP_S = { v: 1, date: todayStr(), ids: ["q_app_dr_54_1"], pos: 0, ord: {}, res: { q_app_dr_54_1: { ok: true } }, step: {} };
  const kept = todayApp().ids.length;
  window.isVerifiedUnit = () => true;
  return { c, n: s.ids.length, cap, rebuilt, kept };
});
ok("★照合ずみが読みとじゅく語作りだけの日は、上限で止まる（20問に埋めない）", two.n === two.cap.yomi + two.cap.jukugo && two.n < 20, `${JSON.stringify(two.c)} / 上限 ${two.cap.yomi}+${two.cap.jukugo}`);
ok("★じゅく語作りは上限を超えない", (two.c.jukugo || 0) <= two.cap.jukugo, JSON.stringify(two.c));
ok("★前の版で組んだ未回答のアプリの分は、組み直す", two.rebuilt === two.n, String(two.rebuilt));
ok("1問でも答えたアプリの分は、組み直さない", two.kept === 1, String(two.kept));
console.log("");
console.log("=== おかわり（何回でもできる） ===");
const ok2 = await page.evaluate(() => {
  const alerts = []; const keepA = window.alert; window.alert = (m) => alerts.push(String(m));
  BOOK_UNITS = window.__longUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
  window.__day = "2099-12-01";
  const first = todaySheetItems().map(x => x.it.id);
  renderMarks(); document.querySelector("#mark-box .mark").click();   // 1問目を✕
  const xId = first[0];
  saveSheetResult();
  const recBefore = JSON.stringify(RECORDS);
  renderKyou();
  const btn = /つぎの分の紙を出す/.test(document.getElementById("ky-extra").innerText);
  const infoAfter = document.getElementById("ky-info").innerText;
  startExtraSheet();
  const second = todaySheetItems().map(x => x.it.id);
  const extra1 = SESSION.extra;
  saveSheetResult();
  const r = { btn, extra1, infoAfter, n1: first.length, n2: second.length,
    disjoint: second.every(id => !first.includes(id)), noTodayX: !second.includes(xId),
    planSame: JSON.stringify(RECORDS) === recBefore, logExtra: LOG.filter(e => e.extra === 1).length === second.length };
  // あした: きょう✕の問題が出る
  window.__day = "2099-12-02"; SESSION = null;
  r.xTomorrow = todaySheetItems().map(x => x.it.id)[0] === xId;
  // 本の問題が尽きたら「もうありません」
  BOOK_UNITS = [JSON.parse(JSON.stringify(window.__longUnits[3]))];   // 部首10問だけ
  RECORDS = {}; ITEMS = {}; SESSION = null; window.__day = "2099-12-03";
  todaySheetItems(); saveSheetResult();
  let idsBefore = SESSION.ids.join(), rounds = 0, seen = SESSION.ids.slice();
  for (; rounds < 6; rounds++) {   // 尽きるまでおかわりを続ける
    const n = alerts.length; startExtraSheet();
    if (alerts.length > n) break;
    seen = seen.concat(SESSION.ids); saveSheetResult(); idsBefore = SESSION.ids.join();
  }
  r.exhausted = alerts.some(a => /もうありません/.test(a)) && SESSION.ids.join() === idsBefore && new Set(seen).size === seen.length && seen.length === 10;
  r.rounds = rounds;
  // アプリ: 終わったら「もっとやる」で次の分（同じ問題は出ない）
  BOOK_UNITS = window.__appUnits; ITEMS = {}; APP_S = null; window.__day = "2099-12-04";
  const a1 = todayApp().ids.slice();
  a1.forEach(id => { APP_S.res[id] = { ok: true }; ITEMS[id] = { o: 1, x: 0, last: "o", date: todayStr() }; });
  APP_S.pos = a1.length; renderAppEntry();
  r.appBtn = /もっとやる/.test(document.getElementById("ap-entry").innerText);
  moreApp();
  r.appExtra = APP_S.extra === 1 && APP_S.ids.every(id => !a1.includes(id)) && APP_S.ids.length > 0;
  window.alert = keepA;
  return r;
});
ok("★きょうの紙を記録したら「つぎの分の紙を出す」が出る", ok2.btn);
ok("★記録したあとの「きょう」に、きょう記録した問題を「まえに✕」と数えない", !/まえに ✕ だった問題/.test(ok2.infoAfter), ok2.infoAfter.slice(0, 80));
ok("★おかわりの紙は、きょうの紙と別の問題（同じ問題は出ない）", ok2.disjoint && ok2.n2 > 0, `${ok2.n1}+${ok2.n2}`);
ok("★きょう✕の問題は、おかわりには出さない（あしたに回す）", ok2.noTodayX);
ok("★きょう✕の問題は、あしたの紙の先頭に出る", ok2.xTomorrow);
ok("★おかわりを記録しても、日割りは進まない", ok2.planSame);
ok("おかわりの記録は、きょうの分と区別できる（extra）", ok2.logExtra && ok2.extra1 === 1);
ok("★本の問題が尽きたら「もうありません」と出し、作って埋めない", ok2.exhausted);
ok("★アプリ: 終わったら「もっとやる」で次の分（同じ問題は出ない）", ok2.appBtn && ok2.appExtra);
console.log("");
console.log("=== 本で できた字を入れる ===");
const dw = await page.evaluate(() => {
  BOOK_UNITS = window.__longUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
  window.__day = "2100-01-01";
  const first = todaySheetItems().map(x => x.it);
  const kaki = first.filter(it => BOOK_UNITS.some(u => u.groups.some(g => g.field === "kaki" && g.items.includes(it)))).slice(0, 3);
  const ks = kaki.map(it => it.kanji[0]);
  SESSION = null;   // まだ紙は組んでいない状態に戻す（あしたの紙で確かめる）
  // 語のまま・読点と改行まじり・範囲外の字（蔵）入り
  const raw = ks[0] + "、" + ks[1] + "く" + String.fromCharCode(10) + "冷蔵" + ks[2] + "　";   // 改行まじり
  renderKiroku();
  document.getElementById("d-field").value = "kaki";
  document.getElementById("d-words").value = raw;
  saveDoneWords();
  const msg = document.getElementById("d-result").innerText;
  const logBook = LOG.filter(e => e.src === "book");
  window.__day = "2100-01-02"; SESSION = null;
  const next = todaySheetItems().map(x => x.it.id);
  // 一覧で1つを✕に直すと、その問題はあしたに出る
  renderLog();
  const idx = LOG.findIndex(e => e.id === kaki[0].id);
  document.querySelector('#log-box .mark[data-i="' + idx + '"][data-ki="0"]').click();
  window.__day = "2100-01-03"; SESSION = null;
  const next2 = todaySheetItems().map(x => x.it.id);
  return { ks, msg, ids: kaki.map(it => it.id), logBook: logBook.map(e => e.id), next, next2,
           inMaster: !!MASTER_BY_K["蔵"] };
});
ok("検査の前提: 蔵 は642字マスタに無い（範囲外の例として使える）", !dw.inMaster);
ok("★範囲外の字は黙って捨てず、「入れていません」と名前を出す", /蔵/.test(dw.msg) && /範囲外/.test(dw.msg), dw.msg.slice(0, 120));
ok("★語のまま貼っても漢字だけ取り出す（入れた字の数が出る）", dw.ks.every(k => dw.msg.includes(k)), dw.msg.slice(0, 80));
ok("★入れた字の本の問題は、次の日の紙に出ない", dw.ids.every(id => !dw.next.includes(id)), dw.ids.join(","));
ok("★一覧に「本」の記録として出る", dw.ids.every(id => dw.logBook.includes(id)), dw.logBook.join(","));
ok("★一覧で✕に直すと、その問題はまた出る", dw.next2.includes(dw.ids[0]), dw.ids[0]);
console.log("");
console.log("=== アプリの問題の数を選ぶ ===");
const cnt = await page.evaluate(() => {
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = () => true;
  ITEMS = {}; APP_S = null; LOG = []; delete SET.appCount; window.__day = "2100-02-01";
  const def = todayApp().ids.length;
  renderAppEntry();
  const chips = [...document.querySelectorAll("#ap-entry .ap-cnt")].map(b => b.textContent + (b.classList.contains("on") ? "*" : ""));
  setAppCount(10);   // まだ答えていない → 組み直される
  const s10 = todayApp(); const c = {}; s10.ids.forEach(id => { const y = appIndex()[id]; const f = itemFieldOf(y.it, y.g); c[f] = (c[f] || 0) + 1; });
  const cap10 = fieldCaps(APP_FIELDS, 10), q10 = appQuota(10);
  const remembered = JSON.parse(localStorage.getItem("kanken7_settings_v1")).appCount === 10;
  // 1問答えてから数を変えると、いまの分はそのまま
  APP_S.res[APP_S.ids[0]] = { ok: true };
  setAppCount(5);
  const kept = todayApp().ids.length;
  // ✕が選んだ数より多い日は、✕だけでその数になる
  window.__day = "2100-02-02"; APP_S = null; ITEMS = {};
  appAllItems().slice(0, 8).forEach(x => { ITEMS[x.it.id] = { o: 0, x: 1, last: "x", date: "2100-02-01" }; });
  const sx = todayApp(); const allX = sx.ids.every(id => ITEMS[id] && ITEMS[id].last === "x");
  const nx = sx.ids.length;
  delete SET.appCount; save(K_SET, SET); APP_S = null;
  return { def, chips, n10: s10.ids.length, c, cap10, q10, remembered, kept, nx, allX };
});
ok("アプリの問題は、既定で20問", cnt.def === 20, String(cnt.def));
ok("入口に 5/10/20/30/40 の選択があり、いまの数がえらばれている", cnt.chips.join(",") === "5,10,20*,30,40", cnt.chips.join(","));
ok("★10問をえらぶと10問になり、配点比のとおり（1分野に偏らない）", cnt.n10 === 10 && Object.keys(cnt.q10).every(f => (cnt.c[f] || 0) === cnt.q10[f]), JSON.stringify(cnt.c) + " / 比 " + JSON.stringify(cnt.q10));
ok("★えらんだ数でも、分野の上限を超えない", Object.keys(cnt.c).every(f => cnt.c[f] <= cnt.cap10[f]), JSON.stringify(cnt.cap10));
ok("えらんだ数は覚えておく", cnt.remembered);
ok("1問でも答えた分は、数を変えても組み直さない", cnt.kept === 10, String(cnt.kept));
ok("★✕が選んだ数より多い日は、✕だけでその数になる（5問・ぜんぶ✕）", cnt.nx === 5 && cnt.allX, cnt.nx + " / " + cnt.allX);
const gen3 = await page.evaluate(() => window.__genCalls.slice());
ok("★アプリの問題でも、問題生成が1回も呼ばれていない", gen3.length === 0, gen3.join(","));

console.log("");
console.log("=== 正解するまで出し直す（2026-09-12 ユーザー指示）===");
// ★上限なし。正解するまで出し直す。記録に入れるのは1回目だけ（estimate が甘くならないように）
await page.evaluate(() => {
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
  window.__day = "2099-11-01"; APP_S = null; todayApp(); openApp();
});
const rt0 = await page.evaluate(() => ({ n: APP_S.ids.length, id0: APP_S.ids[0] }));
const rtW1 = await answerCurrent(false);              // 1問目をわざと まちがえる
const rt1 = await page.evaluate(() => {
  const s = APP_S, id = s.ids[0];
  return { n: s.ids.length, at: s.ids.indexOf(id, 1),
           kstat: JSON.stringify(KSTATS), item: JSON.stringify(ITEMS[id] || null),
           logN: LOG.filter(e => e.id === id).length };
});
ok("★まちがえた問題は、もう一度ならぶ", rt1.n === rt0.n + 1 && rt1.at > 0, `${rt0.n}→${rt1.n} 位置${rt1.at}`);
ok("★2問はさんでから戻す（すぐ次には出さない）", rt1.at === 3, `位置 ${rt1.at}`);
ok("★まちがえたら「このあと もう一回 出るよ」と出る", /もう一回 出るよ/.test(rtW1.fb), rtW1.fb.slice(0, 60));

await answerCurrent(true); await answerCurrent(true);   // あいだの2問
const rt2 = await page.evaluate(() => {
  const s = APP_S, box = document.getElementById("ap-box");
  return { cur: s.ids[s.pos], pos: s.pos, hasNext: /つぎへ/.test(box.innerText), res: !!s.res[s.ids[s.pos]],
           kstat: JSON.stringify(KSTATS) };
});
ok("★3問目のあとに、まちがえた問題が また出る", rt2.cur === rt0.id0, `${rt2.cur} / pos ${rt2.pos}`);
ok("★やり直しの回は、前の答えが消えて もう一度 答えられる", !rt2.res && !rt2.hasNext);

const rtW2 = await answerCurrent(true);                 // やり直しで正解
const rt3 = await page.evaluate(() => {
  const id = APP_S.ids[0];
  return { kstat: JSON.stringify(KSTATS), item: JSON.stringify(ITEMS[id] || null),
           logN: LOG.filter(e => e.id === id).length, last: (ITEMS[id] || {}).last };
});
// ⚠️ あいだの2問でも KSTATS は動くので、**やり直しの直前**と比べること（rt1 と比べると必ず落ちる）
ok("★やり直して正解しても、字ごとの記録（estimate の元）は動かない", rt3.kstat === rt2.kstat);
ok("★やり直して正解しても、問題の記録は 1回目のまま", rt3.item === rt1.item);
ok("★やり直しは「やった問題」の一覧に二重に出ない（LOG は1回目だけ）", rt3.logN === 1 && rt1.logN === 1, String(rt3.logN));
ok("★1回目が✕なら last は \"x\" のまま ＝ あしたも出る", rt3.last === "x", String(rt3.last));
ok("★やり直しで正解したら「（2回目）」と「あしたも もう一回 出るよ」", /2回目/.test(rtW2.fb) && /あしたも/.test(rtW2.fb), rtW2.fb.slice(0, 70));

// ★上限なし: 4回つづけて まちがえても、そのつど また出る
const cap = await page.evaluate(() => ({ n: APP_S.ids.length, id: APP_S.ids[APP_S.pos] }));
let grew = 0;
for (let i = 0; i < 4; i++) {
  const before = await page.evaluate(() => APP_S.ids.length);
  await answerCurrent(false);
  const after = await page.evaluate(() => APP_S.ids.length);
  if (after === before + 1) grew++;
  // はさんだ2問を片づけて、やり直しの回まで進む
  await answerCurrent(true); await answerCurrent(true);
}
ok("★上限なし: 4回つづけて まちがえても、そのつど また出る（3回で打ち切らない）", grew === 4, `${grew}/4`);

// ★読み: 2回目に「こたえ」が最初から見えていないか（ここが壊れていると出し直す意味がない）
const ym = await page.evaluate(() => {
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = (id) => id === "dr_01";   // 読みだけ
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; APP_S = null;
  window.__day = "2099-11-02"; todayApp(); openApp();
  const s = APP_S, id = s.ids[0], it = appIndex()[id].it, ansText = it.answers[0].text;
  const box = () => document.getElementById("ap-box");
  const r = { f: itemFieldOf(it, appIndex()[id].g) };
  // 1回目: こたえを見る →「読めなかった」
  r.shownBtn1 = !!box().querySelector('[data-act="show"]');
  box().querySelector('[data-act="show"]').click();
  box().querySelector('[data-act="yomi-x"]').click();
  box().querySelector('[data-act="next"]').click();
  // あいだの2問
  for (let i = 0; i < 2; i++) {
    box().querySelector('[data-act="show"]').click();
    box().querySelector('[data-act="yomi-o"]').click();
    box().querySelector('[data-act="next"]').click();
  }
  // 2回目（やり直しの回）
  r.sameItem = s.ids[s.pos] === id;
  r.text2 = box().innerText;
  r.shownBtn2 = !!box().querySelector('[data-act="show"]');
  r.answerHidden = !r.text2.includes(ansText);
  r.noSelfBtn = !box().querySelector('[data-act="yomi-o"]');
  return r;
});
ok("★読み: やり直しの回も、同じ問題が出る", ym.sameItem);
ok("★読み: やり直しの回は「こたえを見る」から始まる（答えが最初から見えていない）",
   ym.shownBtn2 && ym.answerHidden, ym.text2.slice(0, 70));
ok("★読み: 答えを見る前に「読めた」は押せない（やり直しの回でも）", ym.noSelfBtn);
console.log("");

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

console.log("=== きょうのアプリの問題を、おうちの方が先に見る ===");
const pk = await page.evaluate(() => {
  BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = () => true;
  RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
  window.__day = "2099-11-10";
  const r = {};
  // ① まだ組まれていない時点で下見すると、その場で組まれる（(A) 司令塔決定）
  r.noneBefore = APP_S === null;
  PEEK_OPEN = false; toggleAppPeek();
  r.made = !!APP_S && APP_S.ids.length > 0;
  r.peekIds = APP_S.ids.slice();
  // ② 下見したものが、そのままお子さんに出る
  r.childIds = todayApp().ids.slice();
  // ③ ★読むだけ: pos・res・step に書いていない
  r.posAfter = APP_S.pos; r.resAfter = Object.keys(APP_S.res).length; r.stepAfter = Object.keys(APP_S.step).length;
  // ④ 途中まで進めた状態でも、下見で1文字も動かない
  openApp();
  const box = () => document.getElementById("ap-box");
  for (let i = 0; i < 2; i++) {   // 2問だけ答える（形式によらず「つぎへ」まで）
    const sh = box().querySelector('[data-act="show"]');
    if (sh) { sh.click(); box().querySelector('[data-act="yomi-o"]').click(); }
    else if (document.getElementById("ap-num")) {
      const id = APP_S.ids[APP_S.pos], it = appIndex()[id].it;
      document.getElementById("ap-num").value = it.answers[0].text;
      box().querySelector('[data-act="num"]').click();
    } else {
      const id = APP_S.ids[APP_S.pos], x = appIndex()[id], it = x.it, f = itemFieldOf(it, x.g), CH = appChoicesOf(it, f);
      it.answers.forEach(a => {
        const btns = [...box().querySelectorAll('[data-act="pick"]')];
        (btns.find(b => choiceBody(CH[+b.dataset.ci]) === choiceBody(a.text)) || btns[0]).click();
      });
    }
    box().querySelector('[data-act="next"]').click();
  }
  const snap = () => JSON.stringify({ pos: APP_S.pos, res: APP_S.res, step: APP_S.step, ids: APP_S.ids, ord: APP_S.ord });
  const before = snap();
  PEEK_OPEN = false; toggleAppPeek();   // もう一度ひらく
  r.untouched = snap() === before;
  r.peekText = document.getElementById("peek-box").innerText;
  // ⑤ 済のしるしが出る（読むだけなので「済」と書くだけ）
  r.hasDone = /済/.test(r.peekText);
  // ⑥ ★選択肢の並びが、お子さんの画面と同じか（実際にその問題を描いて突き合わせる）
  const idx = appIndex();
  const ci = APP_S.ids.findIndex(id => idx[id] && appChoicesOf(idx[id].it, itemFieldOf(idx[id].it, idx[id].g)).length > 1);
  const cid = APP_S.ids[ci], cx = idx[cid], cf = itemFieldOf(cx.it, cx.g);
  const keepPos = APP_S.pos;
  APP_S.pos = ci; delete APP_S.res[cid]; renderApp();
  r.childBtns = [...document.querySelectorAll('#ap-box [data-act="pick"]')].map(b => b.textContent).join("　");
  APP_S.pos = keepPos;
  const rows = [...document.querySelectorAll("#peek-box tr")];
  r.peekRow = (rows[ci] ? rows[ci].innerText : "");
  r.orderSame = r.childBtns.length > 0 && r.peekRow.includes(r.childBtns);
  // ⑦ 正解が出ている
  r.hasAnswer = /こたえ：/.test(r.peekText);
  r.field = cf;
  return r;
});
ok("★まだ組まれていない時点で下見すると、その場で組まれる", pk.noneBefore && pk.made);
ok("★下見したものが、そのままお子さんに出る（同じ問題・同じ順）", pk.peekIds.join() === pk.childIds.join());
ok("★下見は pos を動かさない・res も step も立てない", pk.posAfter === 0 && pk.resAfter === 0 && pk.stepAfter === 0,
   `pos=${pk.posAfter} res=${pk.resAfter} step=${pk.stepAfter}`);
ok("★★途中まで進めた状態で下見しても、pos・res・step・ids・ord が1文字も動かない", pk.untouched);
ok("★選択肢の並びが、お子さんの画面と同じ", pk.orderSame, `${pk.field}: 画面[${pk.childBtns}] / 下見[${pk.peekRow.replace(/\n/g, " / ")}]`);
ok("★正解が出ている（解けるかを見るため）", pk.hasAnswer);
ok("すでに答えた問題は「済」と出るだけ", pk.hasDone);
console.log("");

console.log(`\n${pass}/${pass + fail} 通過`);
if (SHOT_PEEK) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "kanken-peek-"));
  await page.setViewportSize({ width: 420, height: 1400 });
  await page.evaluate(() => {
    BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = (id) => id === "dr_17" || id === "dr_20";
    RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
    window.__day = "2099-11-11"; SET.appCount = 5; save(K_SET, SET);
    renderAll();
  });
  await page.click('.tab[data-page="setei"]');
  await page.evaluate(() => { PEEK_OPEN = false; toggleAppPeek();
    document.getElementById("peek-box").scrollIntoView(); });
  // ★カードだけ撮る（せってい全体は6000px超で読めない）
  await page.locator("#peek-box").evaluate(el => el.closest(".card").id = "peek-card");
  await page.locator("#peek-card").screenshot({ path: path.join(out, "1_下見.png") });
  // 同じ1問目を、お子さんの画面で出す
  await page.evaluate(() => { openApp(); renderApp(); });
  await page.setViewportSize({ width: 420, height: 900 });
  await page.screenshot({ path: path.join(out, "2_お子さんの画面_1問目.png"), fullPage: true });
  console.log("下見の撮影: " + out);
}

if (SHOT_RETRY) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "kanken-retry-"));
  await page.setViewportSize({ width: 420, height: 900 });
  const shot = async (name) => { await page.screenshot({ path: path.join(out, name + ".png"), fullPage: true }); };
  await page.evaluate(() => {
    BOOK_UNITS = window.__appUnits; window.isVerifiedUnit = (id) => id === "dr_01";   // 読みだけにする
    RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null; APP_S = null;
    window.__day = "2099-11-03"; todayApp(); openApp(); renderApp();
  });
  await shot("1_1問目");
  await page.evaluate(() => document.querySelector('#ap-box [data-act="show"]').click());
  await shot("2_こたえを見た");
  await page.evaluate(() => document.querySelector('#ap-box [data-act="yomi-x"]').click());
  await shot("3_読めなかった");
  await page.evaluate(() => {
    const b = () => document.getElementById("ap-box");
    b().querySelector('[data-act="next"]').click();
    for (let i = 0; i < 2; i++) {
      b().querySelector('[data-act="show"]').click();
      b().querySelector('[data-act="yomi-o"]').click();
      b().querySelector('[data-act="next"]').click();
    }
  });
  await shot("4_やり直しの回");
  await page.evaluate(() => {
    const b = () => document.getElementById("ap-box");
    b().querySelector('[data-act="show"]').click();
    b().querySelector('[data-act="yomi-o"]').click();
  });
  await shot("5_やり直して正解");
  await page.evaluate(() => {
    const b = () => document.getElementById("ap-box");
    let g = 0;
    while (APP_S.pos < APP_S.ids.length && g++ < 200) {
      const nx = b().querySelector('[data-act="next"]');
      if (nx) { nx.click(); continue; }
      const sh = b().querySelector('[data-act="show"]'); if (sh) { sh.click(); continue; }
      b().querySelector('[data-act="yomi-o"]').click();
    }
    renderApp();
  });
  await shot("6_おわり");
  console.log("出し直しの撮影: " + out);
}

await browser.close(); server.close();
process.exit(fail ? 1 : 0);
