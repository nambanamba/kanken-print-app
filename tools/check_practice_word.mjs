// 答えとなおしの紙の「語の形」（国 ▢（こっき））が、決めたとおりに出ているかを見る。
// 依頼書: 司令塔\回答\漢検アプリ_練習を問題の形で出す_依頼_2026-09-27.md
//
// 使い方:
//   node tools/check_practice_word.mjs            ← 入口の自己テストを通してから、本物を見る
//   node tools/check_practice_word.mjs --selftest ← 自己テストだけ
//   node tools/check_practice_word.mjs --shot     ← 答えの紙を撮る（_shot_practice_word.png）。★最後は目で見るため（3-4）
//
// 見ること:
//   ① 問題に出た語（2026-10-03: 本の読み問題に無くても使う。読みは本にあるときだけ） ／ ② 問題に語が無ければ本の別の語（短い語が先）／ ③ どちらも無ければ字だけ
//   ★部首（2026-10-03）: 答え1字ずつを「漁▢・不▢・入▢」の語の形にする（1マスに3字を詰めない）。読みは問題の紙に印刷されている字の読み
//   ★読みは本の読み問題の答えそのまま。読みが2通りの語・未照合の単元の語・1字の語は使わない（推測しない・A-6）
//   ★書く字は1字（おてほん・なぞるの大きい字が1字、じぶんでの空マスが1つ。ほかの字は濃く小さく）
//   ★③の字が落ちない ／ 部首（答えが複数）は今までどおり
//   ★合言葉が無い（本が読めていない）ときに壊れない ／ 紙からはみ出さない・空マスが小さすぎない・読みが札に重ならない
//
// ★入口に自己テストを置いてある（確認ポイント 4-6）。1つでも落ちたら、結果を出さずに終了コード3で止まる。
// ⚠️ 本の問題文は使わない（このファイルは公開リポジトリに入る）。検査用の本はダミーで組む。

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/* ★直す前の版。**コミットで固定する**（4-6c）。e5b9946 ＝ 2026-09-27 にこの機能を足す直前の origin/master */
const BEFORE_FIX = "e5b9946";
const SELFTEST_ONLY = process.argv.includes("--selftest");
const SHOT = process.argv.includes("--shot");

function mutate(src, pairs, name) {
  let out = src;
  for (const [from, to] of pairs) {
    if (!out.includes(from)) {
      console.error("✋ 偽物「" + name + "」を作れませんでした。書きかえ元が見つかりません:\n   " + from);
      console.error("   （index.html／kanken-practice.js を直したときは、この検査の偽物の作り方も直してください）");
      process.exit(3);
    }
    out = out.split(from).join(to);
  }
  if (out === src) { console.error("✋ 偽物「" + name + "」が本物と同じになりました"); process.exit(3); }
  return out;
}

const REAL = { html: fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
               js: fs.readFileSync(path.join(ROOT, "kanken-practice.js"), "utf8") };
const NL = REAL.html.includes("\r\n") ? "\r\n" : "\n";
const withHtml = (pairs, name) => ({ html: mutate(REAL.html, pairs, name), js: REAL.js });
const withJs = (pairs, name) => ({ html: REAL.html, js: mutate(REAL.js, pairs, name) });

