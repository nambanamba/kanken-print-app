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
ok("印刷用HTMLが組み立てられた", printed.includes("きょう 書く字"));
// ★2026-09-10、お子さん本人の希望で**なぞり練習を廃止**した。
//   「練習はなし、毎日20問書く」。だから紙にお手本を出さない＝ここは反転した検査になる。
ok("★お手本（なぞり）を出していない（本人の希望で廃止）", !printed.includes("p-model"));
// ⚠️ なぞりを外すと紙の上から答えが消える。以前は「なぞる字」が答えを兼ねていた。
//    採点する人が紙1枚で完結できなくなるので、**書きの答えを紙の下に出す**のが必須条件。
const keyBlock = printed.slice(printed.indexOf("おうちの方へ"));
ok("★書きの答えが紙の下に印刷されている", keyBlock.includes("書きの答え"), keyBlock.slice(0, 200));
ok("読みの答えも紙の下に印刷されている（従来どおり）",
   !printed.includes("読みかたを、ひらがなで書きましょう") || keyBlock.includes("読みの答え"),
   keyBlock.slice(0, 200));
// 答えは「おうちの方へ」より前に出ていないこと（解いている最中に見えない）
ok("答えが問題より先に出ていない",
   printed.indexOf("書きの答え") < 0 || printed.indexOf("書きの答え") > printed.indexOf("漢字を書きましょう"),
   String(printed.indexOf("書きの答え")) + " / " + String(printed.indexOf("漢字を書きましょう")));
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
  // ★添字ではなく「字」で選ぶ。
  //   採点画面の並びは **紙と同じ順** になった（本の問題と自動生成が混ざるため）。
  //   `SESSION.sheet` の添字と DOM の並びは、もう一致しない。
  //   添字で押すと**別の字を押してしまい、しかもテストは通ってしまう**ことがある。
  const ak = sh.find(k => a.indexOf(k) >= 0) || null;     // 検証字（✕にする）
  const uk = sh.find(k => a.indexOf(k) < 0) || null;      // あやしい字（✕にする）
  return { ak, uk, nAudit: a.length };
});
ok("検証字が1字以上まざっている（検査が素通りしないこと）", xIdx.nAudit > 0, String(xIdx.nAudit));
ok("✕にする検証字と、あやしい字を選べた", !!xIdx.ak && !!xIdx.uk, JSON.stringify(xIdx));
await page.locator('.mark[data-k="' + xIdx.ak + '"]').first().click();
await page.locator('.mark[data-k="' + xIdx.uk + '"]').first().click();
ok("タップした2つだけ✕になる", (await page.locator(".mark.x").count()) === 2);

