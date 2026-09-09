// index.html の1日ぶんの流れを、ヘッドレスChromeで通しで確認する。
//
// 使い方:  node tools/smoke-test.mjs
//
// 確認する流れ（引き継ぎ.md 12章の設計）
//   ① 字が1つずつ出る（選択式＝自動判定／書き取り＝「書ける・あやしい」）
//   ② 「あやしい」が10個たまったら終了
//   ③ その10字で練習プリントを印刷
//   ④ 記録が残り、応援画面に反映される
//
// 注意:
// - 件数を決め打ちしない。その場のデータから数えて、つじつまだけを見る（C-8b）。
// - 印刷そのものは確認できないので、印刷用HTMLが組み立てられたかを見る。

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let chromium;
try { chromium = await getChromium(); }
catch (e) { console.error(e.message); process.exit(2); }

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const server = http.createServer((req, res) => {
  // index.html は favicon を参照していないが、Edge / Chrome は自分から /favicon.ico を取りに来る。
  // 404 を返すとコンソールにエラーが出て「JSエラーが無い」が落ちるので、空で204を返す。
  // （同梱chromium では要求が来なかったため、msedge に切り替えて初めて出た。アプリの不具合ではない）
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
  n: KANJI_MASTER.length,
  ids: new Set(KANJI_MASTER.map(r => r.id)).size,
  points: FIELDS.reduce((s, f) => s + f.points, 0)
}));
ok("漢字マスタが読めている（" + master.n + "字）", master.n > 0);
ok("id に重複が無い", master.ids === master.n, `${master.ids}/${master.n}`);
ok("配点の合計が満点と一致", master.points === 200, String(master.points));

console.log("\n=== ① セッションを始める ===");
await page.click('.tab[data-page="kyou"]');
await page.click('button:has-text("はじめる")');
const s0 = await page.evaluate(() => ({
  n: SESSION.items.length,
  target: SESSION.unsureTarget,
  fields: [...new Set(SESSION.items.map(i => i.field))],
  allKanji: SESSION.items.every(i => i.kanji && MASTER_BY_K[i.kanji]),
  // ★同じ字を書き取りと選択式の両方に出していないか（一方が他方の答えになる）
  dupKanji: (() => { const k = SESSION.items.map(i => i.kanji); return k.length - new Set(k).size; })()
}));
ok("セッションが作られた", s0.n > 0, JSON.stringify(s0));
ok("「あやしい」の目標が10", s0.target === 10, String(s0.target));
ok("書き取りと選択式が混ざっている", s0.fields.includes("kaki") && s0.fields.length > 1, s0.fields.join(","));
ok("全問がマスタの字に紐づく", s0.allKanji);
ok("同じ字を2回出していない", s0.dupKanji === 0, String(s0.dupKanji));
ok("最初の1問が表示されている", (await page.locator("#ky-q").textContent()).trim().length > 0);

console.log("\n=== ② 答えていく（選択式は自動判定／書き取りは自己申告） ===");
// 選択式に正しく答えたときに◯が出るか、まず1問だけ確かめる
const selFirst = await page.evaluate(() => {
  // 最初の選択式問題までの位置を返す
  for (let i = SESSION.pos; i < SESSION.items.length; i++)
    if (SESSION.items[i].field !== "kaki") return { i, a: SESSION.items[i].a, field: SESSION.items[i].field };
  return null;
});
ok("選択式の問題が存在する", !!selFirst);

