/* =========================================================================
   答えとなおしの紙の「語の形」（2026-09-27 ユーザー指示）
   「練習を漢字だけじゃなくて、問題の形式で練習させてください。
     たとえば旗は、国旗なので、国旗（国はプリントに書いてあって旗だけ練習するので、やることは変えずに。）」

   ★書く字は1字のまま。**語のほかの字は印刷しておき、読みを添える**（例: 国 ▢（こっき））。
   ★語と読みは**本の読み問題（照合ずみ）から取る。**常用漢字表の例語からは作らない。
     「国旗＝こっき」は 国＝こく が こっ に変わることを知らないと出せず、データからは出ない。
     kanken-gen.js の「熟語は読みがなを確実に作れないため使わない（A-6）」を破らないための唯一の道。

   選び方（ユーザー判断 2026-09-27「同じ問題を優先し、無ければ本の別の語も使う」）:
     ① その問題の文中の語（——線のカタカナにとなりあう漢字／対義語の □別 の形）が、本の読み問題にもある
     ② ①が無ければ、その字を含む本の別の語。**いちばん短い語 → 本の順で先のもの**
        （短いほうが印刷する字が少なく、書くマスが大きいまま。同じ字には毎回同じ語が出る）
     ③ どちらも無ければ null ＝ **今までどおり字だけ**（落とさない）
   ⚠️ 読みが2通りある語（本の中で2つの読みで出ている語）は**使わない。**どちらを出すか決められないため
   ⚠️ 答えが1字でない問題（部首・2字の書き取り）は対象外（null）。今までどおり
   ========================================================================= */
var WORD_FIELDS = ["kaki", "onaji", "taigi"];

function pwIsKanji(c) { return /^[一-鿿]$/.test(c); }   // 々 は入れない（▢々 になると読みにくい）
function pwChars(s) { return Array.from(String(s || "")); }

/* 本の読み問題から「語 → 読み」を集める。
   units … 本の単元の配列。okUnit(unitId) … 照合ずみなら true（未照合の単元の語は使わない） */
function buildWordDict(units, okUnit) {
  var read = {}, order = [];
  (units || []).forEach(function (u) {
    if (okUnit && !okUnit(u.unitId)) return;
    (u.groups || []).forEach(function (g) {
      (g.items || []).forEach(function (it) {
        if ((it.field || g.field) !== "yomi") return;
        var ans = it.answers || [];
        if (ans.length !== 1) return;
        var w = String(it.target || ""), y = String(ans[0].text || "");
        var cs = pwChars(w);
        if (cs.length < 2 || !cs.every(pwIsKanji)) return;     // 2字以上・漢字だけの語
        if (!/^[ぁ-ゖー]+$/.test(y)) return;                   // 読みはひらがなだけ
        if (!read[w]) { read[w] = {}; order.push(w); }
        read[w][y] = 1;
      });
    });
  });
  var dict = {}, byK = {};
  order.forEach(function (w) {
    var ys = Object.keys(read[w]);
    if (ys.length !== 1) return;                               // 読みが2通り → 使わない
    dict[w] = ys[0];
    var cs = pwChars(w);
    cs.forEach(function (k, i) {
      if (cs.indexOf(k) !== i || cs.lastIndexOf(k) !== i) return;   // 同じ字が2回ある語は使わない
      (byK[k] = byK[k] || []).push(w);
    });
  });
  Object.keys(byK).forEach(function (k) {
    // 短い語が先。同じ長さなら本の順（order は本の順）
    byK[k].sort(function (a, b) { return pwChars(a).length - pwChars(b).length || order.indexOf(a) - order.indexOf(b); });
  });
  return { dict: dict, byK: byK };
}

