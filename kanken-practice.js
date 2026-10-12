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

/* =========================================================================
   ★書き取りは「語ぜんぶ」を書く（2026-10-12 ユーザー指示）
     「□合（試合）なんですが試合全部書かせてほしいです。熟語でちゃんと覚えてほしいので。食塩、城門、埼玉とかも。」
     「どっちも送り仮名まで書かせたいです。」（テストの紙も）
   ・語 ＝ となりの漢字（ownPartsOf。長い語は本の読み問題にある語の部分だけ）＋答えの字＋送りがな
   ・送りがなは常用漢字表の訓（kanken-kanji.js の kun・ex）から決める。推測しない（A-6）:
       カタカナ（target）が訓の「送りがなの前」と一致し、例欄に その字＋送りがな の形があるときだけ
       五段動詞（う段で終わる）・形容詞（い）は最後の1字が活用で変わる → 字数だけ合わせる（笑う→「笑っ」て）
       一段動詞（い段・え段＋る）は る を落とす（帯びる→「帯び」て）。それ以外（静か）は文と一字ずつ一致したときだけ
       候補が2つ以上あって答えが割れたら、送りがなは付けない
   ・記録（〇✕）は今までどおり答えの字だけ。問題id・本のデータは変えない（紙に出す形だけ）
   ・返す {pre, k, post, okuri, word, ui, ul}。ui/ul … 問題文の中で——線を引く位置と長さ。語にならなければ null（今までどおり）
   ========================================================================= */
var HIRA_KATA = function (s) { return String(s || "").replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); }); };
var KATA_HIRA = function (s) { return String(s || "").replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); };
var ROW_IE = "いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ";
// 活用で最後の1字がなりうる字（五段動詞はその行＋音便。形容詞は く・か・け・さ・い）。これ以外（を・の など助詞）は送りがなにしない
var CONJ = { "う": "わいうえおっ", "く": "かきくけこい", "ぐ": "がぎぐげごい", "す": "さしすせそ", "つ": "たちつてとっ",
  "ぬ": "なにぬねのん", "ぶ": "ばびぶべぼん", "む": "まみむめもん", "る": "らりるれろっ", "い": "いくかけさ" };