// 書き取りに答えていって、「あやしい」が10個たまったら終わるか。
// ★3問に1問は「書ける」を押す。**押さないと自己申告が1件も残らず、
//   抜き取り検証（12-3）の検査が「空配列に every」で丸ごと素通りする**
//   （実際、最初に書いたときは素通りしていた。引き継ぎ.md 8章の教訓）。
let guard = 0, kakiSeen = 0, saidKnow = 0, sawSwitch = false, selAtSwitch = null;
while (guard++ < 400) {
  const st = await page.evaluate(() => ({
    done: SESSION.done, phase: SESSION.phase,
    field: (SESSION.items[SESSION.pos] || {}).field,
    sel: SESSION.sel, limit: SESSION.selectLimit, missTarget: SESSION.selectMissTarget
  }));
  if (st.done) break;
  // ★前半→後半の切りかえ画面。ここで一拍おく
  if (st.phase === "switch") {
    if (!sawSwitch) { sawSwitch = true; selAtSwitch = st; }
    await page.click('button:has-text("すすむ")');
    continue;
  }
  if (st.field === "kaki" || st.field === "yomi") {
    // ★読みのボタンは「読める」、書きは「書ける」。文言が違うので分ける
    if (kakiSeen++ % 3 === 2) {
      await page.click(st.field === "yomi" ? 'button:has-text("読める")' : 'button:has-text("書ける")');
      saidKnow++;
    } else { await page.click('button:has-text("あやしい")'); }
  } else {
    // 選択式は正解を押す（自動判定が働くか見る）
    const clicked = await page.evaluate(() => {
      const q = SESSION.items[SESSION.pos];
      const btns = [...document.querySelectorAll("#ky-choices .ky-btn")];
      const hit = btns.find(b => b.textContent.replace(/\s|画/g, "").endsWith(String(q.a).replace(/\s/g, "")));
      (hit || btns[0]).click();
      return true;
    });
    if (clicked) await page.waitForTimeout(700);
  }
}
const s1 = await page.evaluate(() => ({
  done: SESSION.done, unsure: SESSION.unsure.length, target: SESSION.unsureTarget,
  sel: SESSION.sel, pos: SESSION.pos, ranOut: SESSION.ranOut,
  // ★紙に出るのは「あやしい」＋黙って混ぜた検証字（12-3）。件数は決め打ちしない（C-8b）
  audit: (SESSION.audit || []).length, sheet: (SESSION.sheet || []).length
}));
// ★前半＝選択式・後半＝書き（2026-09-09 の設計変更）
ok("前半→後半の切りかえ画面を通った", sawSwitch);
ok("前半は20問か、まちがい10個で終わっている",
   !!selAtSwitch && ((selAtSwitch.sel.o + selAtSwitch.sel.x) >= selAtSwitch.limit
                     || selAtSwitch.sel.x >= selAtSwitch.missTarget),
   JSON.stringify(selAtSwitch && selAtSwitch.sel));
const order = await page.evaluate(() => {
  const it = SESSION.items, fw = SESSION.firstWrite;
  return {
    // 前半に書きが混ざっていない／後半に選択式が混ざっていない
    frontAllSelect: it.slice(0, fw).every(q => q.field !== "kaki"),
    // 後半は自己申告の形式（書き・読み）だけ。★読みは4択にしないので、ここに入る
    backAllWrite:   it.slice(fw).every(q => isWriteField(q.field)),
    backHasYomi:    it.slice(fw).some(q => q.field === "yomi"),
    // ★1形式に偏らせない（画数・部首・音訓＝50点は短時間で伸びる。引き継ぎ.md 6章）
    fields: [...new Set(it.slice(0, fw).map(q => q.field))].length,
    frontN: fw,
    limit: SESSION.selectLimit,
    // ★★前半で聞いた字が、後半経由で紙に載らないこと（A-1）。
    //   練習プリントは字と読みを印刷するので、載ると答えが紙に出る
    noShared: (() => {
      const f = new Set(it.slice(0, fw).map(q => q.kanji));
      return it.slice(fw).every(q => !f.has(q.kanji));
    })()
  };
});
ok("前半は選択式だけ", order.frontAllSelect);
ok("後半は自己申告の形式だけ（書き・読み）", order.backAllWrite);
ok("後半に読みが入っている（30点分）", order.backHasYomi);
ok("前半が1形式に偏っていない", order.fields > 1, String(order.fields));