const FAKES = {
  // (a) 語を出さず、字だけのまま
  a: () => withHtml([["word: practiceWordFor(it, x.g, bookWordDict())", "word: null"]], "a 字だけのまま"),
  // (b) 本に語が無い字に、読みを推測して書く
  b: () => withJs([["  if (!w) return null;",
                    "  if (!w) return { pre: \"\", k: k, post: \"\", yomi: \"すいそく\", how: \"guess\", word: k };"]], "b 推測の読み"),
  // (b2) 読みが2通りある語を使う（どちらかを勝手に選ぶ）
  b2: () => withJs([["    if (ys.length !== 1) return;", "    if (!ys.length) return;"]], "b2 読み2通りの語を使う"),
  // (b3) 照合が通っていない単元の語も使う
  b3: () => withHtml([["buildWordDict(BOOK_UNITS, isVerifiedUnit)", "buildWordDict(BOOK_UNITS, null)"]], "b3 未照合の語を使う"),
  // (c) ③（本に語が無い字）を落とす
  c: () => withHtml([["row.word?wordGlyphs(row.word,\"p-sample\"):ansGlyphs(row,\"p-sample\",hmm)",
                      "row.word?wordGlyphs(row.word,\"p-sample\"):\"\""],
                     ["row.word?wordGlyphs(row.word,\"p-trace\"):ansGlyphs(row,\"p-trace\",hmm)",
                      "row.word?wordGlyphs(row.word,\"p-trace\"):\"\""]], "c ③を落とす"),
  // (i) 部首の語の形を出さない（3字を1マスに詰めた形のまま）
  i: () => withHtml([["words: practiceWordsFor(it, x.g)", "words: null"]], "i 部首が語の形でない"),
  // (j) 問題に出た語に、本に読みが無いのに読みを作る
  j: () => withJs([["yomi: wd.dict[w0] || \"\"", "yomi: wd.dict[w0] || \"すいそく\""]], "j 読みを作る"),
  // (k) 問題に出た語を使わず、本の別の語に置きかえる
  k: () => withJs([["if (o && (o.pre || o.post)) {", "if (false) {"]], "k 別の語に置きかえる"),
  // (l) 部首の字の読みを、問題の紙と違うものにする
  l: () => withJs([["yomi: /^[ぁ-ゖー]+$/.test(y) ? y : \"\", yk: true", "yomi: \"ぎょ\", yk: true"]], "l 部首の読みが違う"),
  // (d) 合言葉が無い（本が読めていない）と壊れる
  d: () => withHtml([["  if(!BOOK_UNITS) return null;" + NL + "  if(WORD_DICT_SRC", "  if(!BOOK_UNITS) return WORD_DICT.dict;" + NL + "  if(WORD_DICT_SRC"]], "d 合言葉なしで壊れる"),
  // (e) 書く字が2字になる（語のほかの字まで なぞり・大きい字にする）
  e: () => withHtml([["\"<span class='p-wo'>\"+esc(s)", "\"<span class='p-wk'>\"+esc(s)"]], "e 書く字が2字"),
  // (f) 空マスが小さすぎる
  f: () => withHtml([[".p-word .p-wbox{display:inline-block;flex:0 0 auto;width:var(--ks);height:var(--ks);",
                      ".p-word .p-wbox{display:inline-block;flex:0 0 auto;width:4mm;height:4mm;"]], "f 空マスが小さい"),
  // (f2) 読みの大きさを固定にする（長い読みが札に重なる）
  f2: () => withHtml([["          font-size:min(6.5pt, calc((100cqw - 11mm) / var(--yl,5)));}", "          }"]], "f2 読みが札に重なる"),
  // (f3) 札の行の高さを戻す（空マスが札にかかる）
  f3: () => withHtml([["    .p-ansheet .p-slotlab{line-height:1;}", ""]], "f3 空マスが札にかかる"),
  // (g) 見た目だけ変えた（読みの色・字のすきま）。中身は正しいので**鳴ってはいけない**
  g: () => withHtml([[".p-wy{position:absolute;top:0.3mm;right:0.8mm;font-size:6.5pt;color:#444;",
                      ".p-wy{position:absolute;top:0.3mm;right:0.8mm;font-size:6.5pt;color:#1e3a8a;"],
                     ["gap:0.6mm;height:100%;", "gap:0.9mm;height:100%;"]], "g 見た目だけ"),
};
function beforeFix() {
  try {
    const g = f => execFileSync("git", ["show", BEFORE_FIX + ":" + f], { cwd: ROOT, maxBuffer: 1 << 28 }).toString("utf8");
    return { html: g("index.html"), js: "" };
  } catch (e) { console.error("✋ 対照の版 " + BEFORE_FIX + " を取り出せませんでした"); process.exit(3); }
}