// tail（辞書の形の送りがな）と、文の続き（after）から、紙に書く送りがなを決める。決められなければ ""
function okuriByTail(tail, after) {
  var L = tail.length, last = tail.charAt(L - 1), n = L, free = "";
  if (last === "る" && L >= 2 && ROW_IE.indexOf(tail.charAt(L - 2)) >= 0) n = L - 1;   // 一段動詞（る を落とす）
  else if (CONJ[last]) free = CONJ[last];                                               // 五段動詞・形容詞（最後の1字が活用）
  var got = after.slice(0, n);
  if (got.length < n || !/^[ぁ-ゖ]+$/.test(got)) return "";
  if (free) {
    if (got.slice(0, n - 1) !== tail.slice(0, n - 1) || free.indexOf(got.charAt(n - 1)) < 0) return "";
    if (last !== "い" && "あかがさざただなはばぱまやら".indexOf(after.charAt(n - 1)) >= 0 && /^し[いくかさ]/.test(after.slice(n))) return "";  // 勇ましい（勇む から作った語）は決められない
  } else if (got !== tail.slice(0, n)) return "";
  return got;
}
function pickOne(found) {
  // 2つ以上合ったら長いほう（積む「も」と 積もる「もれ」→ もれ）。同じ長さで割れたら付けない
  var ks = Object.keys(found).sort(function (a, b) { return b.length - a.length; });
  return (ks.length === 1 || (ks.length > 1 && ks[0].length > ks[1].length)) ? ks[0] : "";
}
function okuriOf(k, stem, after, master) {
  var m = master && master[k];
  if (!m || !after || !/^[ぁ-ゖ]/.test(after)) return "";
  var nOn = (m.on || []).length, found = {};
  (m.kun || []).forEach(function (r, j) {
    r = String(r);
    if (r.indexOf(stem) !== 0 || r.length <= stem.length) return;
    var tail = r.slice(stem.length), ex = String((m.ex || [])[nOn + j] || "");
    if (ex.indexOf(k + tail.charAt(0)) < 0) return;          // 例欄に「字＋送りがな」が無い → 送りがなの切れ目が違う
    var got = okuriByTail(tail, after);
    if (got) found[got] = 1;
  });
  return pickOne(found);
}
/* 語の最後の字（答えの字ではない字。仲直り の 直）の送りがな。読みが分からないので、例欄の「字＋ひらがな」（直る）の形から決める */
function okuriOfLast(k, after, master) {
  var m = master && master[k];
  if (!m || !after || !/^[ぁ-ゖ]/.test(after)) return "";
  var found = {};
  (m.ex || []).join("，").split(/[，、,]/).forEach(function (w) {
    w = w.trim();
    if (w.charAt(0) !== k) return;                            // 字で始まる例（直る・良い）だけ
    var mm = /^.([ぁ-ゖ]+)/.exec(w);
    if (!mm) return;
    var tail = mm[1].replace(/(.)だ$/, "$1");                  // 静かだ → か
    var got = okuriByTail(tail, after);
    if (got) found[got] = 1;
  });
  return pickOne(found);
}
function kakiWholeFor(it, g, wd, master) {
  if (!it) return null;
  var f = it.field || (g && g.field) || "";
  if (f !== "kaki") return null;
  var ans = it.answers || [];
  if (ans.length !== 1) return null;
  var k = String(ans[0].text || "");
  if (pwChars(k).length !== 1 || !pwIsKanji(k)) return null;
  var t = String(it.target || ""), txt = String(it.text || "");
  if (!t || !/^[ァ-ヶー]+$/.test(t)) return null;
  var idx = -1;
  for (var i = 0; i < (it.targetNth || 1); i++) { idx = txt.indexOf(t, idx + 1); if (idx < 0) return null; }
  var o = ownPartsOf(it, g, k, wd) || { pre: "", post: "" };
  var okuri = "", after = txt.slice(idx + t.length + o.post.length);
  if (!o.post) okuri = okuriOf(k, KATA_HIRA(t), after, master);
  else if (/^[ぁ-ゖ]/.test(after) && !/^(する|され|させ|し[てた])/.test(after)) {
    // 後ろの字に送りがなが続く（仲直り・巣立ち）。ふつうは助詞（試合を・必死の）なので、1字で助詞と同じ字なら付けない
    okuri = okuriOfLast(pwChars(o.post).slice(-1)[0], after, master);
    if (okuri.length === 1 && "のをにがはでともへやかさしすせ".indexOf(okuri) >= 0) okuri = "";
  }
  // ★送りがなのあとの「た・て・だ・で・る」までを語に入れる（2026-10-13 ユーザー指示「サカえた ではなく サカエタ」）。
  //   本の送りがなの問題（ツケル → 付ける）と同じく、活用した形のまま書く（栄えた・笑って・覚える）
  if (okuri) { var nx = after.charAt(okuri.length); if ("たてだでる".indexOf(nx) >= 0) okuri += nx; }
  if (!o.pre && !o.post && !okuri) return null;
  var ui = idx - o.pre.length, ul = o.pre.length + t.length + o.post.length + okuri.length;
  if (txt.slice(ui, idx) !== o.pre) return null;   // 長い語を切った形で、前の字が文と合わない（念のため）
  // ★——線の中をぜんぶカタカナにする（キンカ・サカエタ）。送りがなの切れ目を自分で考える形（本の送りがなの問題と同じ）。
  //   となりの漢字があるときは、その語の読みが本の読み問題にあるときだけ（金貨＝きんか）。無ければ今までどおり（金カ）。読みは作らない（A-6）
  var base = o.pre + k + o.post, kana = null;
  if (!o.pre && !o.post) kana = t + HIRA_KATA(okuri);
  else if (wd && wd.dict && wd.dict[base]) kana = HIRA_KATA(wd.dict[base] + okuri);
  return { pre: o.pre, k: k, post: o.post, okuri: okuri, word: base + okuri, ui: ui, ul: ul, kana: kana };
}

/* ★部首（貝 金□・年□）・熟語作り（□門）を「キンカ・ネンガ」の形にする（2026-10-13 ユーザー指示「金□ではなくて、キンカという問題にできませんか？」。テストの紙も）。
   ・語＝ around の □ に答えの字を入れたもの。熟語作りの答え「ウ 金」の記号は外す
   ・**全部の語の読みが本の読み問題にあるときだけ**（ユーザー判断「読みが本にある語だけ」）。1つでも無ければ null＝今までどおり
   ・返す {words:[金貨,年賀], kana:[キンカ,ネンガ]} */
function kanaWordsFor(it, g, wd) {
  if (!it || !wd || !wd.dict) return null;
  var f = it.field || (g && g.field) || "";
  if (f !== "bushu" && f !== "jukugo") return null;
  var ans = it.answers || [];
  if (!ans.length) return null;
  var words = [], kana = [];
  for (var i = 0; i < ans.length; i++) {
    var ar = String(ans[i].around || ""), k = String(ans[i].text || "").replace(/^[ア-オ]\s*/, "");
    if (pwChars(k).length !== 1 || !pwIsKanji(k) || ar.split("□").length !== 2) return null;
    var w = ar.replace("□", k), y = wd.dict[w];
    if (!y) return null;
    words.push(w); kana.push(HIRA_KATA(y));
  }
  return { words: words, kana: kana };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildWordDict: buildWordDict, practiceWordFor: practiceWordFor, practiceWordsFor: practiceWordsFor, boxRubyYomi: boxRubyYomi, ownPartsOf: ownPartsOf, ownWordOf: ownWordOf, WORD_FIELDS: WORD_FIELDS, kakiWholeFor: kakiWholeFor, okuriOf: okuriOf, kanaWordsFor: kanaWordsFor };
}