// ★形式ごとの出題数を、本番の配点の比で決めている（2026-09-09 ユーザー指示）。
//   均等だと画数が1/3出ていたが、本番は 10問・10点＝5% しかない。
const share = await page.evaluate(() => {
  const s = buildSession({ kstats: {}, dayKey: "w1" });
  const front = s.items.slice(0, s.firstWrite);
  const cnt = {};
  SELECT_FIELDS.forEach(f => { cnt[f] = 0; });
  front.forEach(q => { if (cnt[q.field] !== undefined) cnt[q.field]++; });
  const pts = {};
  SELECT_FIELDS.forEach(f => { pts[f] = FIELDS.filter(x => x.key === f)[0].points; });
  return { cnt, pts, n: front.length, limit: s.selectLimit };
});
// ★どの形式も0問にしない。比率の端数で簡単に0になり、
//   その形式がまるごと出なくなったことに本番まで気づかない
ok("どの形式も0問になっていない",
   Object.keys(share.cnt).every(f => share.cnt[f] > 0), JSON.stringify(share.cnt));
ok("前半の合計が上限を超えていない", share.n <= share.limit, `${share.n}/${share.limit}`);
// 画数（10点）が、音訓・部首（各20点）より多く出ていないこと
ok("画数が、配点の大きい形式より多く出ていない",
   share.cnt.kakusu <= share.cnt.onkun && share.cnt.kakusu <= share.cnt.bushu,
   JSON.stringify(share.cnt));
// 均等（1/3≒33%）から、配点比（20%）に下がっていること
ok("画数の比率が均等（1/3）より下がっている",
   share.cnt.kakusu / share.n < 0.30,
   `${share.cnt.kakusu}/${share.n} = ${Math.round(share.cnt.kakusu / share.n * 100)}%`);
ok("前半の問題数が上限を超えていない", order.frontN <= order.limit, `${order.frontN}/${order.limit}`);
ok("★前半で聞いた字が後半（＝紙）に出てこない（A-1）", order.noShared);
ok("「書ける」も押している（検証の入口ができている）", saidKnow > 0, String(saidKnow));
ok("セッションが終了した", s1.done === true);
ok("「あやしい」が10個たまって終わった", s1.unsure === s1.target, `${s1.unsure}/${s1.target}`);
ok("選択式が自動採点されている", (s1.sel.o + s1.sel.x) > 0, JSON.stringify(s1.sel));
ok("選択式は正解を押したので正解が多い", s1.sel.o > s1.sel.x, JSON.stringify(s1.sel));
ok("終了画面が出ている", await page.locator("#ky-end").isVisible());
const chips = await page.locator("#ky-list .chip").count();
ok("練習する字が紙と同じ数ならんでいる", chips === s1.sheet, `${chips} vs ${s1.sheet}`);

// ★抜き取り検証（引き継ぎ.md 12-3・12-3b）
ok("紙は「あやしい」＋検証字になっている", s1.sheet === s1.unsure + s1.audit,
   `sheet=${s1.sheet} unsure=${s1.unsure} audit=${s1.audit}`);
ok("検証字は「あやしい」の字数を超えない（12-3b ④）", s1.audit <= s1.unsure,
   `audit=${s1.audit} unsure=${s1.unsure}`);
const auditSane = await page.evaluate(() => {
  const a = SESSION.audit || [];
  return {
    // 検証字は「書ける」と申告した字だけ
    fromKnow: a.every(k => KSTATS[k] && KSTATS[k].self && KSTATS[k].self.say > 0),
    // 「あやしい」と重ならない（同じ字が紙に2回出ると A-1 の穴になる）
    noOverlap: a.every(k => SESSION.unsure.indexOf(k) < 0),
    n: a.length
  };
});
ok("検証字は「書ける」と申告した字から選ばれている", auditSane.fromKnow);
ok("検証字が「あやしい」と重なっていない", auditSane.noOverlap);

console.log("\n=== ③ 練習プリントを印刷 ===");
await page.click('button:has-text("この字の練習プリントを印刷")');
const printed = await page.evaluate(() => document.getElementById("print-region").innerHTML);
ok("印刷用HTMLが組み立てられた", printed.includes("れんしゅうする字"));
ok("お手本（なぞり用）が入っている", printed.includes("p-model"));
ok("おうちの方への説明が入っている", printed.includes("おうちの方へ"));
const allInPrint = await page.evaluate(() => {
  const h = document.getElementById("print-region").innerHTML;
  return {
    all: (SESSION.sheet || []).every(k => h.includes(k)),
    // ★どれが検証用かは紙に書かない（12-3）。書くとそこだけ身構えて実力が測れない
    noLabel: !/検証|抜き取り|ぬきとり/.test(h)
  };
});
ok("紙の字がすべて出ている（あやしい＋検証字）", allInPrint.all);
ok("どれが検証用か紙に書いていない", allInPrint.noLabel);
// ★読みは答えが紙に無いと、親御さんが採点できない（設計:「紙1枚で採点を完結」）
const key = await page.evaluate(() => {
  const h = document.getElementById("print-region").innerHTML;
  const y = (SESSION.sheet || []).filter(k => sheetFieldOf(k) === "yomi");
  return { n: y.length, hasKey: !y.length || h.includes("読みの答え") };
});
ok("読みの答えが紙に印刷されている（親が採点できる）", key.hasKey, `読み${key.n}字`);

