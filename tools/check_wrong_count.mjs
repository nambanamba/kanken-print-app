// 設問ごとの「これまで何回 ✕ だったか」が、記録どおりに画面に出ているかを見る。
//
// 使い方:
//   node tools/check_wrong_count.mjs            ← 入口の自己テストを通してから、本物を見る
//   node tools/check_wrong_count.mjs --selftest ← 自己テストだけ
//   node tools/check_wrong_count.mjs --shot     ← 390px の画面を撮る（_shot_*.png）。★最後は目で見るため（3-4）
//
// ★入口に自己テストを置いてある（確認ポイント 4-6）。1つでも落ちたら、結果を出さずに終了コード3で止まる。
//   信用できない数字を出さないため。
//     (a1) 「／やった回数」を落とした偽物        → 鳴るべき   ← 4-1
//     (a2) 数を読むときに記録を書きかえる偽物    → 鳴るべき   ← 4-1
//     (b)  見た目だけ変えた偽物（中身は正しい）  → 鳴らぬべき ← 4-3（網を広げすぎていないことの担保）
//     (c)  直す前の版（★コミットで固定）        → 鳴るべき   ← 4-6c
//
// ★偽物は**自分で作る**（実物の記録に借りない。記録は変わるため。4-6d-2）。
// ★対照は `HEAD` で表さない。下の BEFORE_FIX にコミットハッシュで固定してある（4-6c）。
// ⚠️ 本の問題文は使わない（このファイルは公開リポジトリに入る）。検査用の本はダミーで組む。

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ★直す前の版。**コミットで固定する**（4-6c）。
   `HEAD` にすると、自分が直した瞬間に対照が「直したあとの版」に化けて、鳴るべき側が鳴らなくなる。
   a244054 ＝ 2026-09-25 にこの機能を足す直前の origin/master。 */
const BEFORE_FIX = "a244054";

const SELFTEST_ONLY = process.argv.includes("--selftest");
const SHOT = process.argv.includes("--shot");

/* ---------------- 偽物の作り方（本物の index.html を書きかえて作る） ---------------- */
/* ⚠️ 書きかえ元が見つからなかったら**必ず止める**。
      見つからないまま素通りすると、「偽物が鳴らない＝検査が壊れている」のに
      「異常なし」に化ける（4-6d）。 */
function mutate(src, pairs, name) {
  let out = src;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) {
      console.error("✋ 偽物「" + name + "」を作れませんでした。書きかえ元が見つかりません:\n   " + from);
      console.error("   （index.html を直したときは、この検査の偽物の作り方も直してください）");
      process.exit(3);
    }
    out = out.split(from).join(to);
  }
  if (out === src) { console.error("✋ 偽物「" + name + "」が本物と同じになりました"); process.exit(3); }
  return out;
}

const REAL = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

function beforeFixHtml() {
  try {
    return execFileSync("git", ["show", BEFORE_FIX + ":index.html"], { cwd: ROOT, maxBuffer: 1 << 28 }).toString("utf8");
  } catch (e) {
    console.error("✋ 対照の版 " + BEFORE_FIX + " を取り出せませんでした: " + String(e.message).split("\n")[0]);
    process.exit(3);
  }
}

const NL = REAL.includes("\r\n") ? "\r\n" : "\n";

const FAKES = {
  // (a1) 数は出るが「／やった回数」が無い。「✕3」だけでは 3回中3回なのか分からない（依頼の失敗5）
  a1: () => mutate(REAL, [
    ["'<span class=\"muted\">✕0 ／ '+c.t+'回</span>'", "'<span class=\"muted\">✕0</span>'"],
    ["'<b style=\"color:#b91c1c\">✕'+c.x+'</b><span class=\"muted\"> ／ '+c.t+'回</span>'",
     "'<b style=\"color:#b91c1c\">✕'+c.x+'</b>'"],
  ], "a1 ／やった回数が無い"),
  // (a2) 数を読むだけのはずが、ITEMS に空の記録を作ってしまう（依頼の失敗2）
  a2: () => mutate(REAL, [
    ["  var r=ITEMS[id];" + NL + "  if(!r) return { x:0, t:0 };",
     "  var r=ITEMS[id]||(ITEMS[id]={o:0,x:0});" + NL + "  if(false) return { x:0, t:0 };"],
  ], "a2 記録を書きかえる"),
  // (a3) 数が紙にも印刷されてしまう偽物（依頼の失敗3）。紙の見出しに全問ぶんを足す
  a3: () => mutate(REAL, [
    ["+'<div class=\"p-title\">漢検7級　きょう 書く字'",
     "+'<div class=\"p-title\">漢検7級　きょう 書く字'+doneItemList().map(function(x){return wrongLabel(x.it.id);}).join('')"],
  ], "a3 紙にも印刷される"),
  // (a4) ✕が1件も無い端末で、一覧ごと消えてしまう偽物（依頼の失敗4）
  a4: () => mutate(REAL, [
    ["    var wt=wrongTotals(xs);",
     "    var wt=wrongTotals(xs);" + NL + "    if(!wt.items){ box.innerHTML=''; return; }"],
  ], "a4 0件だと一覧が消える"),
  // (b) 見出しの文字と色と太字のタグだけ変えた。中身は正しいので**鳴ってはいけない**
  b: () => mutate(REAL, [
    [">まちがえ</th>", ">まちがえた数</th>"],
    ["'<b style=\"color:#b91c1c\">✕'+c.x+'</b>", "'<strong style=\"color:#0f172a\">✕'+c.x+'</strong>"],
  ], "b 見た目だけ変えた"),
};