await page.click('button:has-text("この字を記録する")');
await page.waitForTimeout(200);
const after = await page.evaluate(() => {
  // ★紙の並び順（sheet）で採点している。unsure の順ではない
  const sh = SESSION.sheet;
  const isA = k => (SESSION.audit || []).indexOf(k) >= 0;
  // ✕にした字は DOM の .mark.x から読む（並び順の決め打ちをしない）
  // ★data 属性から読む。textContent を削り取る方法は、表示を変えた瞬間に壊れる
  const xs = [...document.querySelectorAll(".mark.x")].map(e => e.dataset.k);
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

console.log("\n=== 本の問題の暗号化とログイン ===");
// ⚠️ この仕組みの目的は「検索やクローラに問題文が拾われないこと」であって、
//    本気の攻撃者から守ることではない（鍵はブラウザに渡る）。過大評価しないこと。
const cryptoCheck = await page.evaluate(async () => {
  const sample = [{
    unit_id: "dr_01",
    groups: [{ items: [
      // 出せる問題
      { id: "q_dr01_00_001", answers: [{ ansNo: 1, text: "どりょく" }], kanji: ["努", "力"] },
      // 答えがまだ無い（別冊p16が未撮影のケース）
      { id: "q_dr01_00_002", answers: [{ ansNo: 1, text: "__MISSING__" }], kanji: ["塩"] },
      // 判読できなかった
      { id: "q_dr01_00_003", answers: [{ ansNo: 1, text: "__UNREADABLE__" }], kanji: ["塩"] },
      // 図が要る（アプリは文字しか出せない）
      { id: "q_dr01_00_004", answers: [{ ansNo: 1, text: "北" }], kanji: ["北"], needsFigure: true },
      // 答えが空
      { id: "q_dr01_00_005", answers: [], kanji: ["南"] },
      // 記録先の漢字が無い
      { id: "q_dr01_00_006", answers: [{ ansNo: 1, text: "西" }], kanji: [] }
    ]}]
  }];
  const pass = "ためしの あいことば";
  const salt = KANKEN_CRYPTO.newSalt();
  const key = await KANKEN_CRYPTO.deriveKey(pass, salt);
  const payload = await KANKEN_CRYPTO.encrypt(key, sample);

  // ① 正しい合言葉なら復号できる
  const key2 = await KANKEN_CRYPTO.deriveKey(pass, salt);
  const back = await KANKEN_CRYPTO.decrypt(key2, payload);

  // ② ちがう合言葉なら失敗する（＝合言葉のハッシュを別に置く必要がない）
  let wrongFailed = false;
  try {
    const bad = await KANKEN_CRYPTO.deriveKey(pass + "x", salt);
    await KANKEN_CRYPTO.decrypt(bad, payload);
  } catch (e) { wrongFailed = true; }

  // ③ 暗号文に平文が現れていないこと
  const leaked = payload.data.indexOf("どりょく") >= 0 || atob(payload.data).indexOf("努") >= 0;

  // ④ 出題フィルタ（入り口で1回だけ弾く）
  const items = sample[0].groups[0].items;
  return {
    roundTrip: JSON.stringify(back) === JSON.stringify(sample),
    wrongFailed, leaked,
    iter: KANKEN_CRYPTO.PBKDF2_ITER,
    askable: items.map(it => askable(it)),
    // 鍵を書き出して読み戻せる（次回から合言葉を聞かないため）
    keyRoundTrip: await (async () => {
      const b64 = await KANKEN_CRYPTO.exportKey(key);
      const k3 = await KANKEN_CRYPTO.importKey(b64);
      const b = await KANKEN_CRYPTO.decrypt(k3, payload);
      return JSON.stringify(b) === JSON.stringify(sample);
    })()
  };
});
ok("暗号化して復号すると元に戻る", cryptoCheck.roundTrip);
ok("★ちがう合言葉では復号できない（だから合言葉のハッシュを置かなくてよい）", cryptoCheck.wrongFailed);
ok("★暗号文に問題文がそのまま出ていない", !cryptoCheck.leaked);
ok("PBKDF2 の反復が20万回ある（下げないこと）", cryptoCheck.iter === 200000, String(cryptoCheck.iter));
ok("★保存した鍵で読み直せる（合言葉は毎回聞かない）", cryptoCheck.keyRoundTrip);
ok("★答えのある問題は出せる", cryptoCheck.askable[0] === true);
ok("★答えがまだ無い問題(__MISSING__)は出さない", cryptoCheck.askable[1] === false);
ok("★判読できなかった問題(__UNREADABLE__)は出さない", cryptoCheck.askable[2] === false);
ok("★図が要る問題(needsFigure)は出さない", cryptoCheck.askable[3] === false);
ok("★答えが空の問題は出さない", cryptoCheck.askable[4] === false);
ok("★記録先の漢字が無い問題は出さない", cryptoCheck.askable[5] === false);

// ★「画面で出せる」と「紙で出せる」は別。実測で、本の中身は書かせる形式が主だった
const routing = await page.evaluate(() => {
  const sel = { id:"s1", choices:["ア 器","イ 希","ウ 機"],
                answers:[{ansNo:1,text:"ア 器"}], kanji:["器"] };
  const selBad = { id:"s2", choices:["ア 器","イ 希"],
                   answers:[{ansNo:1,text:"ウ 機"}], kanji:["機"] };   // 答えが選択肢に無い
  const write = { id:"s3", choices:null, answers:[{ansNo:1,text:"どりょく"}], kanji:["努","力"] };
  const multi = { id:"s4", choices:null,
                  answers:[{ansNo:1,text:"利"},{ansNo:1,text:"前"}], kanji:["利","前"] };
  const noAns = { id:"s5", choices:["ア 器"], answers:[], kanji:["器"] };
  return {
    selScreen: screenable(sel), selPaper: printable(sel),
    selBadScreen: screenable(selBad),
    writeScreen: screenable(write), writePaper: printable(write),
    multiScreen: screenable(multi), multiPaper: printable(multi),
    noAnsScreen: screenable(noAns), noAnsPaper: printable(noAns)
  };
});
ok("記号選択（答えが1つ）は画面に出す", routing.selScreen && !routing.selPaper);
ok("★答えが選択肢に無いものは画面に出さない（値で採点しているため）", !routing.selBadScreen);
ok("書かせる形式は紙に回す", !routing.writeScreen && routing.writePaper);
ok("★答えが複数ある設問は画面に出さない（1タップで答えられない）",
   !routing.multiScreen && routing.multiPaper);
ok("出せない問題は、画面にも紙にも出さない", !routing.noAnsScreen && !routing.noAnsPaper);

// ★平文がリポジトリに入っていないこと（いちばん大事なので、ここでも見る）
const encSrc = fs.readFileSync(path.join(ROOT, "kanken-quiz.enc.js"), "utf8");
ok("★暗号文ファイルに平文の問題文が入っていない",
   !/[ぁ-んァ-ヶ][ぁ-んァ-ヶ][ぁ-んァ-ヶ]/.test(encSrc.replace(/^[\s\S]*?\*\//, "")),
   encSrc.slice(0, 80));

console.log("\n=== 日割り（量をならす。重いステージを分ける） ===");
// ユーザー:「じかんより、やれそうか、が大事」→ **最適化するのは所要時間ではなく、量のばらつき。**
// ⚠️ 1日の量を増やして日数の帳尻を合わせないこと。足りなければ範囲を削る側で調整する。
const plan = await page.evaluate(() => {
  const dr = UNITS.filter(u => u.mat === "dr" && u.field !== "test");
  const p = buildPlan(dr, {});
  const s = planSummary(p);
  return {
    sum: s,
    days: p.length,
    // 設問数が分かっているものだけの最大・最小（ならしの評価はこちらで）
    knownMax: Math.max.apply(null, p.filter(c => !c.itemsUnknown).map(c => c.n)),
    knownMin: Math.min.apply(null, p.filter(c => !c.itemsUnknown).map(c => c.n)),
    // 分割されたかたまりが、元の単元の問数をちょうど覆っているか
    // ★覆いは **設問数（items）** で見る。qs（答えの数）ではない。
    //   同じ部首は設問10問で答え33、じゅく語作りは設問12問で答え24 なので、
    //   qs で見ると「紙に無い問番号まで覆っている」ことになってしまう
    covers: dr.filter(u => u.items).every(u => {
      const cs = p.filter(c => c.unit === u.id);
      if (!cs.length) return false;
      const total = cs.reduce((a, c) => a + c.n, 0);
      const first = cs[0].from === 1, last = cs[cs.length - 1].to === u.items;
      const contiguous = cs.every((c, i) => i === 0 || c.from === cs[i - 1].to + 1);
      return total === u.items && first && last && contiguous;
    }),
    // 設問数が未実測のもの（分割していない）
    unknown: p.filter(c => c.itemsUnknown).length,
    // ★上限を超えているのに、未実測の印が付いていないもの＝取りこぼし
    overWithoutFlag: p.filter(c => c.n > 20 && !c.itemsUnknown).length,
    // 未実測かつ上限超（＝実測が届いたら分割し直す対象）
    needMeasure: p.filter(c => c.itemsUnknown && c.n > 20).map(c => c.unit),
    ids: p.map(c => c.id),
    // 分割しなかった単元は、単元idそのままであること（記録のidを動かさないため C-5）
    unsplitKeepsId: p.filter(c => c.parts === 1).every(c => c.id === c.unit),
    over: p.filter(c => c.n > 20).length,
    noteUntouched: (() => {
      const tn = UNITS.filter(u => u.mat === "tn");
      const q = buildPlan(tn, {});
      return q.every(c => c.parts === 1);   // 問数未実測なので切らない（A-6）
    })()
  };
});
ok("日割りが作れた", plan.days > 0, JSON.stringify(plan.sum));
// ★★「上限を超えるものが無い」とは書けない。**設問数が未実測の単元は分割できない**ため
//   （qs は答えの数なので、それで割ると紙に無い問番号を指す）。
//   なので不変条件は「**超えているなら、必ず未実測の印が付いている**」。
//   こう書くと、実測が届いて印が外れた瞬間に「分割し忘れ」が落ちる。
ok("★上限を超えるかたまりには、必ず未実測の印が付いている",
   plan.overWithoutFlag === 0, `印なしで超過 ${plan.overWithoutFlag} 件`);
ok("★実測が要る単元が一覧で取れる（忘れられない）",
   plan.needMeasure.length === 0 || plan.needMeasure.every(u => /^dr_\d\d$/.test(u)),
   plan.needMeasure.join(" "));
ok("★量がならされている（設問数が分かっているものだけで見る）",
   plan.knownMax - plan.knownMin <= 10, `最小${plan.knownMin} 最大${plan.knownMax}`);
ok("★分割が元の設問数をすき間なく覆っている", plan.covers);
ok("★分けなかった単元は単元idのまま（記録のidを動かさない）", plan.unsplitKeepsId);
ok("かたまりのidに重複が無い", plan.ids.length === new Set(plan.ids).size);
ok("★問数が分からないノートは切らない（推測で切らない）", plan.noteUntouched);

console.log("\n=== 本の問題を紙に刷る（自動生成との混在） ===");
// ユーザー:「テキストの問題はもれなく入れてください」→ 紙も本の問題に置き換わっていく。
// ★「本に直接書けばいい」は成り立たない。本人の希望が「できなかったら、次の日も書く」なので、
//   **同じ問題をもう一度書ける紙**が要る。本に書き込むと1回で消費されて2回目が書けない。
// ⚠️ いま入っているのは102設問だけ。**混在した状態で成立すること**が要件。
const mix = await page.evaluate(async () => {
  // 本のデータを積む（照合ずみ1単元＋未照合1単元）
  const verified = {
    unitId: "dr_25", groups: [{ field: "bushu", instruction: "次の部首のなかまの…",
      items: [
        { id:"q_v1", no:1, field:"bushu", text:"刂　□用・以□",
          answers:[{ansNo:1,text:"利"},{ansNo:1,text:"前"}], kanji:["利","前"],
          ruby:[{base:"□",yomi:"り",nth:1}] },
        { id:"q_v2", no:2, field:"bushu", text:"亻　□康",
          answers:[{ansNo:1,text:"健"}], kanji:["健"], ruby:[] }
      ]}]
  };
  const unverified = {
    unitId: "dr_54", groups: [{ field: "jukugo", instruction: "…",
      items: [{ id:"q_u1", no:1, field:"jukugo", text:"伝",
        answers:[{ansNo:1,text:"オ 説"}], kanji:["説"], ruby:[] }]}]
  };
  BOOK_UNITS = [verified, unverified];

  // ★どの単元が「いま」照合ずみかに依存させない。
  //   ⚠️ もとは "dr_25" が照合ずみである前提で書いていた。
  //      検証担当が dr_25 を一時的に外した瞬間に、**テストが4件落ちた。**
  //      落ちたのは実装ではなく**テストの前提**で、これは実運用で必ず起きる
  //      （通過・取り下げは日々動く）。
  //   → **ここで見たいのは「照合ずみなら出る／未照合なら出ない」という仕組みのほう。**
  //      判定そのものを差し替えて、単元名に依存しない形にする。
  const keepVerified = window.isVerifiedUnit;
  window.isVerifiedUnit = (id) => id === "dr_25";

  const keep = window.planToday;
  const out = {};

  // ① 照合ずみの単元の日 → 本の問題が紙に出る
  window.planToday = () => ({ unit:"dr_25", from:1, to:10, n:10, day:1, parts:1, part:1,
                              mat:"dr", label:"同じ部首①", pages:"25" });
  out.verifiedRows = buildPaperBlocks().filter(b => b.src === "book")
                       .reduce((a,b) => a + b.rows.length, 0);
  out.verifiedHasGen = buildPaperBlocks().some(b => b.src === "gen");

  // ② 未照合の単元の日 → 本の問題は出ない（自動生成だけになる）
  window.planToday = () => ({ unit:"dr_54", from:1, to:12, n:12, day:2, parts:1, part:1,
                              mat:"dr", label:"じゅく語作り④", pages:"54" });
  out.unverifiedBookRows = buildPaperBlocks().filter(b => b.src === "book")
                             .reduce((a,b) => a + b.rows.length, 0);
  out.unverifiedGenRows = buildPaperBlocks().filter(b => b.src === "gen")
                            .reduce((a,b) => a + b.rows.length, 0);

  // ③ 本のデータが無い単元の日 → いままでどおり自動生成で出る
  window.planToday = () => ({ unit:"dr_01", from:1, to:15, n:15, day:3, parts:1, part:1,
                              mat:"dr", label:"漢字の読み①", pages:"1" });
  out.noBookGenRows = buildPaperBlocks().filter(b => b.src === "gen")
                        .reduce((a,b) => a + b.rows.length, 0);
  out.noBookBookRows = buildPaperBlocks().filter(b => b.src === "book")
                         .reduce((a,b) => a + b.rows.length, 0);

  // ④ 本で出した字が、自動生成側に二重に出ないこと（同じ紙に同じ字＝A-1）
  window.planToday = () => ({ unit:"dr_25", from:1, to:10, n:10, day:1, parts:1, part:1,
                              mat:"dr", label:"同じ部首①", pages:"25" });
  const blocks = buildPaperBlocks();
  const bookK = [], genK = [];
  blocks.forEach(b => b.rows.forEach(r => (b.src === "book" ? bookK : genK).push(...(r.kanji||[]))));
  out.dup = bookK.filter(k => genK.indexOf(k) >= 0);

  // ⑤ 本の問題にも kanji が付いていること（記録先。無いと「できた字は出さない」が動かない）
  out.bookAllHaveKanji = blocks.filter(b => b.src === "book")
    .every(b => b.rows.every(r => (r.kanji || []).length > 0));

  // ⑥ 紙を実際に組んで、答えが折り線の下にあること
  printSessionPractice();
  const region = document.getElementById("print-region");
  const key = region.querySelector(".p-key"), body = region.querySelector(".p-body");
  out.keyHasBushu = key.textContent.indexOf("部首の答え") >= 0;
  out.bodyHasAnswer = body.textContent.indexOf("答え") >= 0;
  out.keyOverflow = key.scrollHeight - key.clientHeight;
  out.bodyOverflow = body.scrollHeight - body.clientHeight;

  window.planToday = keep;
  window.isVerifiedUnit = keepVerified;
  BOOK_UNITS = null;
  return out;
});
ok("★照合ずみの単元は、本の問題が紙に出る", mix.verifiedRows > 0, String(mix.verifiedRows));
ok("★照合が通っていない単元は、本の問題を紙に出さない", mix.unverifiedBookRows === 0,
   String(mix.unverifiedBookRows));

// ★★出すものが無いときに、**前に作った紙が残っていないこと。**
//   残ると「dr_14」と書かれた紙に「dr_01」の中身が載る。
//   ★お子さんは「ステージ14」だと思って、ステージ1をもう一度解くことになる。
//   ⚠️ **単独で出すと空になるので正常に見える。**通過ずみと並べて出したときだけ出る。
//      claude-e0 が `dr_01 dr_14` の順で出して見つけた。
const stale = await page.evaluate(() => {
  const mk = (id, text) => ({
    unitId: id, groups: [{ field:"yomi", instruction:"…", items:[
      { id:"q_"+id, no:1, field:"yomi", text:text,
        answers:[{ansNo:1,text:"よみ"}], kanji:["山"], ruby:[] }
    ]}]
  });
  BOOK_UNITS = [mk("dr_01", "とおった単元の問題文"), mk("dr_14", "とおっていない単元の問題文")];
  const keepV = window.isVerifiedUnit; window.isVerifiedUnit = (id) => id === "dr_01";
  const keep = window.planToday;
  const region = document.getElementById("print-region");

  // ① まず通過ずみを刷る
  window.planToday = () => ({ unit:"dr_01", from:1, to:1, n:1, day:1, parts:1, part:1,
                              mat:"dr", label:"通過ずみ", pages:"1" });
  printSessionPractice();
  const first = region.innerHTML.length;
  const hadFirst = region.textContent.indexOf("とおった単元の問題文") >= 0;

  // ② 続けて未通過を刷る（出るものが無いはず）
  window.planToday = () => ({ unit:"dr_14", from:1, to:1, n:1, day:1, parts:1, part:1,
                              mat:"dr", label:"未通過", pages:"14" });
  window.practiceList = () => [];          // 自動生成も無い状態にする
  printSessionPractice();
  const out = {
    hadFirst,
    // ★前の紙が残っていないこと
    leftover: region.textContent.indexOf("とおった単元の問題文") >= 0,
    emptied: region.innerHTML.length === 0,
    firstLen: first
  };
  window.planToday = keep; window.isVerifiedUnit = keepV; BOOK_UNITS = null;
  return out;
});
ok("通過ずみの単元は紙に出る（検査が素通りしないこと）", stale.hadFirst, String(stale.firstLen));
ok("★★出すものが無いとき、前に作った紙が残っていない", !stale.leftover);
ok("★出すものが無いときは、紙そのものが空になる", stale.emptied);
ok("★照合が通っていない日でも、自動生成で紙は出る（空にしない）", mix.unverifiedGenRows > 0,
   String(mix.unverifiedGenRows));
ok("★本のデータが無い単元は、いままでどおり自動生成で出る",
   mix.noBookGenRows > 0 && mix.noBookBookRows === 0,
   `生成${mix.noBookGenRows} / 本${mix.noBookBookRows}`);
ok("★本と自動生成が混ざっても成立する（両方出る日がある）", mix.verifiedHasGen);
ok("★同じ字が本と自動生成で二重に出ない（A-1）", mix.dup.length === 0, mix.dup.join(""));
ok("★本の問題にも記録先の漢字が付いている", mix.bookAllHaveKanji);

// ★★「出題できる」と「この紙で解ける」は別。
//   dr_54 は データが正しく（本↔JSON 12問すべて一致）、needsFigure も false で、
//   機械検査も照合も通っていた。**それでも紙にすると解けなかった。**
//   指示文が「記号で書きなさい」なのに、**選択肢が紙に1つも出ていなかった**ため。
//   → 紙を出して目で見るまで、誰も気づけなかった（確認ポイント B-1／B-2）。
const solvable = await page.evaluate(() => {
  const withChoices = {
    unitId: "dr_54", groups: [{ field: "jukugo", instruction: "…記号で書きなさい。", items: [
      { id:"q_c1", no:1, field:"jukugo", text:"□伝・伝□",
        choices:["ア 表","イ 説","ウ 先","エ 灯","オ 駅"],
        answers:[{ansNo:1,text:"オ 駅"},{ansNo:2,text:"イ 説"}], kanji:["駅","説"], ruby:[],
        note:{ text:"「伝説」は、むかしから語りつがれてきた話。", ruby:[{base:"伝説",yomi:"でんせつ"}] } }
    ]}]
  };
  BOOK_UNITS = [withChoices];
  const keepV = window.isVerifiedUnit; window.isVerifiedUnit = (id) => id === "dr_54";
  const keep = window.planToday;
  window.planToday = () => ({ unit:"dr_54", from:1, to:12, n:12, day:1, parts:1, part:1,
                              mat:"dr", label:"じゅく語作り④", pages:"54" });
  printSessionPractice();
  const body = document.getElementById("print-region").querySelector(".p-body");
  const txt = body.textContent;
  const out = {
    // ★選択肢が紙に出ていること（全部）
    allChoices: ["ア 表","イ 説","ウ 先","エ 灯","オ 駅"]
      .every(c => txt.replace(/\s+/g, " ").indexOf(c) >= 0),
    // ★1つの選択肢が折り返しで切れないこと
    unbroken: body.querySelectorAll(".p-choice").length === 5,
    // ★注意（note）が、ルビ付きで出ていること
    hasNote: txt.indexOf("語りつがれ") >= 0,
    hasNoteRuby: txt.indexOf("でんせつ") >= 0,
    // ★答えは折り線の下にしか出ないこと（問題側に答えが漏れない）
    answerInBody: txt.indexOf("オ 駅") >= 0 && txt.indexOf("イ 説") >= 0
      && (txt.match(/オ 駅/g) || []).length > 1
  };
  window.planToday = keep; window.isVerifiedUnit = keepV; BOOK_UNITS = null;
  return out;
});
ok("★★選択肢が紙に出ている（「記号で書きなさい」が成立する）", solvable.allChoices);
ok("★1つの選択肢が折り返しで切れない（どの記号がどの字か分かる）", solvable.unbroken);
ok("★答えページの「注意」が紙に出ている", solvable.hasNote);
ok("★「注意」のルビも出ている（小4が読めるように）", solvable.hasNoteRuby);

// ★★ここが今日いちばん危なかった穴。
//   「本の問題にも kanji が付いている」は**通っていたのに**、
//   採点画面が practiceList()（＝自動生成の字）しか並べていなかったため、
//   **紙に33字出ているのに採点できるのが0字**だった。
//   採点できなければ KSTATS に入らず、「できた字は出さない」も
//   「できなかったら次の日も書く」も動かない。**機能そのものが空回りしていた。**
//   → **データに記録先があることと、採点がそれを使うことは別の話。**両方見る。
const gradable = await page.evaluate(() => {
  const verified = {
    unitId: "dr_25", groups: [{ field: "bushu", instruction: "…", items: [
      { id:"q_g1", no:1, field:"bushu", text:"刂　□用・以□",
        answers:[{ansNo:1,text:"利"},{ansNo:1,text:"前"}], kanji:["利","前"], ruby:[] }
    ]}]
  };
  BOOK_UNITS = [verified];
  const keepVerified = window.isVerifiedUnit;
  window.isVerifiedUnit = (id) => id === "dr_25";
  const keep = window.planToday;
  window.planToday = () => ({ unit:"dr_25", from:1, to:10, n:10, day:1, parts:1, part:1,
                              mat:"dr", label:"同じ部首①", pages:"25" });
  const paperK = [];
  buildPaperBlocks().forEach(b => b.rows.forEach(r => paperK.push(...(r.kanji||[]))));
  const rows = todayPaperRows();
  const gradableK = [];
  rows.forEach(r => gradableK.push(...r.kanji));
  renderMarks();
  const domK = [...document.querySelectorAll("#mark-box .mark")].map(e => e.dataset.k);
  const out = {
    paper: paperK.length,
    gradable: gradableK.length,
    ungradable: paperK.filter(k => gradableK.indexOf(k) < 0),
    // ★画面に実際に並んでいるか（関数が返すだけでは意味がない）
    inDom: paperK.filter(k => domK.indexOf(k) < 0),
    // ★並び順が紙と同じか（照らし合わせが目で追えること）
    sameOrder: JSON.stringify(domK) === JSON.stringify(gradableK)
  };
  window.planToday = keep; window.isVerifiedUnit = keepVerified; BOOK_UNITS = null;
  return out;
});
ok("★★紙に出た字が、すべて採点できる", gradable.ungradable.length === 0,
   "採点できない字: " + gradable.ungradable.join(""));
ok("★★採点画面に、実際にその字が並んでいる", gradable.inDom.length === 0,
   "画面に無い字: " + gradable.inDom.join(""));
ok("★採点画面の並び順が、紙と同じ", gradable.sameOrder);
ok("本の問題も採点の対象に入っている", gradable.gradable > 0, String(gradable.gradable));

console.log("");
console.log("=== 進み具合（親御さん向け。2か所に同じ数字が出る） ===");
// ⚠️ 同じ数字が「きろく」と「せってい」の2か所に出る。
//   **計算は1か所（progressInfo）だけで、両方がその結果を読む。**
//   別々に計算すると、片方だけ直したときに食い違い、しかも気づけない。
const prog = await page.evaluate(() => {
  renderProgress(); renderKirokuProgress();
  const p = progressInfo();
  const setei = document.getElementById("progress-box").textContent;
  const kiroku = document.getElementById("k-progress").textContent;
  // お子さんの画面（きょう・おうえん）に「遅れ」が出ていないこと
  const kid = document.getElementById("page-kyou").textContent
            + document.getElementById("page-ouen").textContent;
  return {
    days: p.days, total: p.total, left: p.left, over: p.over,
    seteiHasDays: setei.indexOf(String(p.days)) >= 0,
    seteiHasLeft: setei.indexOf(String(p.left)) >= 0,
    kirokuHasDays: kiroku.indexOf(String(p.days)) >= 0,
    kirokuHasToday: kiroku.length > 0,
    // ★2か所が同じ「のこり日数」を言っていること
    sameLeft: p.left === 0 || (setei.indexOf(String(p.left)) >= 0 && kiroku.indexOf(String(p.left)) >= 0),
    // ★お子さんの画面には日割りの「多い◯日ぶん」を出さない
    kidHasOver: p.over > 0 && kid.indexOf(String(p.over) + " 日ぶん多い") >= 0,
    kidHasOkure: /遅れ/.test(kid)
  };
});
ok("「せってい」に受検日までの日数が出ている", prog.seteiHasDays);
ok("「きろく」にも受検日までの日数が出ている", prog.kirokuHasDays);
ok("「きろく」に、きょうやるところが出ている", prog.kirokuHasToday);
ok("★2か所が同じ「のこり日数」を言っている（計算が1か所）", prog.sameLeft,
   `のこり ${prog.left}`);
ok("★お子さんの画面に、日割りが足りないことを出していない", !prog.kidHasOver);
ok("★お子さんの画面に「遅れ」を出していない", !prog.kidHasOkure);

console.log("");
console.log("=== 「きょうは本でやった」の登録 ===");
// ユーザー:「今日はしかたがないのでテキストでやらせました」
// 書き起こしが追いつかない間も、旅行・体調・気分でも「本でやった日」は起きる。
// ★司令塔が示した**失敗の形**を、そのまま検査にする:
//   ・本でやったと登録した単元が、翌日また出てきたら失敗
//   ・できなかった字を入れたのに、翌日の紙に出てこなかったら失敗
//   ・進み具合の表示が、登録した日数だけ進まなかったら失敗
const didBook = await page.evaluate(() => {
  // まっさらな状態から始める（前の検査の記録を持ち越さない）
  localStorage.removeItem("kanken7_records_v1");
  localStorage.removeItem("kanken7_weak_v1");
  RECORDS = {}; WEAK = {}; KSTATS = KSTATS || {};
  const before = progressInfo();
  const unitBefore = before.today ? before.today.id : null;

  // ★実在する字を使う（642字マスタの外だと無視されるのが正しい挙動）
  const wrongs = KANJI_MASTER.slice(0, 3).map(r => r.k);
  document.getElementById("b-wrong").value = wrongs.join("");
  saveDidInBook();

  const after = progressInfo();
  const unitAfter = after.today ? after.today.id : null;

  // 翌日の紙に出るか（mustWriteList が「必ず入れる字」を返す）
  const must = mustWriteList();

  // 範囲外の字は無視されること
  RECORDS = {}; WEAK = {};
  document.getElementById("b-wrong").value = "陳陳";   // 陛陛（642字の外）
  const n2 = markWrongChars("陳陳", "kaki");

  return {
    unitBefore, unitAfter,
    doneBefore: before.done, doneAfter: after.done,
    leftBefore: before.left, leftAfter: after.left,
    wrongs, must,
    mustHasAll: wrongs.every(k => must.indexOf(k) >= 0),
    outOfRangeIgnored: n2 === 0
  };
});
ok("★★本でやったと登録した単元は、翌日もう出てこない",
   !!didBook.unitBefore && didBook.unitAfter !== didBook.unitBefore,
   `${didBook.unitBefore} → ${didBook.unitAfter}`);
ok("★★できなかった字が、次の紙に必ず入る字に入っている",
   didBook.mustHasAll, `入れた ${didBook.wrongs.join("")} / 必ず出す ${didBook.must.join("")}`);
ok("★★進み具合が1日ぶん進む（おわった）",
   didBook.doneAfter === didBook.doneBefore + 1,
   `${didBook.doneBefore} → ${didBook.doneAfter}`);
ok("★★進み具合が1日ぶん進む（のこり）",
   didBook.leftAfter === didBook.leftBefore - 1,
   `${didBook.leftBefore} → ${didBook.leftAfter}`);
ok("642字の外の字は無視される（推測で足さない）", didBook.outOfRangeIgnored);

// ★卒業したら「必ず出す」印が外れること（外れないと永久に出続ける）
const graduated = await page.evaluate(() => {
  RECORDS = {}; WEAK = {}; KSTATS = {};
  const k = KANJI_MASTER[0].k;
  markWrongChars(k, "kaki");
  const before = mustWriteList().indexOf(k) >= 0;
  // 卒業させる
  WEAK[k].got = true; WEAK[k].must = false;
  const after = mustWriteList().indexOf(k) >= 0;
  RECORDS = {}; WEAK = {}; KSTATS = {};
  return { before, after };
});
ok("できなかった字は、卒業するまで出続ける", graduated.before);
ok("★卒業したら「必ず出す」印が外れる（永久に出続けない）", !graduated.after);
ok("本の問題の答えも、折り線の下に出る", mix.keyHasBushu);
ok("問題側に答えが混じっていない", !mix.bodyHasAnswer);
ok("本の問題が混ざっても、答えが折り線をまたがない", mix.keyOverflow <= 0, String(mix.keyOverflow));
ok("本の問題が混ざっても、問題が紙からはみ出さない", mix.bodyOverflow <= 0, String(mix.bodyOverflow));

// ★★ここは「テストが全通過したのに紙が使えなかった」層。
//   1問に空らんが3〜4個あるのに**書くマスが1つ**しかなかった。
//   はみ出し0・答えは折り線の下・番号も一致——**機械的な条件は全部満たしていた。**
//   刷って目で見るまで気づけなかったので、条件として書き下しておく。
const slots = await page.evaluate(() => {
  const verified = {
    unitId: "dr_25", groups: [{ field: "bushu", instruction: "…", items: [
      { id:"q_s1", no:1, field:"bushu", text:"刂　□用・以□・整□",
        answers:[{ansNo:1,text:"利",around:"□用"},{ansNo:1,text:"前",around:"以□"},
                 {ansNo:1,text:"列",around:"整□"}],
        kanji:["利","前","列"],
        ruby:[{base:"□",yomi:"り",nth:1},{base:"□",yomi:"ぜん",nth:2},{base:"□",yomi:"れつ",nth:3}] },
      { id:"q_s2", no:2, field:"bushu", text:"亻　□康",
        answers:[{ansNo:1,text:"健",around:"□康"}], kanji:["健"],
        ruby:[{base:"□",yomi:"けん",nth:1}] }
    ]}]
  };
  BOOK_UNITS = [verified];
  // ★照合ずみかどうかの判定に依存させない（どの単元が通過ずみかは日々動く）
  const keepVerified = window.isVerifiedUnit;
  window.isVerifiedUnit = (id) => id === "dr_25";
  const keep = window.planToday;
  window.planToday = () => ({ unit:"dr_25", from:1, to:10, n:10, day:1, parts:1, part:1,
                              mat:"dr", label:"同じ部首①", pages:"25" });
  printSessionPractice();
  const region = document.getElementById("print-region");
  const rows = [...region.querySelectorAll(".p-body tr")];
  // 本の問題の行だけ見る（先頭2行）
  const got = rows.slice(0, 2).map(r => ({
    slots: r.querySelectorAll(".p-slot").length,
    labels: [...r.querySelectorAll(".p-slotlab")].map(e => e.textContent)
  }));
  window.planToday = keep; window.isVerifiedUnit = keepVerified; BOOK_UNITS = null;
  return got;
});
ok("★★空らんが3つの問題は、書くマスも3つ出る", slots[0] && slots[0].slots === 3,
   JSON.stringify(slots[0]));
ok("★★空らんが1つの問題は、書くマスも1つ", slots[1] && slots[1].slots === 1,
   JSON.stringify(slots[1]));
console.log("");
console.log("=== 例語の位置と、読みの手がかり ===");
const exAlign = await page.evaluate(() => {
  // ★kunWords() は ex を「on.length + kun の添字」で引く。
  //   つまり **ex は on と kun のすべての読みに1つずつ対応している前提**。
  //   ⚠️ 例語が空の読みを ex からだけ落とすと位置がずれ、
  //      訓読みに別の語がぶら下がる（実測48字。書き取り・読みの出題から静かに消えていた）。
  const bad = KANJI_MASTER.filter(r =>
    (r.ex || []).length !== (r.on || []).length + (r.kun || []).length);
  // ★紙の手がかりに同じ読みを2回出さない（3つ出すつもりが実質2つになる）
  const dupHint = KANJI_MASTER.filter(r => {
    const h = readingHint(r).split("・").filter(Boolean);
    return new Set(h).size !== h.length;
  });
  return { bad: bad.length, badEx: bad.slice(0, 5).map(r => r.k),
           dupHint: dupHint.length, dupEx: dupHint.slice(0, 5).map(r => r.k),
           sample: readingHint(KANJI_MASTER.find(r => r.k === "夏")) };
});
ok("★例語の数が、音と訓の数の合計と一致する（位置がずれていない）",
   exAlign.bad === 0, `ずれ ${exAlign.bad} 字 ${exAlign.badEx.join("")}`);
ok("★紙の手がかりに、同じ読みを2回出さない",
   exAlign.dupHint === 0, `${exAlign.dupHint} 字 ${exAlign.dupEx.join("")}`);
ok("重複を省いたぶん、手がかりが埋まる（夏＝カ・ゲ・なつ）",
   exAlign.sample === "カ・ゲ・なつ", exAlign.sample);

ok("★★書くマス1つ1つに、その空らんの読みが付いている（まとめて書かない）",
   !!(slots[0] && slots[0].labels.join("・") === "り・ぜん・れつ"),
   JSON.stringify(slots[0] && slots[0].labels));

console.log("\n=== 紙の折り線（答えが折り線をまたがないか。C-4d） ===");
// ユーザー指示（2026-09-10）:「書きは、答えを紙をおれば見えないみたいにできますか? 広げてパパが丸付けします」
// ★唯一の失敗のしかたは「答えが答え欄から溢れて、折り線より上に出ること」。
//   溢れれば折っても答えが見えるので、**そこだけを機械的に見る。**
//   ⚠️ 問題数が変われば答えの行数も変わるので、**少ない日・ふつうの日・多い日**で見る。
await page.emulateMedia({ media: "print" });
await page.setViewportSize({ width: 794, height: 1123 });
const foldCheck = await page.evaluate(() => {
  const out = [], real = window.practiceList;
  const pool = KANJI_MASTER.map(r => r.k);
  [5, 13, 20, 30, 40].forEach(n => {   // ★上限側も見る。マスの高さを上げたとき30問で実際に溢れた
    window.practiceList = () => pool.slice(0, n);
    printSessionPractice();
    const region = document.getElementById("print-region");
    // ★複数枚に分かれる日があるので、**全ページのうち最悪のもの**で見る
    const sheets = [...region.querySelectorAll(".p-sheet")];
    const worst = (f) => Math.max.apply(null, sheets.map(f));
    const key = region.querySelector(".p-key"), fold = region.querySelector(".p-fold");
    const body = region.querySelector(".p-body");
    out.push({
      n: n, hasFold: !!fold, sheets: sheets.length,
      // どのページにも折り線と答えがあること
      everySheetHasFoldAndKey: sheets.every(s => s.querySelector(".p-fold") && s.querySelector(".p-key")),
      // 答え欄からの溢れ。1pxでも溢れたら、折っても答えが見える
      keyOverflow: worst(s => { const k = s.querySelector(".p-key"); return k ? k.scrollHeight - k.clientHeight : -1; }),
      // 折り線が答えより先に来ていること（逆なら折る意味がない）
      foldAboveKey: !!(fold && key &&
        (fold.compareDocumentPosition(key) & Node.DOCUMENT_POSITION_FOLLOWING)),
      hasKakiKey: !!key && key.textContent.indexOf("書きの答え") >= 0,
      // ★★ここが本命。**問題側が入りきらず、折り線を突き抜けていないか。**
      //   最初これを見ておらず「答え欄の中の溢れ」しか見ていなかったため、
      //   20問で問題が紙をはみ出して答えの上に重なっていたのに**テストは全通過した。**
      //   撮って目で見て初めて分かった（C-4d / D-14「その検査で捕まるかは試すまで分からない」）。
      bodyOverflow: worst(s => { const b = s.querySelector(".p-body"); return b ? b.scrollHeight - b.clientHeight : -1; }),
      // 問題の最後の行が、折り線より上で終わっていること
      // ★各ページごとに「最終行 ≦ そのページの折り線」を見る（ページをまたいで比べない）
      rowBelowFold: sheets.filter(s => {
        const rows = s.querySelectorAll("tr"), f = s.querySelector(".p-fold");
        if (!rows.length || !f) return false;
        return rows[rows.length - 1].getBoundingClientRect().bottom > f.getBoundingClientRect().top;
      }).length,
      lastRowBottom: 0, foldTop: 0,
      // ★問題側に答えが混じっていないこと
      bodyHasAnswer: !!body && body.textContent.indexOf("答え") >= 0,
      // ★測るのは region 全体ではなく **1枚ごと**。
      //   複数枚に分かれる日があるので、region の高さは枚数ぶんになる（それは正しい）。
      //   守りたいのは「**どの1枚もA4で、折り線が毎回同じ位置**」のほう。
      sheetHeights: sheets.map(s => Math.round(s.getBoundingClientRect().height)),
      // そのページの上端から折り線までの距離が、どのページでも同じであること
      foldOffsets: sheets.map(s => {
        const f = s.querySelector(".p-fold");
        return f ? Math.round(f.getBoundingClientRect().top - s.getBoundingClientRect().top) : -1;
      })
    });
  });
  window.practiceList = real;
  return out;
});
await page.emulateMedia({ media: null });
foldCheck.forEach(c => {
  ok("折り線がある（" + c.n + "字）", c.hasFold);
  ok("折り線が答えより上にある（" + c.n + "字）", c.foldAboveKey);
  ok("★答えが折り線をまたいでいない（" + c.n + "字）", c.keyOverflow <= 0, "はみ出し " + c.keyOverflow + "px");
  ok("★★問題が紙からはみ出していない（" + c.n + "字）", c.bodyOverflow <= 0, "はみ出し " + c.bodyOverflow + "px");
  ok("★★問題の最後の行が折り線より上で終わっている（" + c.n + "字）",
     c.rowBelowFold === 0, "折り線を越えたページ " + c.rowBelowFold + " 枚");
  ok("どのページにも折り線と答えがある（" + c.n + "字）", c.everySheetHasFoldAndKey,
     "ページ数 " + c.sheets);
  ok("書きの答えが答え欄にある（" + c.n + "字）", c.hasKakiKey);
  ok("★問題側に答えが混じっていない（" + c.n + "字）", !c.bodyHasAnswer);
});
// ★1枚ごとにA4であること。region 全体の高さは枚数ぶんになるので、そちらでは見ない
const allSheets = foldCheck.reduce((a, c) => a.concat(c.sheetHeights), []);
ok("★どの1枚もA4の高さに固定されている",
   allSheets.every(h => Math.abs(h - allSheets[0]) < 1), allSheets.join(" / "));
// ★折り線の位置が、どのページでも同じ（毎回同じ場所で折れる。これが折り線の設計の要）
const allOffsets = foldCheck.reduce((a, c) => a.concat(c.foldOffsets), []);
ok("★折り線の位置が、どのページでも同じ",
   allOffsets.every(o => Math.abs(o - allOffsets[0]) < 1), allOffsets.join(" / "));

console.log("\n=== 目次のマージ（★焼き付いた端末が直るか。C-7b） ===");
// もとの実装は `load(K_UNITS,null) || DEFAULT_UNITS` で、**保存ずみが1件でもあると
// DEFAULT_UNITS が永久に無視され、端末に【仮】の目次が焼き付いた。**
// 「きろく」で1件登録すると save(K_UNITS,...) が走るので、必ず起きる。
// ここで見るのは「1回目に動くか」ではなく **「すでに焼き付いた状態から直るか」** と
// **「2回目・3回目も壊れないか」**（確認ポイント C-7b）。

// ① 旧版の端末を再現する。25回ぶんが field も pages も空（＝【仮】）で保存ずみ。
//    さらに「人が手で直した1件」と「DEFAULT に無い古い id」を混ぜる。
await page.evaluate(() => {
  const sealed = [];
  for (let i = 1; i <= 25; i++) {
    sealed.push({ id: "tn_" + String(i).padStart(2, "0"), mat: "tn",
                  label: "第" + i + "回", field: "", pages: "", qs: 0 });
  }
  sealed[2].qs = 99;                 // ← 人が「せってい」で入れた値（tn_03）
  sealed[4].field = "kaki";          // ← 人が入れた分野（tn_05。DEFAULT は yomi）
  sealed.push({ id: "zz_old", mat: "tn", label: "むかしの回", field: "", pages: "", qs: 7 });
  localStorage.setItem("kanken7_units_v1", JSON.stringify(sealed));
  // 記録も1件置く。**この id を指す単元が消えないこと**が要点（C-5）
  const rec = JSON.parse(localStorage.getItem("kanken7_records_v1") || "{}");
  rec["zz_old"] = { correct: 5, total: 7, field: "", date: "2026-09-10" };
  localStorage.setItem("kanken7_records_v1", JSON.stringify(rec));
});

const snap = async () => await page.evaluate(() => ({
  n: UNITS.length,
  ids: UNITS.map(u => u.id),
  tn01: UNITS.find(u => u.id === "tn_01"),
  tn03: UNITS.find(u => u.id === "tn_03"),
  tn05: UNITS.find(u => u.id === "tn_05"),
  zz:   UNITS.find(u => u.id === "zz_old"),
  blankField: UNITS.filter(u => !u.field).length,
  recKeys: Object.keys(RECORDS)
}));

await page.reload({ waitUntil: "networkidle" });
const m1 = await snap();

ok("★焼き付いた端末でも、空だった分野が埋まる", m1.tn01 && m1.tn01.field === "yomi",
   JSON.stringify(m1.tn01));
ok("★空だったページも埋まる", m1.tn01 && m1.tn01.pages === "2-3", JSON.stringify(m1.tn01));
ok("★仮のラベルが本物の見出しに変わる", !!(m1.tn01 && m1.tn01.label.includes("漢字の読み")),
   m1.tn01 && m1.tn01.label);
ok("人が入れた問数を上書きしない（tn_03 qs=99）", m1.tn03 && m1.tn03.qs === 99,
   JSON.stringify(m1.tn03));
ok("人が入れた分野を上書きしない（tn_05 = kaki）", m1.tn05 && m1.tn05.field === "kaki",
   JSON.stringify(m1.tn05));
ok("★DEFAULT に無い古い id を消さない（記録が指しているため C-5）", !!m1.zz,
   JSON.stringify(m1.zz));
ok("その記録も残っている", m1.recKeys.includes("zz_old"), m1.recKeys.join(","));
ok("id に重複が出ていない", m1.ids.length === new Set(m1.ids).size,
   `${m1.ids.length} / ${new Set(m1.ids).size}`);
ok("実戦テストも足された", m1.ids.includes("tn_t1") && m1.ids.includes("tn_t3"));

// ② 2回目。**ここが本体。**一度きりの処理は2回目に沈黙して壊れることがある（C-7b）
await page.reload({ waitUntil: "networkidle" });
const m2 = await snap();
ok("2回目のリロードでも同じ結果（増殖しない）",
   JSON.stringify(m1.ids) === JSON.stringify(m2.ids), `${m1.n} -> ${m2.n}`);
ok("2回目でも人が入れた値が残っている", m2.tn03.qs === 99 && m2.tn05.field === "kaki",
   JSON.stringify([m2.tn03.qs, m2.tn05.field]));

// ③ 3回目。さらに「記録して保存が走った状態」からもう一度
await page.evaluate(() => { save(K_UNITS, UNITS); });   // アプリが保存する経路を再現
await page.reload({ waitUntil: "networkidle" });
const m3 = await snap();
ok("3回目（保存が走ったあと）でも同じ結果",
   JSON.stringify(m2.ids) === JSON.stringify(m3.ids), `${m2.n} -> ${m3.n}`);
ok("★保存で焼き付いていない（分野が消えていない）", m3.tn01.field === "yomi",
   JSON.stringify(m3.tn01));

// ④ 保存ずみを空にしたら DEFAULT から入り直すか（＝毎回やり直している証拠）
await page.evaluate(() => {
  const u = JSON.parse(localStorage.getItem("kanken7_units_v1") || "[]");
  const t = u.find(x => x.id === "tn_01"); if (t) { t.field = ""; t.pages = ""; }
  localStorage.setItem("kanken7_units_v1", JSON.stringify(u));
});
await page.reload({ waitUntil: "networkidle" });
const m4 = await snap();
ok("★あとから空になっても、次に開いたとき埋め直される",
   m4.tn01.field === "yomi" && m4.tn01.pages === "2-3", JSON.stringify(m4.tn01));

ok("目次のマージでJSエラーが出ていない", errors.length === 0, errors.join(" | "));

await browser.close();
server.close();
console.log(`\n${fail === 0 ? "★ 全通過" : "★ 失敗あり"}  通過 ${pass} / 失敗 ${fail}`);
process.exit(fail ? 1 : 0);