console.log("\n=== ④ 採点して記録する（既定〇・✕だけタップ） ===");
await page.click('.tab[data-page="kiroku"]');
const marks = await page.locator(".mark").count();
ok("採点ボタンが字の数ぶん出ている", marks === s1.sheet, `${marks} vs ${s1.sheet}`);
ok("最初はぜんぶ〇", await page.evaluate(() =>
  [...document.querySelectorAll(".mark")].every(e => !e.classList.contains("x"))));
// ★✕にする2字は、**検証字を1つ必ず含める**ように選ぶ。
//   ここを nth(0),nth(1) の決め打ちにすると、検証字に当たらない日があり、
//   12-3b ②③ の検査が「空配列に every」で**素通りしてしまう**（引き継ぎ.md 8章の教訓）。
const xIdx = await page.evaluate(() => {
  const sh = SESSION.sheet, a = SESSION.audit || [];
  const ai = sh.findIndex(k => a.indexOf(k) >= 0);        // 検証字（✕にする）
  const ui = sh.findIndex(k => a.indexOf(k) < 0);         // あやしい字（✕にする）
  return { ai, ui, nAudit: a.length };
});
ok("検証字が1字以上まざっている（検査が素通りしないこと）", xIdx.nAudit > 0, String(xIdx.nAudit));
ok("✕にする検証字と、あやしい字を選べた", xIdx.ai >= 0 && xIdx.ui >= 0, JSON.stringify(xIdx));
await page.locator(".mark").nth(xIdx.ai).click();
await page.locator(".mark").nth(xIdx.ui).click();
ok("タップした2つだけ✕になる", (await page.locator(".mark.x").count()) === 2);

await page.click('button:has-text("この字を記録する")');
await page.waitForTimeout(200);
const after = await page.evaluate(() => {
  // ★紙の並び順（sheet）で採点している。unsure の順ではない
  const sh = SESSION.sheet;
  const isA = k => (SESSION.audit || []).indexOf(k) >= 0;
  // ✕にした字は DOM の .mark.x から読む（並び順の決め打ちをしない）
  const xs = [...document.querySelectorAll(".mark.x")].map(e => e.textContent.replace(/[0-9\s〇✕]/g, ""));
  const x = xs, o = sh.filter(k => xs.indexOf(k) < 0);
  // 「あやしい」と言った字だけ（＝検証字を除く）で見る項目
  const oUnsure = o.filter(k => !isA(k));
  return {
    // ★紙のどちらのブロックだったかで、記録する分野が変わる（読みを kaki に入れない）
    wrongOK: x.every(k => KSTATS[k] && KSTATS[k][sheetFieldOf(k)] && KSTATS[k][sheetFieldOf(k)].x > 0),
    rightOK: o.every(k => KSTATS[k] && KSTATS[k][sheetFieldOf(k)] && KSTATS[k][sheetFieldOf(k)].o > 0),
    // 読みの結果が書き取りの記録に混ざっていないこと
    noMix: sh.filter(k => sheetFieldOf(k) === "yomi")
             .every(k => !(KSTATS[k].kaki && (KSTATS[k].kaki.o + KSTATS[k].kaki.x) > 0)),
    mix: SESSION.mix,
    wrongStillWeak: x.every(k => WEAK[k] && !WEAK[k].got),
    // ★自分で「あやしい」と言った字は、1回書けただけでは卒業させない（12-3の5番）
    notGraduatedYet: oUnsure.every(k => WEAK[k] && !WEAK[k].got),
    // ★「書ける」と言って実際に書けた字は実測なので1回で確定（12-3b ②）
    auditHitDone: o.filter(isA).length > 0
      && o.filter(isA).every(k => WEAK[k] && WEAK[k].got && KSTATS[k].self.hit > 0),
    // ★「書ける」と言って書けなかった字は miss がつき、練習に回る（12-3b ③）
    auditMissKept: x.filter(isA).length > 0
      && x.filter(isA).every(k => KSTATS[k].self.miss > 0 && !WEAK[k].got),
    // ★self は記録するだけ。画面には出さない
    selfHidden: !/見立て|申告|miss|自己申告/.test(document.body.innerText),
    // ★次のセッションで、外した字は聞かずに「あやしい」へ入る（12-3b ①③）
    mustNext: mustWriteList(),
    auditMissed: x.filter(isA),
    est: estimate().est
  };
});
ok("✕にした字が「できなかった」として記録された", after.wrongOK);
ok("読みの結果が書き取りの記録に混ざっていない", after.noMix);
ok("「あやしい」の内訳（読み／書き）を記録している", !!after.mix
   && (after.mix.kaki + after.mix.yomi) > 0, JSON.stringify(after.mix));