/* ---------------- サーバ（index.html だけ差し替えられる） ---------------- */
const MIME = { ".html": "text/html", ".js": "text/javascript" };
let SERVE_INDEX = REAL;
const server = http.createServer((req, res) => {
  if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html";
  if (rel === "index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
    return res.end(SERVE_INDEX);
  }
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;

let chromium;
try { chromium = await getChromium(); }
catch (e) { console.error(e.message); process.exit(2); }
const browser = await launchBrowser(chromium);

/* ---------------- 1つの版を見る ---------------- */
/* 返すのは NG の一覧。空なら「鳴らなかった」。 */
async function inspect(html) {
  SERVE_INDEX = html;
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const jsErrors = [];
  page.on("pageerror", e => jsErrors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") jsErrors.push(m.text()); });
  page.on("dialog", d => d.accept());
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });

  const ng = [];
  const add = (why, extra = "") => ng.push(why + (extra ? "  " + extra : ""));

  /* ダミーの本と、こちらで決めた記録を入れる。
     ★問題を名指ししない。**先頭から順に**「✕2/3回」「✕0/3回」「✕1/1回」を当て、
       残りは記録なしにする（4-6b: 番号を決め打ちしない） */
  const seeded = await page.evaluate(() => {
    const pool = KANJI_MASTER.map(r => r.k);
    let ki = 0;
    function mk(uid, n, field) {
      const items = [];
      for (let i = 1; i <= n; i++) {
        items.push({ id: "q_wc_" + uid + "_" + i, no: i, text: "ダミー問題 " + uid + "-" + i,
                     answers: [{ text: "ダミー答え" + i }], kanji: [pool[ki++ % pool.length]] });
      }
      return { unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3)) || 1],
               groups: [{ gno: 0, field, instruction: "ダミーの指示文（" + uid + "）", items }] };
    }
    BOOK_UNITS = [mk("dr_08", 6, "kaki"), mk("dr_25", 4, "bushu")];
    window.isVerifiedUnit = () => true;
    window.print = () => { window.__printed = (window.__printed || 0) + 1; };
    RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null;
    window.__day = "2099-01-01"; window.todayStr = () => window.__day;

    const ids = doneItemList().map(x => x.it.id);
    // 期待値はデータから作る（o＝〇の回数, x＝✕の回数, t＝やった回数）
    const want = {};
    const plan = [{ o: 1, x: 2 }, { o: 3, x: 0 }, { o: 0, x: 1 }];
    plan.forEach((p, i) => {
      if (!ids[i]) return;
      ITEMS[ids[i]] = { o: p.o, x: p.x, last: p.x ? "x" : "o", date: window.__day };
      want[ids[i]] = { x: p.x, t: p.o + p.x };
    });
    ids.slice(plan.length).forEach(id => { want[id] = null; });   // null ＝ まだ1回もやっていない
    renderAll();
    return { ids, want, planned: plan.length };
  });
  if (seeded.ids.length < 5) add("検査の前提が作れない（問題が5問未満）", String(seeded.ids.length));

  /* せってい →「問題」タブを開く */
  const read = await page.evaluate(() => {
    const snap = () => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));
    const before = JSON.stringify(ITEMS), lsBefore = snap();
    document.querySelector('.tab[data-page="setei"]').click();
    const t = document.getElementById("dl-tab-item");
    if (t) t.click();
    const rows = [...document.querySelectorAll("#done-box [data-dl-id]")].map(b => {
      const tr = b.closest("tr");
      return { id: b.dataset.dlId, cells: [...tr.querySelectorAll("td")].map(td => td.innerText.trim()) };
    });
    const box = document.getElementById("done-box");
    return {
      rows, hasItemTab: !!t, boxText: box ? box.innerText : "",
      changed: before !== JSON.stringify(ITEMS),
      lsChanged: lsBefore !== snap(),
      overflow: box ? box.scrollWidth - box.clientWidth : 0,
    };
  });

  if (!read.hasItemTab) add("「問題」タブが無い");
  if (!read.rows.length) add("「問題」の一覧に1行も出ていない");

  /* ---- 数が出ているか・合っているか・意味が読み取れるか ---- */
  const byId = {};
  read.rows.forEach(r => { byId[r.id] = r.cells; });
  let sawColumn = false;
  Object.keys(seeded.want).forEach(id => {
    const cells = byId[id];
    if (!cells) { add("一覧に出ていない問題がある", id); return; }
    const want = seeded.want[id];
    // 「まちがえ」の欄＝ ✕ か「−」だけが入っている欄（見出しの文字や色には寄りかからない）
    const cell = cells.find(t => /^[−\-]$/.test(t) || /✕\s*\d/.test(t));
    if (!cell) { add("まちがえの欄が見つからない", id + " / " + JSON.stringify(cells)); return; }
    sawColumn = true;
    if (want === null) {
      if (!/^[−\-]$/.test(cell)) add("まだやっていない問題が「−」になっていない", id + " → " + JSON.stringify(cell));
      return;
    }
    const mx = cell.match(/✕\s*(\d+)/);
    if (!mx) { add("✕の数が出ていない", id + " → " + JSON.stringify(cell)); return; }
    if (Number(mx[1]) !== want.x) add("✕の数が記録と合わない", id + " ✕" + mx[1] + " だが記録は ✕" + want.x);
    const mt = cell.match(/(\d+)\s*回/);
    if (!mt) add("★「何回中の✕か」が読み取れない（やった回数が出ていない）", id + " → " + JSON.stringify(cell));
    else if (Number(mt[1]) !== want.t) add("やった回数が記録と合わない", id + " " + mt[1] + "回 だが記録は " + want.t + "回");
  });
  if (!sawColumn) add("★まちがえの欄が、どの行にも無い");

  /* ---- 数を出したことで、記録が変わっていないか（依頼の失敗2） ---- */
  if (read.changed) add("★一覧を出しただけで記録（ITEMS）が変わった");
  if (read.lsChanged) add("★一覧を出しただけで localStorage が変わった");

  /* ---- 紙に出ていないか（依頼の失敗3）。★文字を探さず、紙を作らせて中を見る ---- */
  /* ⚠️ ここを「まちがえ」という語で見てはいけない。
        答えの紙にはもともと「まちがえた番号だけ、おてほんを見て…」と印刷されている（index.html の renderAnswerSheet）。
        語で見ると、直す前の版でも鳴る＝鳴りすぎ（4-3）。**(b) の偽物が実際にこれを見つけました（2026-09-25）。**
        見るのは「この機能が出す形」——`✕<数>` と、印の付いた欄そのもの。 */
  const paper = await page.evaluate(() => {
    SESSION = null;
    printSessionPractice();
    const r = document.getElementById("print-region");
    return { text: r.innerText, n: r.querySelectorAll(".p-sheet").length,
             marked: r.querySelectorAll("[data-wrong-id]").length };
  });
  if (!paper.n) add("検査の前提が作れない（紙が1枚も出ない）");
  if (paper.marked) add("★まちがえの欄が紙に入っている", paper.marked + "個");
  if (/✕\s*\d/.test(paper.text)) add("★紙に ✕ の数が印刷されている");

  /* ---- ✕が0件の人の画面（依頼の失敗4） ---- */
  const zero = await page.evaluate(() => {
    ITEMS = {}; renderAll();
    const t = document.getElementById("dl-tab-item"); if (t) t.click();
    const box = document.getElementById("done-box");
    return { rows: box ? box.querySelectorAll("[data-dl-id]").length : 0, text: box ? box.innerText : "" };
  });
  if (!zero.rows) add("★記録が0件だと、一覧が出なくなる");
  if (/✕\s*[1-9]/.test(zero.text)) add("★記録が0件なのに ✕ の数が出ている");

  /* ---- 390px ---- */
  await page.setViewportSize({ width: 390, height: 844 });
  const narrow = await page.evaluate(() => {
    ITEMS = {};
    const ids = doneItemList().map(x => x.it.id);
    if (ids[0]) ITEMS[ids[0]] = { o: 1, x: 2, last: "x", date: window.__day };
    renderAll();
    document.querySelector('.tab[data-page="setei"]').click();
    const t = document.getElementById("dl-tab-item"); if (t) t.click();
    const box = document.getElementById("done-box");
    return { over: box ? box.scrollWidth - box.clientWidth : 0 };
  });
  if (narrow.over > 1) add("★390px で一覧が横にはみ出す", narrow.over + "px");

  /* ★目で見るための写真（3-4「最後は必ず目で見る」）。--shot のときだけ撮る */
  if (SHOT && html === REAL) {
    await page.evaluate(() => {
      const ids = doneItemList().map(x => x.it.id);
      ITEMS = {};
      [[1, 2], [3, 0], [0, 1]].forEach((p, i) => {
        if (ids[i]) ITEMS[ids[i]] = { o: p[0], x: p[1], last: p[1] ? "x" : "o", date: window.__day };
      });
      renderAll();
      const t = document.getElementById("dl-tab-item"); if (t) t.click();
      document.getElementById("done-box").scrollIntoView();
    });
    await page.screenshot({ path: path.join(ROOT, "_shot_wrongcount_390.png") });
    await page.evaluate(() => {
      ITEMS = {}; renderAll();
      const t = document.getElementById("dl-tab-item"); if (t) t.click();
      document.getElementById("done-box").scrollIntoView();
    });
    await page.screenshot({ path: path.join(ROOT, "_shot_wrongcount_390_zero.png") });
    console.log("  （写真: _shot_wrongcount_390.png ／ _shot_wrongcount_390_zero.png）");
  }

  if (jsErrors.length) add("JSエラーが出た", jsErrors.join(" | "));
  await page.close();
  return { ng, rows: read.rows.length, overflow: read.overflow, narrowOver: narrow.over };
}