/* ---------------- サーバ（index.html と kanken-practice.js を差し替えられる） ---------------- */
const MIME = { ".html": "text/html", ".js": "text/javascript" };
let SERVE = REAL;
const server = http.createServer((req, res) => {
  if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html";
  if (rel === "index.html") { res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" }); return res.end(SERVE.html); }
  if (rel === "kanken-practice.js" && SERVE.js) { res.writeHead(200, { "Content-Type": "text/javascript; charset=UTF-8" }); return res.end(SERVE.js); }
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;
let chromium;
try { chromium = await getChromium(); } catch (e) { console.error(e.message); process.exit(2); }
const browser = await launchBrowser(chromium);

async function inspect(ver, shotPath) {
  SERVE = ver;
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const jsErrors = [];
  page.on("pageerror", e => jsErrors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") jsErrors.push(m.text()); });
  page.on("dialog", d => d.accept());
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  const ng = [];
  const add = (why, extra = "") => ng.push(why + (extra ? "  " + extra : ""));

  const got = await page.evaluate(() => {
    const out = { err: [] };
    try {
      /* ---- ダミーの本。字はマスタから、読みはこちらで決めた文字列（本の文面は使わない） ---- */
      const P = KANJI_MASTER.map(r => r.k).filter(c => /^[一-鿿]$/.test(c));
      const [A, B, C, D, E, F, G, H, I, J] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(i => P[i]);
      const L1 = P[110], L2 = P[120];   // 読みが長い語（札との重なりを見るため）
      const yo = (id, t, a) => ({ id, no: 1, text: "テストの" + t + "をよむ。", target: t, targetNth: 1, answers: [{ text: a }], kanji: Array.from(t) });
      const kk = (id, text, t, a) => ({ id, no: 1, text, target: t, targetNth: 1, answers: [{ text: a }], kanji: [a] });
      const yomiU = { unitId: "dr_01", mat: "dr", srcPages: [1], groups: [{ gno: 0, field: "yomi", instruction: "ダミー", items: [
        yo("y1", A + B, "あいう"), yo("y2", C + D, "かきく"), yo("y3", E + F, "さしす"), yo("y4", E + F, "たちつ"),
        yo("y5", I + J, "なにぬ"), yo("y6", C + I + J, "まみむめ"), yo("y7", G, "はひ"), yo("y8", C + D, "かきく"), yo("y10", L1 + L2, "ひゃっかてんのみせ")] }] };
      const unverified = { unitId: "dr_99", mat: "dr", srcPages: [99], groups: [{ gno: 0, field: "yomi", instruction: "ダミー", items: [
        yo("y9", G + H, "やゆよ")] }] };
      // 期待: {pre,k,post,yomi} か {plain:[答え…]}
      const want = {};
      const kaki = [];
      const base6 = [
        [ "テストの" + A + "ビーをかく。", "ビー", B, { pre: A, k: B, post: "", yomi: "あいう" } ],   // ① 同じ問題の語
        [ "テストのシーをかく。", "シー", C, { pre: "", k: C, post: D, yomi: "かきく" } ],           // ② 別の語（短い語が先）
        [ "テストのジーをかく。", "ジー", G, { plain: [G] } ],                                         // ③ 1字の語・未照合の語しか無い
        [ "テストのイーをかく。", "イー", E, { plain: [E] } ],                                         // ③ 読みが2通りの語しか無い
        [ "テストのアイ" + J + "をかく。", "アイ", I, { pre: "", k: I, post: J, yomi: "なにぬ" } ],   // ① 後ろにとなる語
        [ "テスト" + H + "のシー" + I + "。", "シー", C, { pre: "", k: C, post: I, yomi: "" } ],     // ① 問題の語（本に読みが無い）→ 語の形だけ・読みは出さない
      ];
      for (let i = 0; i < 36; i++) {        // ★行が多い日（マスが小さくなる日）も見るため、36問にする
        const b = base6[i % base6.length], id = "k" + (i + 1);
        const it = kk(id, b[0], b[1], b[2]); it.no = i + 1; kaki.push(it); want[id] = b[3];
      }
      kaki.push(kk("k37", "テストの" + L1 + "ケーをかく。", "ケー", L2)); kaki[kaki.length - 1].no = 37;
      want.k37 = { pre: L1, k: L2, post: "", yomi: "ひゃっかてんのみせ" };
      const kakiU = { unitId: "dr_08", mat: "dr", srcPages: [8], groups: [{ gno: 0, field: "kaki", instruction: "ダミー", items: kaki }] };
      const onajiU = { unitId: "dr_27", mat: "dr", srcPages: [27], groups: [{ gno: 0, field: "onaji", instruction: "ダミー", items: [
        kk("o1", "テストのビーをかく。", "ビー", B)] }] };
      want.o1 = { pre: A, k: B, post: "", yomi: "あいう" };
      const taigiU = { unitId: "dr_21", mat: "dr", srcPages: [21], groups: [{ gno: 0, field: "taigi", instruction: "ダミー", items: [
        { id: "t1", no: 1, text: "ダミー — □" + D, target: null, answers: [{ text: C, around: "□" + D }], kanji: [C] },
        { id: "t2", no: 2, text: "ダミー — □" + A, target: null, answers: [{ text: H, around: "□" + A }], kanji: [H] }] }] };
      want.t1 = { pre: "", k: C, post: D, yomi: "かきく" }; want.t2 = { pre: "", k: H, post: A, yomi: "" };
      const bushuU = { unitId: "dr_25", mat: "dr", srcPages: [25], groups: [{ gno: 0, field: "bushu", instruction: "ダミー", items: [
        { id: "b1", no: 1, text: "ダミー", ruby: [{ base: "□", yomi: "あ", nth: 1 }, { base: "□", yomi: "いう", nth: 2 }, { base: "□", yomi: "え", nth: 3 }],
          answers: [{ text: A, around: "□" + C }, { text: B, around: D + "□" }, { text: E, around: "□" + F }], kanji: [A, B, E] }] }] };
      want.b1 = { words: [{ pre: "", k: A, post: C, yomi: "あ" }, { pre: D, k: B, post: "", yomi: "いう" }, { pre: "", k: E, post: F, yomi: "え" }], plain: [A, B, E] };

      BOOK_UNITS = [yomiU, unverified, kakiU, onajiU, taigiU, bushuU];
      window.isVerifiedUnit = id => id !== "dr_99";
      window.print = () => {};
      window.todaySheetItems = () => bookAllItems();
      RECORDS = {}; ITEMS = {}; WEAK = {}; KSTATS = {}; LOG = []; SESSION = null;
      out.want = want;

      const readRows = (root) => [...root.querySelectorAll(".p-ansheet .p-body tr")].filter(tr => tr.querySelector(".p-no")).map(tr => {
        const slots = [...tr.querySelectorAll(".p-slot")];
        return slots.map(s => {
          const sr = s.getBoundingClientRect();
          const inside = [...s.querySelectorAll("span,div")].every(e => {
            const r = e.getBoundingClientRect(); if (!r.width && !r.height) return true;
            return r.left >= sr.left - 1 && r.right <= sr.right + 1 && r.top >= sr.top - 1 && r.bottom <= sr.bottom + 1;
          });
          const box = s.querySelector(".p-wbox"), br = box && box.getBoundingClientRect();
          const lab = s.querySelector(".p-slotlab"), wy = s.querySelector(".p-wy");
          const lr = lab && lab.getBoundingClientRect(), yr = wy && wy.getBoundingClientRect();
          const clash = !!(lr && yr && yr.width && lr.right > yr.left + 0.5 && lr.bottom > yr.top && yr.bottom > lr.top);
          // 空マス・練習する字が、札や読みにかかっていないか（上の帯と重ならない）
          const big = s.querySelector(".p-wbox") || s.querySelector(".p-wk"), gr = big && big.getBoundingClientRect();
          const topBand = Math.max(lr ? lr.bottom : 0, yr && yr.width ? yr.bottom : 0);
          const clashBox = !!(gr && gr.height && gr.top < topBand - 0.5);
          return {
            wy: [...s.querySelectorAll(".p-wy")].map(e => e.textContent),
            wyi: [...s.querySelectorAll(".p-wyi")].map(e => e.textContent),
            cells: s.querySelectorAll(".p-wcell").length,
            cellsK: [...s.querySelectorAll(".p-wcell")].map(c => [...c.querySelectorAll(".p-wk")].map(e => e.textContent).join("")),
            cellsO: [...s.querySelectorAll(".p-wcell")].map(c => [...c.querySelectorAll(".p-wo")].map(e => e.textContent).join("")),
            cellsBox: [...s.querySelectorAll(".p-wcell")].map(c => c.querySelectorAll(".p-wbox").length),
            wo: [...s.querySelectorAll(".p-wo")].map(e => e.textContent),
            wk: [...s.querySelectorAll(".p-wk")].map(e => e.textContent),
            wkColor: [...s.querySelectorAll(".p-wk")].map(e => getComputedStyle(e).color),
            woColor: [...s.querySelectorAll(".p-wo")].map(e => getComputedStyle(e).color),
            box: s.querySelectorAll(".p-wbox").length, boxPx: br ? Math.min(br.width, br.height) : 0,
            ac: [...s.querySelectorAll(".p-acell")].map(e => e.textContent),
            clash, clashBox,
            text: s.innerText.replace(/おてほん|なぞる|じぶんで|\s/g, ""), inside
          };
        });
      });

      /* ---- 本物の紙の組み立て（printSessionPractice）を通す ---- */
      printSessionPractice();
      const region = document.getElementById("print-region");
      // ★画面では印刷領域が隠れていて寸法が0になる。測るあいだだけ、紙の幅で見える所に出す（ansFits と同じ考え方）
      region.setAttribute("style", "display:block;position:absolute;left:0;top:0;width:210mm;");
      out.ids = buildPaperBlocks().reduce((a, b) => a.concat(b.rows.map(r => r.id)), []);
      out.rows = readRows(region);
      out.mm = 96 / 25.4;
      out.fit = [...region.querySelectorAll(".p-ansheet .p-body")].map(b => b.scrollHeight - b.clientHeight);
      out.sheets = region.querySelectorAll(".p-ansheet").length;
      out.kanji = buildPaperBlocks().reduce((a, b) => a.concat(b.rows.map(r => r.id + ":" + (r.kanji || []).join(""))), []);

      /* ---- 合言葉が無い（本が読めていない）とき ---- */
      const list = bookAllItems();
      BOOK_UNITS = null;
      try {
        renderAll();
        const bs = buildPaperBlocks(list);
        const tmp = document.createElement("div");
        tmp.setAttribute("style", "display:block;position:absolute;left:0;top:0;width:210mm;");
        tmp.innerHTML = renderAnswerSheet(bs, 1, 1, "検査");
        document.body.appendChild(tmp);
        out.noPass = readRows(tmp);
        tmp.remove();
      } catch (e) { out.noPassErr = String(e); }
      BOOK_UNITS = [yomiU, unverified, kakiU, onajiU, taigiU, bushuU];
    } catch (e) { out.err.push(String(e && e.stack || e)); }
    return out;
  });
  if (got.err.length) { add("検査の途中で止まった", got.err.join(" | ")); }
  else {
    if (got.ids.length !== got.rows.length) add("答えの紙の行数が、問題の数と合わない", got.rows.length + " / " + got.ids.length);
    const check = (rows, label, allPlain) => {
      got.ids.forEach((id, i) => {
        const w = (allPlain && !got.want[id].words) ? { plain: (got.want[id].plain || [got.want[id].k]) } : got.want[id], r = rows[i];   // 部首の語の形は本の辞書に頼らないので、合言葉なしでも出る
        if (!w) { add(label + "期待値の無い問題", id); return; }
        if (!r || r.length !== 3) { add(label + "答えの行が3マスでない", id); return; }
        const [s0, s1, s2] = r;
        if (w.words) {   // 部首: 字ごとに1つの語の形（1マスに詰めない）。読みは問題の紙の字の読み
          [s0, s1, s2].forEach((s, j) => {
            const nm = ["おてほん", "なぞる", "じぶんで"][j];
            if (s.cells !== w.words.length) { add(label + "★部首が字の数の語の形になっていない", id + " " + nm + " " + s.cells + " 期待 " + w.words.length); return; }
            w.words.forEach((x, n) => {
              if (j < 2 && s.cellsK[n] !== x.k) add(label + "★部首の練習する字が違う", id + " " + nm + " " + n + " " + s.cellsK[n]);
              if (j === 2 && (s.cellsBox[n] !== 1 || s.cellsK[n])) add(label + "★部首のじぶんでが空マス1つでない", id + " " + n);
              if (s.cellsO[n] !== x.pre + x.post) add(label + "★部首の語のほかの字が違う", id + " " + nm + " " + s.cellsO[n] + " 期待 " + x.pre + x.post);
            });
            if (s.wyi.join("") !== w.words.map(x => x.yomi).join("")) add(label + "★部首の字の読みが問題の紙と違う", id + " " + nm + " " + JSON.stringify(s.wyi));
            if (!s.inside) add(label + "★マスからはみ出している", id + " " + nm);
          });
          return;
        }
        if (w.plain) {
          if (s0.wy.length || s1.wy.length || s2.wy.length || s0.wo.length || s2.box)
            add(label + "★本に語が無い字に、語か読みが出ている（推測）", id + " " + JSON.stringify([s0.wy, s0.wo]));
          if (JSON.stringify(s0.ac) !== JSON.stringify(w.plain) || JSON.stringify(s1.ac) !== JSON.stringify(w.plain))
            add(label + "★字だけの行の字が出ていない（落ちた）", id + " " + JSON.stringify([s0.ac, s1.ac]) + " 期待 " + JSON.stringify(w.plain));
          if (s2.text) add(label + "字だけの行の じぶんで に何か出ている", id + " " + s2.text);
          return;
        }
        const others = [w.pre, w.post].filter(Boolean);
        const yomiT = w.yomi ? "（" + w.yomi + "）" : "";
        [s0, s1, s2].forEach((s, j) => {
          const nm = ["おてほん", "なぞる", "じぶんで"][j];
          if (s.wy.join("") !== yomiT) add(label + "★読みが本の読み問題と違う", id + " " + nm + " " + JSON.stringify(s.wy) + " 期待 " + yomiT);
          if (JSON.stringify(s.wo) !== JSON.stringify(others)) add(label + "★語のほかの字が違う", id + " " + nm + " " + JSON.stringify(s.wo) + " 期待 " + JSON.stringify(others));
          if (s.woColor.some(c => c === "rgb(201, 201, 201)")) add(label + "★語のほかの字が なぞり色（書く字が増える）", id + " " + nm);
          if (!s.inside) add(label + "★マスからはみ出している", id + " " + nm);
          if (s.clash) add(label + "★読みが札（おてほん等）に重なっている", id + " " + nm);
          if (s.clashBox) add(label + "★空マス／練習する字が、札か読みにかかっている", id + " " + nm);
        });
        if (JSON.stringify(s0.wk) !== JSON.stringify([w.k])) add(label + "★おてほんの練習する字が1字でない／違う", id + " " + JSON.stringify(s0.wk));
        if (JSON.stringify(s1.wk) !== JSON.stringify([w.k])) add(label + "★なぞるの字が1字でない／違う", id + " " + JSON.stringify(s1.wk));
        if (s1.wkColor[0] !== "rgb(201, 201, 201)") add(label + "なぞる字がうすくない", id + " " + s1.wkColor[0]);
        if (s2.box !== 1 || s2.wk.length) add(label + "★じぶんでの空マスが1つでない", id + " 空マス" + s2.box + " 字" + s2.wk.length);
        else if (s2.boxPx < 7 * got.mm) add(label + "★じぶんでの空マスが小さすぎる（7mm未満）", id + " " + (s2.boxPx / got.mm).toFixed(1) + "mm");
        if ((s0.text.match(/（/g) || []).length > 1) add(label + "読みが二重", id);
      });
    };
    check(got.rows, "", false);
    if (got.noPassErr) add("★合言葉が無い（本が読めていない）と壊れる", got.noPassErr);
    else if (!got.noPass || got.noPass.length !== got.ids.length) add("★合言葉が無いと、答えの紙の行が出ない", String(got.noPass && got.noPass.length));
    else check(got.noPass, "[合言葉なし] ", true);
    got.fit.forEach((d, i) => { if (d > 1) add("★答えの紙がはみ出す", (i + 1) + "枚め " + d + "px"); });
    const expectKanji = got.ids.map(id => id + ":" + (got.want[id].words ? got.want[id].plain.join("") : got.want[id].plain ? got.want[id].plain.join("") : got.want[id].k));
    if (JSON.stringify(got.kanji) !== JSON.stringify(expectKanji)) add("★採点の字（kanji）が変わった", "");
  }
  if (shotPath) {
    await page.emulateMedia({ media: "print" });
    const el = await page.$("#print-region .p-ansheet");
    await page.evaluate(() => { const r = document.getElementById("print-region"); r.style.display = "block"; });
    if (el) await el.screenshot({ path: shotPath });
    console.log("  （写真: " + path.basename(shotPath) + "）");
  }
  if (jsErrors.length) add("JSエラーが出た", jsErrors.join(" | "));
  await page.close();
  return { ng, rows: got.rows ? got.rows.length : 0, sheets: got.sheets };
}

console.log("=== 入口の自己テスト（落ちたら結果を出さずに止まります） ===");
console.log("ブラウザ:", browser._kankenChannel);
const selftests = [
  ["(a)  語を出さず字だけのまま", FAKES.a(), true],
  ["(b)  本に語が無い字に、読みを推測して書く", FAKES.b(), true],
  ["(b2) 読みが2通りの語を使う", FAKES.b2(), true],
  ["(b3) 照合が通っていない単元の語を使う", FAKES.b3(), true],
  ["(c)  本に語が無い字（③）を落とす", FAKES.c(), true],
  ["(d)  合言葉が無いと壊れる", FAKES.d(), true],
  ["(e)  書く字が2字になる", FAKES.e(), true],
  ["(f)  空マスが小さすぎる", FAKES.f(), true],
  ["(f2) 読みの大きさが固定（長い読みが札に重なる）", FAKES.f2(), true],
  ["(f3) 札の行の高さが既定（空マスが札にかかる）", FAKES.f3(), true],
  ["(i)  部首が語の形でない（3字を1マスに詰めた形）", FAKES.i(), true],
  ["(j)  問題の語に、本に無い読みを作る", FAKES.j(), true],
  ["(k)  問題に出た語を使わず、本の別の語に置きかえる", FAKES.k(), true],
  ["(l)  部首の字の読みが問題の紙と違う", FAKES.l(), true],
  ["(g)  見た目だけ変えた（中身は正しい）", FAKES.g(), false],
  ["(h)  直す前の版 " + BEFORE_FIX + "（コミットで固定）", beforeFix(), true],
];
let selfFail = 0;
for (const [name, ver, shouldRing] of selftests) {
  const r = await inspect(ver);
  const rang = r.ng.length > 0, ok = rang === shouldRing;
  if (!ok) selfFail++;
  console.log((ok ? "  OK " : "  NG ") + name + " → " + (rang ? "鳴った（" + r.ng.length + "件。例: " + r.ng[0] + "）" : "鳴らなかった"));
}
if (selfFail) { console.log("\n✋ 自己テストが " + selfFail + " 件落ちました。検査が信用できないので、結果は出しません。"); await browser.close(); server.close(); process.exit(3); }
if (SELFTEST_ONLY) { await browser.close(); server.close(); process.exit(0); }

console.log("\n=== 本物の index.html ===");
const r = await inspect(REAL, SHOT ? path.join(ROOT, "_shot_practice_word.png") : null);
console.log("  答えの紙 " + r.sheets + " 枚・" + r.rows + " 行を見ました");
r.ng.forEach(x => console.log("  NG " + x));
console.log(r.ng.length ? "\n✋ " + r.ng.length + " 件" : "\n★ 全部通りました");
await browser.close(); server.close();
process.exit(r.ng.length ? 1 : 0);