ok("〇の字が「書けた」として記録された", after.rightOK);
ok("✕の字は「もうすこしの字」に残る（次の日また出る）", after.wrongStillWeak);
ok("1回書けただけでは卒業させない（2回必要）", after.notGraduatedYet);
ok("「書ける」と言って書けた字は1回で確定する（12-3b ②）", after.auditHitDone);
ok("「書ける」と言って書けなかった字は練習に残る（12-3b ③）", after.auditMissKept);
ok("自己申告の当たり外れを画面に出していない", after.selfHidden);
ok("外した字は次の紙に必ず入る（12-3b ①）",
   after.auditMissed.length > 0
   && after.auditMissed.every(k => after.mustNext.indexOf(k) >= 0),
   `missed=${after.auditMissed} must=${after.mustNext}`);
ok("予想得点が出る", typeof after.est === "number" && after.est >= 0 && after.est <= 200, String(after.est));

console.log("\n=== 応援画面に反映されるか ===");
await page.click('.tab[data-page="ouen"]');
const ouen = await page.evaluate(() => ({
  done: document.getElementById("h-done").textContent,
  score: document.getElementById("s-score").textContent,
  cap: document.getElementById("s-caption").textContent,
  note: document.getElementById("s-note").textContent,
  fields: document.getElementById("fields-box").textContent,
  week: document.querySelectorAll(".week span.on").length
}));
ok("できた字の数が出ている", /\d+\s*\/\s*\d+\s*字/.test(ouen.done.replace(/\s+/g, " ")), ouen.done);
ok("予想得点が数字で出ている", /\d+/.test(ouen.score), ouen.score);
ok("合格までの距離を「点」で言っている（字で言っていない）",
  ouen.cap.includes("点") && !/あと\s*\d+\s*字/.test(ouen.cap), ouen.cap);
ok("測った配点が少ないうちは合格圏だと断言しない",
  !ouen.cap.includes("合格圏に入っています") && ouen.note.includes("分野"), ouen.cap);
ok("未実施の分野は「まだ」と出る（0%と出さない）", ouen.fields.includes("まだ"));
ok("今週やった日に印がついた", ouen.week >= 1, String(ouen.week));

console.log("\n=== 責めない設計になっているか ===");
// <script> の中まで拾わないこと。ソースのコメントを画面の文言と取り違える
const body = await page.evaluate(() =>
  [...document.querySelectorAll(".page, header")].map(e => e.textContent).join(" "));
ok("「にがて」ではなく「もうすこし」と呼んでいる", !body.includes("にがて") && body.includes("もうすこし"));
ok("「遅れ」を画面に出していない", !body.includes("遅れ"));
ok("連続日数（ストリーク）を使っていない", !body.includes("連続"));
ok("未完成の部分が「未完成」と明示されている", body.includes("未完成"));

