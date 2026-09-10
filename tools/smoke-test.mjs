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

  const units = [...new Set(PLAN.map(c => c.unit))].slice(0, 3);
  const pool = KANJI_MASTER.map(r => r.k);
  let ki = 0;
  function mk(uid, n, field) {
    const items = [];
    for (let i = 1; i <= n; i++) {
      const k = pool[ki++ % pool.length];
      items.push({ id: "q_test_" + uid + "_" + i, no: i, text: "ダミー問題 " + uid + "-" + i,
                   answers: [{ text: "ダミー答え" + i }], kanji: [k], field });
    }
    return { unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3)) || 1],
             groups: [{ gno: 0, field, instruction: "ダミーの指示文（" + uid + "）", items }] };
  }
  // かたまりの範囲に合わせて問数を取る（範囲外の問は出ないので）
  const n0 = PLAN.filter(c => c.unit === units[0]).reduce((a, c) => Math.max(a, c.to), 0);
  const n1 = PLAN.filter(c => c.unit === units[1]).reduce((a, c) => Math.max(a, c.to), 0);
  const n2 = PLAN.filter(c => c.unit === units[2]).reduce((a, c) => Math.max(a, c.to), 0);
  BOOK_UNITS = [mk(units[0], n0, "kaki"), mk(units[1], n1, "yomi"), mk(units[2], n2, "kaki")];
  window.__unverified = units[2];
  window.isVerifiedUnit = (id) => id !== units[2];
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
  const x = bookItemsOfChunk(PLAN[0])[3];
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
