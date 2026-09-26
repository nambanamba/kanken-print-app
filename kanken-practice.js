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

/* その問題の文中の語（①の候補）。無ければ null */
function ownWordOf(it, g, k) {
  var f = it.field || (g && g.field) || "";
  var a = (it.answers || [])[0] || {};
  if (f === "taigi") {
    var ar = String(a.around || "");
    if (pwChars(ar).filter(function (c) { return c === "□"; }).length !== 1) return null;
    var w = ar.replace("□", k);
    return pwChars(w).every(pwIsKanji) ? w : null;
  }
  var t = String(it.target || ""), txt = String(it.text || "");
  if (!t || !/^[ァ-ヶー]+$/.test(t)) return null;
  var idx = -1;
  for (var i = 0; i < (it.targetNth || 1); i++) { idx = txt.indexOf(t, idx + 1); if (idx < 0) return null; }
  var s = idx, e = idx + t.length;
  while (s > 0 && pwIsKanji(txt.charAt(s - 1))) s--;
  while (e < txt.length && pwIsKanji(txt.charAt(e))) e++;
  if (s === idx && e === idx + t.length) return null;          // となりに漢字が無い
  return txt.slice(s, idx) + k + txt.slice(idx + t.length, e);
}

/* 1問ぶんの語の形。{pre, k, post, yomi, how:"same"|"other", word} か null（＝字だけ） */
function practiceWordFor(it, g, wd) {
  if (!wd || !it) return null;
  var f = it.field || (g && g.field) || "";
  if (WORD_FIELDS.indexOf(f) < 0) return null;
  var ans = it.answers || [];
  if (ans.length !== 1) return null;
  var k = String(ans[0].text || "");
  if (pwChars(k).length !== 1 || !pwIsKanji(k)) return null;
  var w = ownWordOf(it, g, k), how = "same";
  if (!(w && wd.dict[w] && (wd.byK[k] || []).indexOf(w) >= 0)) { w = (wd.byK[k] || [])[0]; how = "other"; }
  if (!w) return null;
  var i = w.indexOf(k);
  return { pre: w.slice(0, i), k: k, post: w.slice(i + k.length), yomi: wd.dict[w], how: how, word: w };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildWordDict: buildWordDict, practiceWordFor: practiceWordFor, ownWordOf: ownWordOf, WORD_FIELDS: WORD_FIELDS };
}