console.log("\n=== まぐれ当たり対策（4択は2回続けて正解するまで「できた」にしない） ===");
// ★引き継ぎ.md 12-1 の ⚠。**仕様に書いてあるのに実装されていなかった**箇所。
//   1回の正解で「できた」にすると、まぐれ当たりの字が二度と出てこなくなり、
//   予想得点が実力より高いまま固まる（＝事実と違う励まし）。
const fluke = await page.evaluate(() => {
  const k = KANJI_MASTER.find(r => !KSTATS[r.k]).k;   // まだ手つかずの字で試す
  const out = {};
  KSTATS[k] = { bushu: { o: 1, x: 0, run: 1 } };      // 1回だけ正解した状態
  out.oneNotDone = !fieldDone(KSTATS[k].bushu, "bushu");
  out.oneNotOK   = !isOK(k);
  // ★「まだ出る」ことの確かめ方。
  //   642字のほとんどが手つかずなので、ある1日に必ず出るとは限らない（出たら偶然）。
  //   確かめたいのは **「できた字」と同じ最後尾に回されていないこと** なので、
  //   ほかを全部「2回続けて正解ずみ」にして、この字が拾われるかを見る。
  const all = {};
  KANJI_MASTER.forEach(r => { all[r.k] = { bushu: { o: 2, x: 0, run: 2 } }; });
  all[k] = { bushu: { o: 1, x: 0, run: 1 } };
  out.stillAsked = buildSession({ kstats: all, dayKey: "t1", unsureTarget: 10 })
                     .items.some(q => q.kanji === k && q.field === "bushu");
  KSTATS[k].bushu = { o: 2, x: 0, run: 2 };           // 2回続けて正解した状態
  out.twoDone = fieldDone(KSTATS[k].bushu, "bushu");
  out.twoOK   = isOK(k);
  // 書く形式は当てずっぽうで当たらないので1回でよい
  out.writeOneDone = fieldDone({ o: 1, x: 0 }, "kaki");
  // 続けて正解が途切れたら振り出しに戻る
  out.brokenRun = !fieldDone({ o: 5, x: 1, run: 0 }, "bushu");
  delete KSTATS[k];
  return out;
});
ok("4択は1回正解しただけでは「できた」にしない", fluke.oneNotDone);
ok("1回正解しただけの字は「できた字」に数えない", fluke.oneNotOK);
ok("1回正解しただけの字は、できた字より先に出る（最後尾に回されない）", fluke.stillAsked);
ok("2回続けて正解したら「できた」になる", fluke.twoDone);
ok("2回続けて正解した字は「できた字」に数える", fluke.twoOK);
ok("書く形式は1回でよい（当てずっぽうで当たらないため）", fluke.writeOneDone);
ok("続けて正解が途切れたら「できた」に戻らない", fluke.brokenRun);

console.log("\n=== 前半は「まちがい10個」でも切り上がるか ===");
// ★20問の上限だけでなく、**まちがいが10個たまったら早く終わる**ほうも確かめる。
//   上を通しただけだと、こちらの分岐は一度も動かない。
await page.click('.tab[data-page="kyou"]');
await page.evaluate(() => resetSession());
let g2 = 0, wrongCut = null;
while (g2++ < 200) {
  const st = await page.evaluate(() => ({
    done: SESSION.done, phase: SESSION.phase, sel: SESSION.sel,
    field: (SESSION.items[SESSION.pos] || {}).field
  }));
  if (st.done) break;
  if (st.phase === "switch") { wrongCut = st.sel; break; }
  if (st.field === "kaki") { wrongCut = st.sel; break; }   // 前半が無かった場合の保険
  // わざと不正解を押す
  await page.evaluate(() => {
    const q = SESSION.items[SESSION.pos];
    const btns = [...document.querySelectorAll("#ky-choices .ky-btn")];
    const miss = btns.find(b => !b.textContent.replace(/\s|画/g, "").endsWith(String(q.a).replace(/\s/g, "")));
    (miss || btns[0]).click();
  });
  await page.waitForTimeout(1600);
}
ok("まちがいが10個たまった時点で前半が終わった",
   !!wrongCut && wrongCut.x >= 10 && (wrongCut.o + wrongCut.x) < 20,
   JSON.stringify(wrongCut));
