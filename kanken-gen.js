// 漢検7級 問題の自動生成
// 生成: kanken-print-app 担当セッション 2026-09-09
//
// 【方針】マスタ(kanken-kanji.js)だけで作れる形式に限る。
//   本を打ち込まずに、1字単位で「できる／できない」を選り分けるのが目的。
//   ★語が要る形式（漢字えらび・じゅく語作り・同じ読み・対義語）はここでは作らない。
//     常用漢字表の例語では選択肢が作れないため。問題集が届いてから対応する。
//
// 【問題id】"<形式>_<漢字>" の自然キー。並び順に依存しないので、
//   問題を足しても消しても既存idが動かない（確認ポイント C-5）。
//
// 【生成できる形式と、本番の配点との対応】
//   kakusu … 総画数           本番(四)10点のうち「総画数」側
//             ※「何画目」は筆順データが要るため作れない（推測で作らない・A-6）
//   bushu  … 同じ部首をえらぶ  本番(八)20点と同じ知識
//   onkun  … 音読み・訓読み    本番(五)20点と同じ形式
//   kaki   … 書き取り          本番(十一)40点。常用漢字表の訓の例語のみ（下記の制限あり）
//   yomi   … 読み              本番(一)(二)30点。同上

/* 乱数を日付で固定する（同じ日に印刷し直しても同じ問題が出る） */
function seededRandom(seed) {
  var s = 0;
  for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function shuffle(arr, rnd) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rnd() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

var MASTER_BY_K = {};
KANJI_MASTER.forEach(function (r) { MASTER_BY_K[r.k] = r; });

/* 部首ごとのグループ。「同じ部首をえらぶ」の選択肢作りに使う */
var BY_RAD = {};
KANJI_MASTER.forEach(function (r) {
  (BY_RAD[r.radNo] = BY_RAD[r.radNo] || []).push(r.k);
});

/* =========================================================================
   1) 総画数
   ========================================================================= */
function genKakusu(k) {
  var r = MASTER_BY_K[k];
  if (!r) return null;
  return {
    id: "kakusu_" + k, field: "kakusu", kanji: k,
    q: r.k, ask: "総画数は何画ですか（算用数字で）",
    a: String(r.strokes)
  };
}

/* =========================================================================
   2) 同じ部首をえらぶ
   正解1字＋別の部首から3字。★答えの字と同じ部首の字を、まぎらわしい選択肢に入れない
   ========================================================================= */
/* avoid … 同じ1枚に出る他の問題の字。選択肢にそれを入れると、
   別の問題の答えを紙の上でばらしてしまう（確認ポイント A-1）。 */
function genBushu(k, rnd, avoid) {
  var r = MASTER_BY_K[k];
  if (!r) return null;
  avoid = avoid || {};
  var same = (BY_RAD[r.radNo] || []).filter(function (c) { return c !== k && !avoid[c]; });
  if (same.length === 0) return null;         // 仲間がいない字は作れない
  var correct = shuffle(same, rnd)[0];
  var others = shuffle(KANJI_MASTER.filter(function (x) {
    return x.radNo !== r.radNo && !avoid[x.k];
  }).map(function (x) { return x.k; }), rnd).slice(0, 3);
  var choices = shuffle([correct].concat(others), rnd);
  return {
    id: "bushu_" + k, field: "bushu", kanji: k,
    q: r.k, ask: "同じ部首の漢字をえらびなさい",
    choices: choices,
    a: correct,
    aIndex: choices.indexOf(correct)
  };
}

/* =========================================================================
   3) 音読み・訓読み
   常用漢字表の「例」欄は読みごとに並んでいるので、その語がどちらの読みかが分かる。
   ========================================================================= */
function genOnkun(k, rnd) {
  var r = MASTER_BY_K[k];
  if (!r) return null;
  var items = [];
  r.on.forEach(function (rd) { items.push({ rd: rd, t: "ア" }); });   // ア＝音読み
  r.kun.forEach(function (rd) { items.push({ rd: rd, t: "イ" }); });  // イ＝訓読み
  if (!items.length) return null;
  var pick = shuffle(items, rnd)[0];
  return {
    id: "onkun_" + k, field: "onkun", kanji: k,
    q: r.k + "（" + pick.rd + "）",
    ask: "この読みは 音読み(ア) ですか 訓読み(イ) ですか",
    a: pick.t
  };
}

/* =========================================================================
   4) 書き取り／読み（常用漢字表の例語から）
   ★制限: 例語が「その字＋ひらがな」だけで成り立つ訓読みの語に限る。
     熟語（例: 愛情）は、もう一方の字の読みがマスタに無い場合があり、
     読みがなを確実に作れないため使わない（推測で作らない・A-6）。
   ========================================================================= */
function kunWords(r) {
  // 例) 冷 kun="つめたい" ex="冷たい，冷たさ" → {word:"冷たい", yomi:"つめたい"}
  var out = [];
  var exs = r.ex || [];
  var offset = r.on.length;                    // ex は on の分だけ先に並ぶ
  r.kun.forEach(function (rd, i) {
    var ex = exs[offset + i];
    if (!ex) return;
    ex.split("，").forEach(function (w) {
      w = w.trim();
      if (!w || w.indexOf(r.k) !== 0) return;  // その字で始まる語だけ
      var tail = w.slice(1);
      // 残りが全部ひらがななら、読みは「訓読み＋送りがな」で確実に決まる
      if (!/^[ぁ-ゖ]*$/.test(tail)) return;
      // 送りがなが読みの末尾と合っているものだけ採る
      if (tail && rd.slice(-tail.length) !== tail) return;
      out.push({ word: w, yomi: rd });
    });
  });
  return out;
}
/* ★あいまいな問題を出さないための索引
   例文が無いので、読みだけ見せて「漢字で書きなさい」と出すと答えが定まらない。
     「する」→ 刷る？擦る？　「わ」→ 輪？　「まと」→ 的？
   読みだけだと616通り中60通りがあいまいだった（実測）。
   → **音読みをヒントに添える**と、あいまいは3通りまで減る（実測）。
     「する（音: サツ）」なら 刷る に定まる。音訓を両方問うことにもなる。
   → それでも残る3通り（なか|チュウ→中/仲、かえる|ヘン→返る/変える、はた|キ→旗/機）は出さない。 */
var KAKI_INDEX = {};   // 「読み|音読み」-> その組み合わせになる語の集合
function kakiKey(w, r) { return w.yomi + "|" + (r.on[0] || ""); }
KANJI_MASTER.forEach(function (r) {
  kunWords(r).forEach(function (w) {
    (KAKI_INDEX[kakiKey(w, r)] = KAKI_INDEX[kakiKey(w, r)] || {})[w.word] = 1;
  });
});

function genKaki(k, rnd) {
  var r = MASTER_BY_K[k];
  if (!r) return null;
  var ws = kunWords(r).filter(function (w) {
    return Object.keys(KAKI_INDEX[kakiKey(w, r)] || {}).length === 1;
  });
  if (!ws.length) return null;
  var w = shuffle(ws, rnd)[0];
  return {
    id: "kaki_" + k, field: "kaki", kanji: k,
    q: w.yomi,
    hint: r.on[0] ? "音: " + r.on[0] : "",   // ★これが無いと答えが定まらない
    ask: "漢字と送りがなで書きなさい", a: w.word
  };
}

/* 読み: 送りがなが付いていれば読みは1つに定まる。
   漢字1字だけの語（例「梅」）は 音読み(バイ) とも読めてしまうので、
   「訓読みを書きなさい」と明示し、訓読みが1つの字に限る。 */
function genYomi(k, rnd) {
  var r = MASTER_BY_K[k];
  if (!r) return null;
  var ws = kunWords(r).filter(function (w) {
    if (w.word.length > 1) return true;            // 送りがなあり＝一意
    return r.kun.length === 1;                     // 1字のみ＝訓読みが1つの字だけ
  });
  if (!ws.length) return null;
  var w = shuffle(ws, rnd)[0];
  var bare = w.word.length === 1;
  return {
    id: "yomi_" + k, field: "yomi", kanji: k,
    q: w.word,
    hint: bare ? "訓読み" : "",   // 1字だけだと音読みでも読めるので、どちらか明示する
    ask: bare ? "訓読みをひらがなで書きなさい" : "読みをひらがなで書きなさい",
    a: w.yomi
  };
}

/* 紙に印刷するときの、大問ごとの指示文。
   ★これが無いと「あびせる」とだけ書かれた紙になり、何をすればいいか分からない。 */
var FIELD_ASK = {
  yomi:   "つぎの漢字の読みを、ひらがなで書きなさい。",
  kaki:   "つぎのひらがなを、漢字と送りがなで書きなさい。（　）の中は、その漢字の音読みです。",
  kakusu: "つぎの漢字の総画数は何画ですか。算用数字で書きなさい。",
  bushu:  "つぎの漢字と同じ部首の漢字を、ア〜エからえらんで記号で書きなさい。",
  onkun:  "つぎの読みは、音読み（ア）ですか、訓読み（イ）ですか。記号で書きなさい。"
};

var GENERATORS = {
  kakusu: genKakusu,
  bushu:  genBushu,
  onkun:  genOnkun,
  kaki:   genKaki,
  yomi:   genYomi
};

/* 生成できる形式かどうか（字ごとに違う。作れない字は出さない） */
function canGenerate(field, k, rnd) {
  return !!GENERATORS[field](k, rnd || seededRandom("probe"));
}

/* =========================================================================
   その日の1枚を組む
     上段 = 読み書き（6〜7割）、下段 = 日替わりで1形式（3〜4割）
     ★優先順は「未着手 → まちがえた → できている」。できている字に時間を使わない
   ========================================================================= */
var LOWER_ROTATION = ["kakusu", "bushu", "onkun"];

function pickKanji(field, kstats, limit, rnd, grades, exclude) {
  exclude = exclude || {};
  var pool = KANJI_MASTER.filter(function (r) {
    return (!grades || grades.indexOf(r.grade) >= 0) && !exclude[r.k]
        && canGenerate(field, r.k, rnd);
  });
  function rank(r) {
    var s = (kstats[r.k] || {})[field];
    if (!s || (!s.o && !s.x)) return 0;              // 未着手（最優先）
    if ((s.x || 0) > 0 && (s.o || 0) <= (s.x || 0)) return 1;  // まちがえた
    if ((s.x || 0) > 0) return 2;                    // まちがえたが直ってきた
    // ★4択はまぐれで当たる（25%）。1回の正解で「できた」にすると、
    //   まぐれ当たりした字が二度と出てこなくなり、予想得点が実力より高いまま固まる
    //   （引き継ぎ.md 12-1 の ⚠）。**2回続けて正解するまで「できた」にしない。**
    if (isSelectField(field) && (s.run || 0) < 2) return 2;
    return 3;                                        // できている（最後）
  }
  // 4年配当を先に見る（いちばん新しく習った＝あやしい）
  var sorted = shuffle(pool, rnd).sort(function (a, b) {
    var d = rank(a) - rank(b);
    if (d) return d;
    return b.grade - a.grade;
  });
  return sorted.slice(0, limit);
}

function buildSheet(opts) {
  var kstats = opts.kstats || {};
  var total  = opts.total || 20;
  var dayKey = opts.dayKey || "2026-01-01";
  var rnd = seededRandom(dayKey + "|" + total);
  var lower = LOWER_ROTATION[Math.abs(hashCode(dayKey)) % LOWER_ROTATION.length];

  var nLower = Math.max(3, Math.round(total * 0.35));
  var nUpper = total - nLower;
  var nKaki  = Math.ceil(nUpper * 0.6);
  var nYomi  = nUpper - nKaki;

  // ★同じ字を1枚に2回出さない。
  //   出すと「2. 札 → ふだ」と「14. ふだ → 札」が同じ紙に並び、
  //   一方が他方の答えになってしまう（確認ポイント A-1「問題文に答えが出ている」）。
  var used = {};
  function pick(field, n) {
    var got = pickKanji(field, kstats, n, rnd, opts.grades, used);
    got.forEach(function (r) { used[r.k] = 1; });
    return got;
  }
  var kakiK = pick("kaki", nKaki), yomiK = pick("yomi", nYomi), lowK = pick(lower, nLower);

  var qs = [];
  kakiK.forEach(function (r) { qs.push(genKaki(r.k, rnd)); });
  yomiK.forEach(function (r) { qs.push(genYomi(r.k, rnd)); });
  // 部首の選択肢は、この1枚に出る字を避ける。
  // ★すでに作った問題の「答え」も避ける。避けないと、ある問題の答えが
  //   別の問題の選択肢として紙に並ぶ（実測で40日中2日に発生した）。
  var avoid = {};
  Object.keys(used).forEach(function (k) { avoid[k] = 1; });
  lowK.forEach(function (r) {
    var q = GENERATORS[lower](r.k, rnd, avoid);
    if (!q) return;
    qs.push(q);
    if (q.a && MASTER_BY_K[q.a]) avoid[q.a] = 1;
    (q.choices || []).forEach(function (c) { avoid[c] = 1; });
  });

  // ★紙に出す順（本番の大問の並び）に並べてから番号をふる。
  //   そうしないと、ブロックごとに 9,10,11 → 1,2,3 と番号が飛んで採点しづらい。
  var order = ["yomi", "kakusu", "onkun", "bushu", "kaki"];
  var items = qs.filter(Boolean).sort(function (a, b) {
    return order.indexOf(a.field) - order.indexOf(b.field);
  }).map(function (q, i) { q.no = i + 1; return q; });

  return { date: dayKey, lowerField: lower, items: items };
}

function hashCode(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/* =========================================================================
   きょうのセッション（2026-09-09 の設計変更。引き継ぎ.md 12章）

   「1日1枚固定」をやめ、**「あやしい」が10個たまったら終わり**にする。
   固定枠にすると、できる字を練習させてしまうため（ユーザー指摘）。

   ・選択式（画数・部首・音訓）… タップで自動判定
   ・書き取り                  … 「書ける／あやしい」を自分でタップ
   ・「あやしい」が unsureTarget 個そろったら、その日は終わり
   ・その字で練習プリントを出す

   ★同じ字を、書き取りの手がかりと選択式の両方に出さない。
     出すと「ちる（音:サン）」の答えが、別の問題に印刷された「散」で分かってしまう。
   ========================================================================= */
var SELECT_FIELDS = ["kakusu", "bushu", "onkun"];

/* ★前半（選択式）の終わり方（2026-09-09 決定）。
   「まちがえた字が10個」か「20問」か、**早いほう**で終わる。

   ・問題数だけで区切らない … 固定20問にすると **できる字を20問やらせる**ことになる。
     12-2 で「1日1枚固定」を捨てたのと同じ理由。
   ・間違いの数だけでも区切れない … 間違いは**押して選べない**ので、
     できる日はいつまでも終わらない。上限が要る。
   ・数を後半（あやしい10個）とそろえてある。**子どもが覚えるルールは1つだけ**になる。
   ・20問の根拠: 1問≒10秒（フィードバック込み）で3〜4分。
     後半は1問≒5秒で2〜3分。**合わせて10分に収まる。** */
var SELECT_LIMIT = 20, SELECT_MISS_TARGET = 10;

/* ★後半（自己申告→紙）で出す形式。どちらも「思い出して書く」力を見るので、
   選択肢を出さない。**読みを4択にしないこと**（引き継ぎ.md 6章・12-1）。 */
var WRITE_FIELDS = ["kaki", "yomi"];
function isWriteField(f) { return WRITE_FIELDS.indexOf(f) >= 0; }

/* ★選択式かどうか。まぐれ当たり対策の判定に使う（引き継ぎ.md 12-1 の ⚠）。
   書く形式（kaki・yomi）は当てずっぽうで当たらないので、この扱いをしない。 */
function isSelectField(f) { return SELECT_FIELDS.indexOf(f) >= 0; }

/* その字・その形式が「できた」と言えるか。
   4択は **2回続けて正解**して初めて「できた」。1回では25%で当たってしまう。 */
function fieldDone(s, f) {
  if (!s || !(s.o > 0)) return false;
  if ((s.x || 0) > (s.o || 0)) return false;
  return isSelectField(f) ? (s.run || 0) >= 2 : true;
}

function buildSession(opts) {
  opts = opts || {};
  var kstats = opts.kstats || {};
  var rnd = seededRandom((opts.dayKey || "") + "|session");
  var used = {};

  // ★「書ける」と言って書けなかった字（引き継ぎ.md 12-3b ③）。
  //   その字は自己申告の対象から外し、無条件で練習に入れる。
  //   ここで最初から「あやしい」に入れておくことで、
  //     ①「次に印刷する紙に必ず入れる」（12-3b ①）
  //     ③「次からは『書ける？』と聞かない」
  //   の両方を、待ち行列を持たずに満たす。
  //   ★10字の枠の「中」に入れる（上に積まない）。積むと1日10分が壊れ、
  //     「終わりが明確」という設計（12-2）も崩れるため。
  var mustWrite = (opts.mustWrite || []).slice(0, opts.unsureTarget || 10);
  mustWrite.forEach(function (k) { used[k] = 1; });   // 出題そのものからも外す

  // 書き取りの候補（未着手 → まちがえた → できてきた の順。4年配当が先）
  var writeK = pickKanji("kaki", kstats, opts.writePool || 80, rnd, opts.grades, used);
  writeK.forEach(function (r) { used[r.k] = 1; });

  // ★読みも後半（自己申告→紙）に入れる。**4択にしない。**
  //   本番の(一)(二)は「ひらがなで書きなさい」で、**思い出して書く**力を見る。
  //   4択にすると「見て分かる」力を測って30点分に引き伸ばすことになり、
  //   見かけの点だけ上がって本番では取れない（＝事実と違う励まし。引き継ぎ.md 6章）。
  //   書き取りの字を先に押さえてから取る（書き取り40点のほうが大きいため）。
  //   ★書き取りができる字は、読みを出さない。**書ける ⊃ 読める** なので、
  //     読みを出すのは時間の無駄（45日×10分しかない。「できている字は出さない」）。
  //     逆は成り立たないので、読めるからといって書き取りを外してはいけない。
  var yomiSkip = {};
  Object.keys(used).forEach(function (k) { yomiSkip[k] = 1; });
  KANJI_MASTER.forEach(function (r) {
    if (fieldDone((kstats[r.k] || {}).kaki, "kaki")) yomiSkip[r.k] = 1;
  });
  var yomiK = pickKanji("yomi", kstats, opts.yomiPool || 40, rnd, opts.grades, yomiSkip);
  yomiK.forEach(function (r) { used[r.k] = 1; });

  // 選択式の候補。書き取りに使う字は避ける
  // ★★この除外は絶対に外さないこと（確認ポイント A-1）。
  //   練習プリントは **字とその読みを印刷する**（`氏（シ・うじ）`）ので、
  //   前半で「氏の音読みは？」と聞いた字が後半経由で紙に載ると、
  //   **答えがそのまま紙に印刷される。**前後に分けたあとも同じ。
  var selItems = [], byField = [];
  SELECT_FIELDS.forEach(function (f) {
    var one = [];
    pickKanji(f, kstats, opts.selPool || 30, rnd, opts.grades, used).forEach(function (r) {
      var q = GENERATORS[f](r.k, rnd, used);
      if (q) { one.push(q); used[r.k] = 1; }
    });
    byField.push(one);
  });
  // ★形式ごとの出題数を、**本番の配点の比で**決める（2026-09-09 ユーザー指示）。
  //   均等に順ぐりだと、**画数が約1/3（20問中6〜7問）**出ていた。
  //   本番の (四)何画目・総画数は **10問・10点＝200点中の5%** しかない
  //   （`公式資料\outline_degree_example_7m_3.pdf` と標準解答 `_7k_3.pdf`。
  //     引き継ぎ.md 1章の表は合計200点で検算済み）。
  //   ユーザーの言葉:「画数はもっとほんのちょっとでいい、数えるだけですし」
  //   → 配点比だと 画数10 ÷（10＋20＋20）＝ **20%（20問中4問）**。
  //     問題集から漢字えらび20・じゅく語作り20が入れば、自然に 11% まで下がる。
  //   ★ただし **どの形式も0問にしない。** 画数がまるごと出なくなっても、
  //     本番前まで誰も気づかない。ここがいちばん怖い。
  selItems = weightedPick(SELECT_FIELDS, byField, opts.selectLimit || SELECT_LIMIT, rnd);

  // 後半は書きと読みを順ぐりに。どちらも「自分はできるか」の自己申告なので、
  // 頭の切りかえは起きない（前半と後半を分けたのは、そこが違うため）
  var kakiItems = [], yomiItems = [];
  writeK.forEach(function (r) { var q = genKaki(r.k, rnd); if (q) kakiItems.push(q); });
  yomiK.forEach(function (r) { var q = genYomi(r.k, rnd); if (q) yomiItems.push(q); });
  var writeItems = roundRobin([kakiItems, yomiItems], rnd);

  // ★前半＝選択式、後半＝書き（2026-09-09 の設計変更）。
  //   もとは交互だったが、次の理由で分けた。
  //   ・頭の使い方が違う（選択式＝知識で選ぶ／書き＝自分は書けるかの自己評価）
  //   ・**終わりの基準が書きにしか無く、選択式が「おまけ」になっていた**（120点分あるのに）
  //   ・選択式はその場で〇✕が出る。**先にすると「今日もできた」で始められる**（ユーザー判断）
  //   前任が交互にした理由は「書きだけ続くと単調」だが、
  //   **選択式が速いので前半がテンポよく流れ、単調さは起きない**と判断した。
  var items = selItems.concat(writeItems);
  items.forEach(function (q, i) { q.no = i + 1; });

  return {
    date: opts.dayKey,
    unsureTarget: opts.unsureTarget || 10,
    selectLimit: opts.selectLimit || SELECT_LIMIT,
    selectMissTarget: opts.selectMissTarget || SELECT_MISS_TARGET,
    firstWrite: selItems.length,   // ここから後半（書き）。前半を切り上げたらここへ飛ぶ
    items: items,
    preUnsure: mustWrite           // 聞かずに最初から「あやしい」に入れる字
  };
}

/* ★形式ごとの出題数を、本番の配点の比で決めて取り出す。
   fields[i] の問題が lists[i] に入っている。合計 limit 問を返す。

   ★どの形式も最低1問は出す。 比率の端数で 0 になると、
     **その形式がまるごと出なくなったことに、本番まで誰も気づかない。**
     （画数は配点5%なので、素直に割ると 0 になりうる）
   ※ limit が形式の数より小さいときは、**limit を1〜2問超えても各形式1問を残す。**
     形式をまるごと落とすほうが害が大きいため。いまの limit=20 では起きない。
   ※ その形式の問題が1問も作れないとき（lists[i] が空）は 0 問になる。
     これは正しい（作れないものは出せない）。 */
function weightedPick(fields, lists, limit, rnd) {
  var pts = fields.map(function (f) {
    var d = (typeof FIELDS !== "undefined") && FIELDS.filter(function (x) { return x.key === f; })[0];
    return (d && d.points) || 1;
  });
  var sum = pts.reduce(function (a, b) { return a + b; }, 0);
  var want = fields.map(function (f, i) {
    var n = Math.round(limit * pts[i] / sum);
    if (n < 1) n = 1;                              // ★0問にしない
    return Math.min(n, lists[i].length);
  });
  // 端数で limit を超えたら、配点の大きい形式から1問ずつ削る（最低1問は残す）
  var total = want.reduce(function (a, b) { return a + b; }, 0);
  var order = fields.map(function (_, i) { return i; })
                    .sort(function (a, b) { return pts[b] - pts[a]; });
  for (var g = 0; total > limit && g < 500; g++) {
    var cut = false;
    for (var j = 0; j < order.length && total > limit; j++) {
      var i2 = order[j];
      if (want[i2] > 1) { want[i2]--; total--; cut = true; }
    }
    if (!cut) break;                               // 全部1問。これ以上は削れない
  }
  var picked = lists.map(function (l, i) { return l.slice(0, want[i]); });
  return roundRobin(picked, rnd);                  // 同じ形式が続かないように混ぜる
}

/* 形式ごとのリストから順ぐりに1つずつ取る（部首→画数→音訓→部首→…） */
function roundRobin(lists, rnd) {
  var out = [], n = 0, i;
  lists.forEach(function (l) { if (l.length > n) n = l.length; });
  for (i = 0; i < n; i++) lists.forEach(function (l) { if (l[i]) out.push(l[i]); });
  return out;
}

/* ---------- 抜き取り検証（引き継ぎ.md 12-3・12-3b） ----------
   「書ける」という自己申告は当てにならない。**「書ける」と思って書けないのが漢字**なので、
   そのまま信じると、いちばん危ない字（思い込みで書けると思っている字）が一生練習されない。
   → 毎日の練習プリントに、「書ける」と申告した字を**黙って混ぜる**。
     ★どれが検証用かは紙に書かない（書くと、そこだけ身構えて実力が測れない）。 */

// 何字混ぜるか。「書ける」の当たり率で増減させる（12-3b ④）
function auditCount(kstats) {
  var hit = 0, miss = 0;
  Object.keys(kstats || {}).forEach(function (k) {
    var s = kstats[k].self; if (!s) return;
    hit += s.hit || 0; miss += s.miss || 0;
  });
  if (hit + miss === 0) return 3;              // まだ測っていない ＝ 初期値
  var rate = hit / (hit + miss);
  if (rate >= 0.9) return 2;                   // 見立てが当たる子には少なく
  if (rate >= 0.7) return 3;
  return 5;                                    // 外れが多いほど多く見る
}

// 実際に混ぜる字を選ぶ。
// limit は「あやしい」の字数（12-3b ④「上限は『あやしい』10字を超えないこと」）。
// ★「あやしい」が0字の日は混ぜない。検証字だけの紙になると、
//   どれが検証用か一目で分かってしまい、黙って混ぜる意味が無くなるため。
function pickAudit(kstats, weak, limit, rnd) {
  var want = Math.min(auditCount(kstats), limit || 0);
  if (want <= 0) return [];
  var cand = Object.keys(kstats || {}).filter(function (k) {
    var s = kstats[k].self;
    if (!s || !(s.say > 0)) return false;                  // 「書ける」と言っていない
    if (weak && weak[k] && weak[k].got) return false;      // もう卒業した字
    if ((s.miss || 0) > 0) return false;                   // 一度外した字は検証ではなく練習に回る（12-3b ③）
    return true;
  });
  // まだ一度も確かめていない字を先に見る。同じなら、言ったのが古い字から
  cand.sort(function (a, b) {
    var sa = kstats[a].self, sb = kstats[b].self;
    var d = ((sa.hit || 0) + (sa.miss || 0)) - ((sb.hit || 0) + (sb.miss || 0));
    if (d) return d;
    return (sa.lastSayAt || 0) - (sb.lastSayAt || 0);
  });
  return cand.slice(0, want);
}