/* ---------------- 入口の自己テスト ---------------- */
console.log("=== 入口の自己テスト（落ちたら結果を出さずに止まります） ===");
console.log("ブラウザ:", browser._kankenChannel);
const selftests = [
  ["(a1) ／やった回数を落とした偽物", FAKES.a1(), true],
  ["(a2) 数を読むときに記録を書きかえる偽物", FAKES.a2(), true],
  ["(a3) 数が紙にも印刷される偽物", FAKES.a3(), true],
  ["(a4) ✕が0件だと一覧ごと消える偽物", FAKES.a4(), true],
  ["(b)  見た目だけ変えた偽物（中身は正しい）", FAKES.b(), false],
  ["(c)  直す前の版 " + BEFORE_FIX + "（コミットで固定）", beforeFixHtml(), true],
];
let selfFail = 0;
for (const [name, html, shouldRing] of selftests) {
  let r;
  try { r = await inspect(html); }
  catch (e) { console.log("  FAIL " + name + "  検査が落ちた: " + String(e.message).split("\n")[0]); selfFail++; continue; }
  const rang = r.ng.length > 0;
  if (rang === shouldRing) {
    console.log("  OK   " + name + " … " + (shouldRing ? "鳴った" : "鳴らなかった") + (rang ? "（" + r.ng[0] + "）" : ""));
  } else {
    selfFail++;
    console.log("  FAIL " + name + " … " + (shouldRing ? "鳴るべきなのに鳴らなかった" : "鳴ってはいけないのに鳴った"));
    r.ng.forEach(x => console.log("         " + x));
  }
}
if (selfFail) {
  console.log("\n✋ 自己テストが " + selfFail + " 件落ちました。**検査そのものが信用できないので、数字は出しません。**");
  await browser.close(); server.close();
  process.exit(3);
}
console.log("  → 自己テスト " + selftests.length + "/" + selftests.length + " 通過\n");

if (SELFTEST_ONLY) { await browser.close(); server.close(); process.exit(0); }

/* ---------------- 本物 ---------------- */
console.log("=== 本物（いまの index.html） ===");
const real = await inspect(REAL);
console.log("  一覧の行数: " + real.rows + "　／　はみ出し: 900px で " + real.overflow + "px・390px で " + real.narrowOver + "px");
if (real.ng.length) {
  console.log("  NG " + real.ng.length + " 件:");
  real.ng.forEach(x => console.log("    - " + x));
} else {
  console.log("  NG 0 件（✕の数が記録どおりに出ていて、記録は動かず、紙には出ていない）");
}
await browser.close(); server.close();
process.exit(real.ng.length ? 1 : 0);