const swText = await page.evaluate(() => document.getElementById("ky-swsub").textContent);
ok("「あしたもう一回出るよ」と予告している（責める文にしない）",
   swText.includes("あした") && !/せいかい/.test(swText), swText);
ok("前半の画面で正解数を出していない（C案・出鼻をくじかない）",
   !/せいかい|正解|\d+\s*問せい/.test(swText), swText);

console.log("\n=== 部首名（radName）が空でも画面が壊れないか ===");
// ★7級の審査基準は《部首》「部首を理解している。」だけで、**部首名は問われない**
//   （公式サイトの逐語 ＋ 実物の過去問(八)「同じ部首のなかまの漢字」の2つで確認）。
//   だから642字ぶん集めない。**分かっている字にだけラベルとして出す。**
//   空の字が301字あるので、**空のときに「（）」を出さないこと**が必ず踏まれる。
const rn = await page.evaluate(() => {
  const named = KANJI_MASTER.filter(r => r.radName);
  const blank = KANJI_MASTER.filter(r => !r.radName);
  // ★この検査は SESSION をいじって描画するので、**必ず元に戻す。**
  //   戻さないと、あとの「リロードで状態が変わらない」検査が巻き添えで落ちる（実際に落ちた）
  const keep = { item: SESSION.items[SESSION.pos], phase: SESSION.phase, done: SESSION.done };
  const mk = k => genBushu(k, seededRandom("rn"), {});
  // 名前がある字・無い字の両方で問題を作ってみる
  const withName = named.map(r => mk(r.k)).filter(Boolean)[0];
  const noName   = blank.map(r => mk(r.k)).filter(Boolean)[0];
  // 実際に画面へ出したときのHTMLを見る（空の括弧が出ないこと）
  const render = q => {
    SESSION.items[SESSION.pos] = q; SESSION.phase = "select"; SESSION.done = false;
    renderKyou();
    return document.getElementById("ky-q").innerHTML;
  };
  return {
    named: named.length, blank: blank.length,
    checked: KANJI_MASTER.filter(r => r.radChecked).length,
    withNameHasHint: !!(withName && withName.hint),
    noNameHasNoHint: !!(noName && !("hint" in noName)),
    htmlWith: withName ? render(withName) : "",
    htmlWithout: noName ? render(noName) : "",
    restored: (() => {
      SESSION.items[SESSION.pos] = keep.item;
      SESSION.phase = keep.phase;
      SESSION.done = keep.done;
      renderKyou();
      return SESSION.phase === keep.phase && SESSION.done === keep.done;
    })()
  };
});
ok("部首名を持つ字と、持たない字の両方が存在する", rn.named > 0 && rn.blank > 0,
   `名前あり${rn.named} / 空${rn.blank}`);
ok("漢検の答えで照合できた字に印がついている", rn.checked > 0, String(rn.checked));
ok("名前がある字には hint が付く", rn.withNameHasHint);
ok("名前が無い字には hint を付けない", rn.noNameHasNoHint);
ok("★名前が無いとき、空の括弧「（）」を出さない",
   !/（\s*）/.test(rn.htmlWithout), rn.htmlWithout);
ok("検査のあと SESSION を元に戻した", rn.restored);
ok("名前があるときは括弧の中身が入っている",
   !rn.htmlWith || /（.+）/.test(rn.htmlWith), rn.htmlWith);

// ★漢検の分類に直した2字（KANJIDIC2 と食い違っていた）
const fixed = await page.evaluate(() => {
  const g = k => KANJI_MASTER.find(r => r.k === k);
  return { tan: g("単"), su: g("巣") };
});
ok("単の部首を漢検の分類（つかんむり・番号42）に直した",
   fixed.tan.radNo === 42 && fixed.tan.radName === "つかんむり",
   JSON.stringify({ radNo: fixed.tan.radNo, radName: fixed.tan.radName }));
ok("巣の部首を漢検の分類（つかんむり・番号42）に直した",
   fixed.su.radNo === 42 && fixed.su.radName === "つかんむり",
   JSON.stringify({ radNo: fixed.su.radNo, radName: fixed.su.radName }));