/* その問題の文中の語（①の候補）を {pre, post} で返す。無ければ null。k は答えの字（pre と post のあいだに入る） */
function ownPartsOf(it, g, k, wd) {
  var f = it.field || (g && g.field) || "";
  var a = (it.answers || [])[0] || {};
  if (f === "taigi") {
    var ar = String(a.around || "");
    var parts = ar.split("□");
    if (parts.length !== 2) return null;                       // □ がちょうど1つの形だけ
    return { pre: parts[0], post: parts[1] };
  }
  var t = String(it.target || ""), txt = String(it.text || "");
  if (!t || !/^[ァ-ヶー]+$/.test(t)) return null;
  var idx = -1;
  for (var i = 0; i < (it.targetNth || 1); i++) { idx = txt.indexOf(t, idx + 1); if (idx < 0) return null; }
  var s = idx, e = idx + t.length;
  while (s > 0 && pwIsKanji(txt.charAt(s - 1))) s--;
  while (e < txt.length && pwIsKanji(txt.charAt(e))) e++;
  if (s === idx && e === idx + t.length) return null;          // となりに漢字が無い
  var pre = txt.slice(s, idx), post = txt.slice(idx + t.length, e);
  var all = pwChars(pre + k + post);
  if (all.length > 4) {
    // 長い語（天体望遠鏡）は、本の読み問題にある語（望遠鏡）が中に入っていれば、その部分だけにする。無ければ使わない
    var best = null, pc = pwChars(pre).length;
    for (var a1 = 0; a1 <= pc; a1++) for (var b1 = pc + 1; b1 <= all.length; b1++) {
      var w = all.slice(a1, b1).join("");
      if (wd && wd.dict[w] && (!best || pwChars(w).length > pwChars(best.w).length)) best = { w: w, a: a1, b: b1 };
    }
    if (!best) return null;
    return { pre: all.slice(best.a, pc).join(""), post: all.slice(pc + 1, best.b).join("") };
  }
  return { pre: pre, post: post };
}
/* 互換: 語をひとつの文字列で返す（検査道具が使う） */
function ownWordOf(it, g, k) {
  var p = ownPartsOf(it, g, k, null);
  return p ? p.pre + k + p.post : null;
}

/* 1問ぶんの語の形。{pre, k, post, yomi, how:"same"|"other", word} か null（＝字だけ）
   ★2026-10-03 ユーザー指示「不満、入浴って出題、練習させたい」→ 問題に出た語をそのまま使う（how:"same"）。
     読みは、本の読み問題にその語があって読みが1通りのときだけ出す。無ければ yomi:""（語の形だけ。読みは作らない・A-6）
   ② 問題の文中に語が無いときだけ、これまでどおり本の別の語（how:"other"）→ 無ければ字だけ */
function practiceWordFor(it, g, wd) {
  if (!wd || !it) return null;
  var f = it.field || (g && g.field) || "";
  if (WORD_FIELDS.indexOf(f) < 0) return null;
  var ans = it.answers || [];
  if (ans.length !== 1) return null;
  var k = String(ans[0].text || "");
  if (pwChars(k).length !== 1 || !pwIsKanji(k)) return null;
  var o = ownPartsOf(it, g, k, wd);
  if (o && (o.pre || o.post)) {
    var w0 = o.pre + k + o.post;
    return { pre: o.pre, k: k, post: o.post, yomi: wd.dict[w0] || "", how: "same", word: w0 };
  }
  var w = (wd.byK[k] || [])[0];
  if (!w) return null;
  var i = w.indexOf(k);
  return { pre: w.slice(0, i), k: k, post: w.slice(i + k.length), yomi: wd.dict[w], how: "other", word: w };
}

/* 答えらん（□）ごとの読み。□ に付いたルビだけを、何番目の □ か（nth）の順に並べる。
   ★ruby の並びの添字で引かないこと。ruby には問題文の字のルビも混ざる（tn_21 問17 は □,□,妻,□ の順）。
     添字で引くと3つ目の答えらんに「妻」の読みが付いた（2026-10-11 ユーザー指摘）。 */
function boxRubyYomi(ruby) {
  var out = [];
  (ruby || []).forEach(function (r) {
    if (r && r.base === "□" && r.yomi) out[(r.nth || 1) - 1] = String(r.yomi);
  });
  return out;
}

/* 部首の問題（答えが2〜4字、それぞれ □ を含む語）→ 字ごとの語の形の配列。作れなければ null（＝今までどおり）
   ★読み(yomi)は、問題の紙の答えらんの上に印刷されている字の読み（ruby の ぎょ・まん・よく）。語の読みではない（yk:true）。
   ruby が無い字は yomi:""（作らない・A-6） */
function practiceWordsFor(it, g) {
  if (!it) return null;
  var f = it.field || (g && g.field) || "";
  if (f !== "bushu") return null;
  var ans = it.answers || [], boxY = boxRubyYomi(it.ruby);
  if (ans.length < 2 || ans.length > 4) return null;
  var out = [];
  for (var i = 0; i < ans.length; i++) {
    var k = String(ans[i].text || ""), parts = String(ans[i].around || "").split("□");
    if (pwChars(k).length !== 1 || parts.length !== 2 || !(parts[0] || parts[1])) return null;
    var y = boxY[i] || "";
    out.push({ pre: parts[0], k: k, post: parts[1], yomi: /^[ぁ-ゖー]+$/.test(y) ? y : "", yk: true });
  }
  return out;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildWordDict: buildWordDict, practiceWordFor: practiceWordFor, practiceWordsFor: practiceWordsFor, boxRubyYomi: boxRubyYomi, ownPartsOf: ownPartsOf, ownWordOf: ownWordOf, WORD_FIELDS: WORD_FIELDS };
}