console.log("\n=== 選り分け（できた字を出さない） ===");
const sort = await page.evaluate(() => {
  const done = KANJI_MASTER.slice(0, 300).map(r => r.k);
  const ks = {};
  // ★選択式は run>=2 で初めて「できた」（12-1 の ⚠）。
  //   run を入れないと「できた字」を作ったつもりで作れておらず、この検査が意味を失う
  done.forEach(k => { ks[k] = { kaki: { o: 3, x: 0 },
                                yomi: { o: 3, x: 0 },
                                kakusu: { o: 3, x: 0, run: 3 },
                                bushu:  { o: 3, x: 0, run: 3 },
                                onkun:  { o: 3, x: 0, run: 3 } }; });
  const s = buildSession({ kstats: ks, dayKey: "2026-09-10" });
  return { leaked: s.items.filter(q => done.includes(q.kanji)).length, n: s.items.length };
});
ok("できている字が次の日に出てこない", sort.leaked === 0, `${sort.leaked}/${sort.n}`);

// ★書き取りができる字は、読みを出さない（書ける ⊃ 読める）。
//   45日×10分しかないので、読めると分かっている字に時間を使わない。
//   逆は成り立たない（読めても書けるとは限らない）ので、そちらは出す。
const cover = await page.evaluate(() => {
  const k = KANJI_MASTER.find(r => genYomi(r.k, seededRandom("p")) && genKaki(r.k, seededRandom("p"))).k;
  const DONE = { o: 3, x: 0 };
  // ★「出るはず／出ないはず」を偶然に任せない（C-8b）。
  //   ほかの字を全部その形式で「できた」にして、**この字だけが候補になる**状態を作る。
  //   そうしないと、手つかずの字が600以上あるので拾われるかどうかは運になる。
  const only = (target, field) => {
    const ks = {};
    KANJI_MASTER.forEach(r => { ks[r.k] = { kaki: DONE, yomi: DONE }; });
    ks[target] = field;                     // この字だけ、指定の状態にする
    return ks;
  };
  const has = (ks, f) => buildSession({ kstats: ks, dayKey: "cv" })
                           .items.some(q => q.kanji === k && q.field === f);
  return {
    // 書きができる字 → 読みは出さない（ほかは全部 読みができている＝この字しか候補がない）
    yomiSkipped: !has(only(k, { kaki: DONE }), "yomi"),
    // 読めるだけの字 → 書き取りはまだ出す（ほかは全部 書きができている）
    kakiKept:     has(only(k, { yomi: DONE }), "kaki")
  };
});
ok("書き取りができる字は、読みを出さない", cover.yomiSkipped);
ok("読めるだけの字は、書き取りをまだ出す（逆は成り立たない）", cover.kakiKept);

console.log("\n=== 保存が残るか（リロード） ===");
// ★done===true と決め打ちしない。**リロードの前後で状態が変わらないこと**が主旨なので、
//   直前の状態を控えてから見比べる（C-8b「その場のデータから数える」）。
const beforeReload = await page.evaluate(() => ({
  done: SESSION.done, phase: SESSION.phase, pos: SESSION.pos,
  unsure: (SESSION.unsure || []).length, sheet: (SESSION.sheet || []).length
}));
await page.reload({ waitUntil: "networkidle" });
const kept = await page.evaluate(() => ({
  k: Object.keys(KSTATS).length,
  s: { done: SESSION.done, phase: SESSION.phase, pos: SESSION.pos,
       unsure: (SESSION.unsure || []).length, sheet: (SESSION.sheet || []).length }
}));
ok("記録がリロード後も残っている", kept.k > 0, String(kept.k));
ok("セッションの状態も残っている（前後で変わらない）",
   JSON.stringify(kept.s) === JSON.stringify(beforeReload),
   `${JSON.stringify(beforeReload)} -> ${JSON.stringify(kept.s)}`);
ok("リロード後もJSエラーが無い", errors.length === 0, errors.join(" | "));

await browser.close();
server.close();
console.log(`\n${fail === 0 ? "★ 全通過" : "★ 失敗あり"}  通過 ${pass} / 失敗 ${fail}`);
process.exit(fail ? 1 : 0);
