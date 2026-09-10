// 漢検7級 漢字マスタ 642字
// 生成: kanken-print-app 担当セッション 2026-09-09
//
// 【出典】項目ごとに異なります。後から追えるように明記します。
//  kyu/grade … 漢検協会「級別漢字表」2020年2月発表・新配当対応（公式資料/級別漢字表_2020新配当_...pdf）
//               ★10〜7級が学年別漢字配当表(2020年度全面実施)の1〜4年と【完全一致】を実測で確認済み
//  on/kun/ex … 文化庁「常用漢字表」平成22年内閣告示（公式資料/joyokanjihyo.pdf）の音訓欄・例欄
//               ★KANJIDICの読みは常用外を多く含むため使っていません
//  strokes/radNo … KANJIDIC2 (EDRDG)。字の属性なので2017年改定の影響を受けません
//               ★実物の過去問(2022年度第3回)の総画数5問・部首10字と照合し、全一致を確認済み
//  rad … 康熙部首番号からUnicode康熙部首ブロックへの定義上の変換（推測ではありません）
//  radName … 341/642字。★出典＝トレーニングノート7級 回20・21（本のp40〜43）の部首の単元に
//             印刷されている「部首の形（部首名）」。**巻末の一覧表は2冊とも存在しません。**
//             45個の形＝康熙部首番号44種を読み取り、うち40種をマスタへ適用（作業メモ.md「区切り②」）。
//             ⚠️ 読み取れたのに未適用が5種16字あります: 15にすい(冬冷)／28む(去参)／
//                31くにがまえ(四園図国回固)／83うじ(民氏)／169もんがまえ(間門開関)。
//             ⚠️ 残り301字は空のままです。**推測で埋めないでください（A-6）。**
//             空でも画面が壊れないことは smoke-test で固定してあります（「部首（）」を出さない）。
//             ※7級の審査基準は《部首》「部首を理解している。」だけで**部首名は問われません**
//               （公式資料\漢検公式サイト_採点基準と7級審査基準_2026-09-09.md）。
//               radName は答えではなく、画面に添えるラベルです。
//  radChecked … ★意味は1つだけ:「**その字の部首（radNo）**が、漢検の答え（トレーニングノート
//             別冊答え10ページ＝部首①②の答え）と照合ずみか」。true=137字 / false=505字。
//             ⚠️ **「部首名(radName)が照合ずみ」という意味ではありません。**
//                radName は上記のとおり部首番号ごとに当てているので、radChecked=false の字にも
//                名前が付いていることがあります（204字が該当）。その名前の正しさは、
//                **KANJIDIC2 由来の radNo が漢検と一致していることに依存**しています。
//                実測の食い違いは137字中2字（単・巣。修正ずみ）＝1.5%（確認ポイント C-10）。
//
// ⚠️ ユーザーから届いた 級別漢字表_outline_degree_national_list.pdf は【2020年改定前の古い版】です
//    （7級=200字/累計640字）。48字ずれるので使っていません。詳しくは作業メモ.md を参照。

const KANJI_MASTER = [
{
 "id": "kj_百",
 "k": "百",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 106,
 "rad": "⽩",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヒャク"
 ],
 "kun": [],
 "ex": [
  "百貨店，百科全書，数百"
 ]
},
{
 "id": "kj_町",
 "k": "町",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [
  "まち"
 ],
 "ex": [
  "町会，市町村",
  "町，町外れ"
 ]
},
{
 "id": "kj_先",
 "k": "先",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": false,
 "on": [
  "セン"
 ],
 "kun": [
  "さき"
 ],
 "ex": [
  "先方，先生，率先",
  "先，先立つ"
 ]
},
{
 "id": "kj_人",
 "k": "人",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジン",
  "ニン"
 ],
 "kun": [
  "ひと"
 ],
 "ex": [
  "人道，人員，成人",
  "人間，人情，人形",
  "人，人手，旅人"
 ]
},
{
 "id": "kj_耳",
 "k": "耳",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 128,
 "rad": "⽿",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [
  "みみ"
 ],
 "ex": [
  "耳鼻科，中耳炎",
  "耳，早耳"
 ]
},
{
 "id": "kj_五",
 "k": "五",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 7,
 "rad": "⼆",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゴ"
 ],
 "kun": [
  "いつ",
  "いつつ"
 ],
 "ex": [
  "五穀，五色，五目飯",
  "五日",
  "五つ"
 ]
},
{
 "id": "kj_学",
 "k": "学",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 39,
 "rad": "⼦",
 "radName": "こ",
 "radChecked": true,
 "on": [
  "ガク"
 ],
 "kun": [
  "まなぶ"
 ],
 "ex": [
  "学習，科学，大学",
  "学ぶ"
 ]
},
{
 "id": "kj_一",
 "k": "一",
 "kyu": "10級",
 "grade": 1,
 "strokes": 1,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "イチ",
  "イツ"
 ],
 "kun": [
  "ひと",
  "ひとつ"
 ],
 "ex": [
  "一度，一座，第一",
  "一般，同一，統一",
  "一息，一筋，一月目",
  "一つ"
 ]
},
{
 "id": "kj_文",
 "k": "文",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 67,
 "rad": "⽂",
 "radName": "",
 "radChecked": false,
 "on": [
  "ブン",
  "モン"
 ],
 "kun": [
  "ふみ"
 ],
 "ex": [
  "文学，文化，作文",
  "文字，経文，天文学",
  "恋文"
 ]
},
{
 "id": "kj_天",
 "k": "天",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": false,
 "on": [
  "テン"
 ],
 "kun": [
  "あめ",
  "あま"
 ],
 "ex": [
  "天地，天然，雨天",
  "",
  "天の川，天下り"
 ]
},
{
 "id": "kj_早",
 "k": "早",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ソウ",
  "サッ"
 ],
 "kun": [
  "はやい",
  "はやまる",
  "はやめる"
 ],
 "ex": [
  "早朝，早晩，早々に",
  "早速，早急",
  "早い，早口，素早い",
  "早まる",
  "早める"
 ]
},
{
 "id": "kj_水",
 "k": "水",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "スイ"
 ],
 "kun": [
  "みず"
 ],
 "ex": [
  "水分，水陸，海水",
  "水，水色，水浴び"
 ]
},
{
 "id": "kj_七",
 "k": "七",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "シチ",
  "シツ"
 ],
 "kun": [
  "なな",
  "ななつ",
  "なの",
  "しかる"
 ],
 "ex": [
  "七五三，七福神",
  "𠮟責",
  "七月目",
  "七つ",
  "七日",
  "𠮟る"
 ]
},
{
 "id": "kj_口",
 "k": "口",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ",
  "ク"
 ],
 "kun": [
  "くち"
 ],
 "ex": [
  "口述，人口，開口",
  "口調，口伝，異口同音",
  "口，口絵，出口"
 ]
},
{
 "id": "kj_気",
 "k": "気",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 84,
 "rad": "⽓",
 "radName": "",
 "radChecked": false,
 "on": [
  "キ",
  "ケ"
 ],
 "kun": [],
 "ex": [
  "気体，気候，元気",
  "気配，気色ばむ，火の気"
 ]
},
{
 "id": "kj_右",
 "k": "右",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ウ",
  "ユウ"
 ],
 "kun": [
  "みぎ"
 ],
 "ex": [
  "右岸，右折，右派",
  "左右，座右",
  "右，右手"
 ]
},
{
 "id": "kj_木",
 "k": "木",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ボク",
  "モク"
 ],
 "kun": [
  "き",
  "こ"
 ],
 "ex": [
  "木石，大木，土木",
  "木造，樹木，材木",
  "木，並木，拍子木",
  "木立，木陰"
 ]
},
{
 "id": "kj_田",
 "k": "田",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "デン"
 ],
 "kun": [
  "た"
 ],
 "ex": [
  "田地，水田，油田",
  "田，田植え"
 ]
},
{
 "id": "kj_草",
 "k": "草",
 "kyu": "10級",
 "grade": 1,
 "strokes": 9,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ソウ"
 ],
 "kun": [
  "くさ"
 ],
 "ex": [
  "草案，雑草，牧草",
  "草，草花，語り草"
 ]
},
{
 "id": "kj_正",
 "k": "正",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 77,
 "rad": "⽌",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "ただしい",
  "ただす",
  "まさ"
 ],
 "ex": [
  "正義，正誤，訂正",
  "正直，正面，正月",
  "正しい，正しさ",
  "正す",
  "正に，正夢"
 ]
},
{
 "id": "kj_車",
 "k": "車",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 159,
 "rad": "⾞",
 "radName": "くるまへん",
 "radChecked": false,
 "on": [
  "シャ"
 ],
 "kun": [
  "くるま"
 ],
 "ex": [
  "車輪，車庫，電車",
  "車，歯車"
 ]
},
{
 "id": "kj_校",
 "k": "校",
 "kyu": "10級",
 "grade": 1,
 "strokes": 10,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [],
 "ex": [
  "校閲，将校，学校"
 ]
},
{
 "id": "kj_九",
 "k": "九",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 5,
 "rad": "⼄",
 "radName": "",
 "radChecked": false,
 "on": [
  "キュウ",
  "ク"
 ],
 "kun": [
  "ここの",
  "ここのつ"
 ],
 "ex": [
  "九百，三拝九拝",
  "九分九厘，九月",
  "九日，九重",
  "九つ"
 ]
},
{
 "id": "kj_雨",
 "k": "雨",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 173,
 "rad": "⾬",
 "radName": "",
 "radChecked": false,
 "on": [
  "ウ"
 ],
 "kun": [
  "あめ",
  "あま"
 ],
 "ex": [
  "雨量，降雨，梅雨",
  "雨，大雨",
  "雨雲，雨戸，雨具"
 ]
},
{
 "id": "kj_本",
 "k": "本",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ホン"
 ],
 "kun": [
  "もと"
 ],
 "ex": [
  "本質，本来，資本",
  "本，旗本"
 ]
},
{
 "id": "kj_土",
 "k": "土",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": false,
 "on": [
  "ド",
  "ト"
 ],
 "kun": [
  "つち"
 ],
 "ex": [
  "土木，国土，粘土",
  "土地",
  "土，赤土"
 ]
},
{
 "id": "kj_足",
 "k": "足",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 157,
 "rad": "⾜",
 "radName": "",
 "radChecked": false,
 "on": [
  "ソク"
 ],
 "kun": [
  "あし",
  "たりる",
  "たる",
  "たす"
 ],
 "ex": [
  "足跡，遠足，補足",
  "足，足音，素足",
  "足りる",
  "舌足らず",
  "足す"
 ]
},
{
 "id": "kj_生",
 "k": "生",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 100,
 "rad": "⽣",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "いきる",
  "いかす",
  "いける",
  "うまれる",
  "うむ",
  "おう",
  "はえる",
  "はやす",
  "き",
  "なま"
 ],
 "ex": [
  "生活，発生，先生",
  "生滅，一生，誕生",
  "生きる，長生き",
  "生かす",
  "生ける，生け捕り",
  "生まれる，生まれ",
  "生む",
  "生い立ち，生い茂る",
  "生える，芽生える",
  "生やす",
  "生糸，生地，生一本",
  "生の野菜，生水，生々しい"
 ]
},
{
 "id": "kj_手",
 "k": "手",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "シュ"
 ],
 "kun": [
  "て",
  "た"
 ],
 "ex": [
  "手腕，挙手，選手",
  "手，手柄，素手",
  "手綱，手繰る"
 ]
},
{
 "id": "kj_左",
 "k": "左",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 48,
 "rad": "⼯",
 "radName": "",
 "radChecked": false,
 "on": [
  "サ"
 ],
 "kun": [
  "ひだり"
 ],
 "ex": [
  "左右，左翼，左遷",
  "左，左利き"
 ]
},
{
 "id": "kj_休",
 "k": "休",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "やすむ",
  "やすまる",
  "やすめる"
 ],
 "ex": [
  "休止，休憩，定休",
  "休む，休み",
  "休まる",
  "休める，気休め"
 ]
},
{
 "id": "kj_円",
 "k": "円",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 13,
 "rad": "⼌",
 "radName": "",
 "radChecked": false,
 "on": [
  "エン"
 ],
 "kun": [
  "まるい"
 ],
 "ex": [
  "円卓，円熟，一円",
  "円い，円さ，円み"
 ]
},
{
 "id": "kj_名",
 "k": "名",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "メイ",
  "ミョウ"
 ],
 "kun": [
  "な"
 ],
 "ex": [
  "名誉，氏名，有名",
  "名字，本名，大名",
  "名，名前"
 ]
},
{
 "id": "kj_二",
 "k": "二",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 7,
 "rad": "⼆",
 "radName": "",
 "radChecked": false,
 "on": [
  "ニ"
 ],
 "kun": [
  "ふた",
  "ふたつ"
 ],
 "ex": [
  "二番目，二分，十二月",
  "二重まぶた",
  "二つ"
 ]
},
{
 "id": "kj_村",
 "k": "村",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ソン"
 ],
 "kun": [
  "むら"
 ],
 "ex": [
  "村長，村落，農村",
  "村，村里，村芝居"
 ]
},
{
 "id": "kj_青",
 "k": "青",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 174,
 "rad": "⾭",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "あお",
  "あおい"
 ],
 "ex": [
  "青天，青銅，青年",
  "緑青，紺青，群青",
  "青，青ざめる",
  "青い，青さ"
 ]
},
{
 "id": "kj_十",
 "k": "十",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": false,
 "on": [
  "ジュウ",
  "ジッ"
 ],
 "kun": [
  "とお",
  "と"
 ],
 "ex": [
  "十字架，十文字",
  "十回",
  "十，十日",
  "十色，十重"
 ]
},
{
 "id": "kj_三",
 "k": "三",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "サン"
 ],
 "kun": [
  "み",
  "みつ",
  "みっつ"
 ],
 "ex": [
  "三角，三流，再三",
  "三日月，三日（みっか）",
  "三つ指",
  "三つ"
 ]
},
{
 "id": "kj_玉",
 "k": "玉",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 96,
 "rad": "⽟",
 "radName": "",
 "radChecked": false,
 "on": [
  "ギョク"
 ],
 "kun": [
  "たま"
 ],
 "ex": [
  "玉座，玉石，宝玉",
  "玉，目玉"
 ]
},
{
 "id": "kj_王",
 "k": "王",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 96,
 "rad": "⽟",
 "radName": "",
 "radChecked": false,
 "on": [
  "オウ"
 ],
 "kun": [],
 "ex": [
  "王子，帝王"
 ]
},
{
 "id": "kj_目",
 "k": "目",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "モク",
  "ボク"
 ],
 "kun": [
  "め",
  "ま"
 ],
 "ex": [
  "目的，目前，項目",
  "面目",
  "目，目立つ，結び目",
  "目の当たり，目深"
 ]
},
{
 "id": "kj_日",
 "k": "日",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ニチ",
  "ジツ"
 ],
 "kun": [
  "ひ",
  "か"
 ],
 "ex": [
  "日時，日光，毎日",
  "連日，平日，休日",
  "日，日帰り，月曜日",
  "三日，十日"
 ]
},
{
 "id": "kj_大",
 "k": "大",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": false,
 "on": [
  "ダイ",
  "タイ"
 ],
 "kun": [
  "おお",
  "おおきい",
  "おおいに"
 ],
 "ex": [
  "大小，大胆，拡大",
  "大衆，大した，大して",
  "大型，大通り，大水",
  "大きい，大きさ，大きな",
  "大いに"
 ]
},
{
 "id": "kj_夕",
 "k": "夕",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 36,
 "rad": "⼣",
 "radName": "",
 "radChecked": false,
 "on": [
  "セキ"
 ],
 "kun": [
  "ゆう"
 ],
 "ex": [
  "今夕，一朝一夕",
  "夕方，夕日，夕べ"
 ]
},
{
 "id": "kj_出",
 "k": "出",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 17,
 "rad": "⼐",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュツ",
  "スイ"
 ],
 "kun": [
  "でる",
  "だす"
 ],
 "ex": [
  "出入，出現，提出",
  "出納",
  "出る，出窓，遠出",
  "出す"
 ]
},
{
 "id": "kj_山",
 "k": "山",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": false,
 "on": [
  "サン"
 ],
 "kun": [
  "やま"
 ],
 "ex": [
  "山脈，高山，登山",
  ""
 ]
},
{
 "id": "kj_金",
 "k": "金",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 167,
 "rad": "⾦",
 "radName": "かねへん",
 "radChecked": false,
 "on": [
  "キン",
  "コン"
 ],
 "kun": [
  "かね",
  "かな"
 ],
 "ex": [
  "金属，金銭，純金",
  "金色，金剛力，黄金",
  "金，金持ち，針金",
  "金物，金具，金縛り"
 ]
},
{
 "id": "kj_音",
 "k": "音",
 "kyu": "10級",
 "grade": 1,
 "strokes": 9,
 "radNo": 180,
 "rad": "⾳",
 "radName": "",
 "radChecked": false,
 "on": [
  "オン",
  "イン"
 ],
 "kun": [
  "おと",
  "ね"
 ],
 "ex": [
  "音楽，発音，騒音",
  "福音，母音",
  "音，物音",
  "音，音色"
 ]
},
{
 "id": "kj_立",
 "k": "立",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 117,
 "rad": "⽴",
 "radName": "",
 "radChecked": false,
 "on": [
  "リツ",
  "リュウ"
 ],
 "kun": [
  "たつ",
  "たてる"
 ],
 "ex": [
  "立案，起立，独立",
  "建立",
  "立つ，立場，夕立",
  "立てる，立て札"
 ]
},
{
 "id": "kj_入",
 "k": "入",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 11,
 "rad": "⼊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ニュウ"
 ],
 "kun": [
  "いる",
  "いれる",
  "はいる"
 ],
 "ex": [
  "入学，侵入，収入",
  "寝入る，大入り，気に入る",
  "入れる，入れ物",
  "入る"
 ]
},
{
 "id": "kj_男",
 "k": "男",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "ダン",
  "ナン"
 ],
 "kun": [
  "おとこ"
 ],
 "ex": [
  "男子，男女，男性",
  "長男，美男，善男善女",
  "男，男らしい"
 ]
},
{
 "id": "kj_石",
 "k": "石",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 112,
 "rad": "⽯",
 "radName": "",
 "radChecked": false,
 "on": [
  "セキ",
  "シャク",
  "コク"
 ],
 "kun": [
  "いし"
 ],
 "ex": [
  "石材，岩石，宝石",
  "磁石",
  "石高，千石船",
  "石，小石"
 ]
},
{
 "id": "kj_女",
 "k": "女",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": false,
 "on": [
  "ジョ",
  "ニョ",
  "ニョウ"
 ],
 "kun": [
  "おんな",
  "め"
 ],
 "ex": [
  "女子，女流，少女",
  "女人，天女，善男善女",
  "女房",
  "女，女心，女らしい",
  "女神，女々しい"
 ]
},
{
 "id": "kj_子",
 "k": "子",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 39,
 "rad": "⼦",
 "radName": "こ",
 "radChecked": false,
 "on": [
  "シ",
  "ス"
 ],
 "kun": [
  "こ"
 ],
 "ex": [
  "子孫，女子，帽子",
  "金子，扇子，様子",
  "子，親子，年子"
 ]
},
{
 "id": "kj_空",
 "k": "空",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 116,
 "rad": "⽳",
 "radName": "",
 "radChecked": false,
 "on": [
  "クウ"
 ],
 "kun": [
  "そら",
  "あく",
  "あける",
  "から"
 ],
 "ex": [
  "空想，空港，上空",
  "空，空色，青空",
  "空く，空き巣",
  "空ける",
  "空，空手，空手形"
 ]
},
{
 "id": "kj_下",
 "k": "下",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "カ",
  "ゲ"
 ],
 "kun": [
  "した",
  "しも",
  "もと",
  "さげる",
  "さがる",
  "くだる",
  "くだす",
  "くださる",
  "おろす",
  "おりる"
 ],
 "ex": [
  "下流，下降，落下",
  "下水，下車，上下",
  "下，下見",
  "下，川下",
  "下，足下",
  "下げる",
  "下がる",
  "下る，下り",
  "下す",
  "下さる",
  "下ろす，書き下ろす",
  "下りる"
 ]
},
{
 "id": "kj_力",
 "k": "力",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "リョク",
  "リキ"
 ],
 "kun": [
  "ちから"
 ],
 "ex": [
  "権力，努力，能力",
  "力量，力作，馬力",
  "力，力仕事，底力"
 ]
},
{
 "id": "kj_年",
 "k": "年",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 51,
 "rad": "⼲",
 "radName": "",
 "radChecked": false,
 "on": [
  "ネン"
 ],
 "kun": [
  "とし"
 ],
 "ex": [
  "年代，少年，豊年",
  "年，年子，年寄り"
 ]
},
{
 "id": "kj_竹",
 "k": "竹",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "チク"
 ],
 "kun": [
  "たけ"
 ],
 "ex": [
  "竹林，竹馬の友，爆竹",
  "竹，竹やぶ，さお竹"
 ]
},
{
 "id": "kj_赤",
 "k": "赤",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 155,
 "rad": "⾚",
 "radName": "",
 "radChecked": false,
 "on": [
  "セキ",
  "シャク"
 ],
 "kun": [
  "あか",
  "あかい",
  "あからむ",
  "あからめる"
 ],
 "ex": [
  "赤道，赤貧，発赤",
  "赤銅",
  "赤，赤字，赤ん坊",
  "赤い",
  "赤らむ",
  "赤らめる"
 ]
},
{
 "id": "kj_小",
 "k": "小",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 42,
 "rad": "⼩",
 "radName": "つかんむり",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "ちいさい",
  "こ",
  "お"
 ],
 "ex": [
  "小心，大小，縮小",
  "小さい，小さな",
  "小型，小鳥，小切手",
  "小川，小暗い"
 ]
},
{
 "id": "kj_四",
 "k": "四",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "よ",
  "よつ",
  "よっつ",
  "よん"
 ],
 "ex": [
  "四角，四季，四十七士",
  "四人，四日（よっか），",
  "四つ角",
  "四つ",
  "四回，四階"
 ]
},
{
 "id": "kj_月",
 "k": "月",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゲツ",
  "ガツ"
 ],
 "kun": [
  "つき"
 ],
 "ex": [
  "月曜，明月，歳月",
  "正月，九月",
  "月，月見，三日月"
 ]
},
{
 "id": "kj_火",
 "k": "火",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "カ"
 ],
 "kun": [
  "ひ",
  "ほ"
 ],
 "ex": [
  "火災，灯火，発火",
  "火，火花，炭火",
  "火影"
 ]
},
{
 "id": "kj_林",
 "k": "林",
 "kyu": "10級",
 "grade": 1,
 "strokes": 8,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "リン"
 ],
 "kun": [
  "はやし"
 ],
 "ex": [
  "林業，林立，山林",
  "林，松林"
 ]
},
{
 "id": "kj_白",
 "k": "白",
 "kyu": "10級",
 "grade": 1,
 "strokes": 5,
 "radNo": 106,
 "rad": "⽩",
 "radName": "",
 "radChecked": false,
 "on": [
  "ハク",
  "ビャク"
 ],
 "kun": [
  "しろ",
  "しら",
  "しろい"
 ],
 "ex": [
  "白髪，紅白，明白",
  "黒白",
  "白，白黒，真っ白",
  "白壁，白む，白ける",
  "白い"
 ]
},
{
 "id": "kj_中",
 "k": "中",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 2,
 "rad": "⼁",
 "radName": "",
 "radChecked": false,
 "on": [
  "チュウ",
  "ジュウ"
 ],
 "kun": [
  "なか"
 ],
 "ex": [
  "中央，中毒，胸中",
  "○○中",
  "中，中庭，真ん中"
 ]
},
{
 "id": "kj_千",
 "k": "千",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": false,
 "on": [
  "セン"
 ],
 "kun": [
  "ち"
 ],
 "ex": [
  "千円，千人力，千差万別",
  "千草，千々に"
 ]
},
{
 "id": "kj_上",
 "k": "上",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジョウ",
  "ショウ"
 ],
 "kun": [
  "うえ",
  "うわ",
  "かみ",
  "あげる",
  "あがる",
  "のぼる",
  "のぼせる",
  "のぼす"
 ],
 "ex": [
  "上旬，上昇，地上",
  "上人，身上を潰す",
  "上，身の上",
  "上着，上積み",
  "上，川上",
  "上げる，売り上げ",
  "上がる，上がり",
  "上る，上り",
  "上せる",
  "上す"
 ]
},
{
 "id": "kj_糸",
 "k": "糸",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "いと"
 ],
 "ex": [
  "綿糸，蚕糸，製糸",
  "糸，糸目，毛糸"
 ]
},
{
 "id": "kj_犬",
 "k": "犬",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 94,
 "rad": "⽝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン"
 ],
 "kun": [
  "いぬ"
 ],
 "ex": [
  "犬歯，愛犬，野犬",
  ""
 ]
},
{
 "id": "kj_花",
 "k": "花",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "カ"
 ],
 "kun": [
  "はな"
 ],
 "ex": [
  "花弁，花壇，落花",
  "花，花火，草花"
 ]
},
{
 "id": "kj_六",
 "k": "六",
 "kyu": "10級",
 "grade": 1,
 "strokes": 4,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": false,
 "on": [
  "ロク"
 ],
 "kun": [
  "む",
  "むつ",
  "むっつ",
  "むい"
 ],
 "ex": [
  "六月，六法，丈六",
  "六月目",
  "六つ切り",
  "六つ",
  "六日"
 ]
},
{
 "id": "kj_八",
 "k": "八",
 "kyu": "10級",
 "grade": 1,
 "strokes": 2,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": false,
 "on": [
  "ハチ"
 ],
 "kun": [
  "や",
  "やつ",
  "やっつ",
  "よう"
 ],
 "ex": [
  "八月，八方",
  "八重桜",
  "八つ当たり",
  "八つ",
  "八日"
 ]
},
{
 "id": "kj_虫",
 "k": "虫",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 142,
 "rad": "⾍",
 "radName": "",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "むし"
 ],
 "ex": [
  "虫類，幼虫，害虫",
  "虫，毛虫"
 ]
},
{
 "id": "kj_川",
 "k": "川",
 "kyu": "10級",
 "grade": 1,
 "strokes": 3,
 "radNo": 47,
 "rad": "⼮",
 "radName": "",
 "radChecked": false,
 "on": [
  "セン"
 ],
 "kun": [
  "かわ"
 ],
 "ex": [
  "川柳，河川",
  "川，川岸，小川"
 ]
},
{
 "id": "kj_森",
 "k": "森",
 "kyu": "10級",
 "grade": 1,
 "strokes": 12,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "もり"
 ],
 "ex": [
  "森林，森閑，森厳",
  ""
 ]
},
{
 "id": "kj_字",
 "k": "字",
 "kyu": "10級",
 "grade": 1,
 "strokes": 6,
 "radNo": 39,
 "rad": "⼦",
 "radName": "こ",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [
  "あざ"
 ],
 "ex": [
  "字画，文字，活字",
  "字，大字"
 ]
},
{
 "id": "kj_見",
 "k": "見",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 147,
 "rad": "⾒",
 "radName": "みる",
 "radChecked": false,
 "on": [
  "ケン"
 ],
 "kun": [
  "みる",
  "みえる",
  "みせる"
 ],
 "ex": [
  "見学，見地，意見",
  "見る，下見",
  "見える",
  "見せる，顔見せ"
 ]
},
{
 "id": "kj_貝",
 "k": "貝",
 "kyu": "10級",
 "grade": 1,
 "strokes": 7,
 "radNo": 154,
 "rad": "⾙",
 "radName": "かい・こがい",
 "radChecked": false,
 "on": [],
 "kun": [
  "かい"
 ],
 "ex": [
  "貝，貝細工，ほら貝"
 ]
},
{
 "id": "kj_毎",
 "k": "毎",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 80,
 "rad": "⽏",
 "radName": "",
 "radChecked": false,
 "on": [
  "マイ"
 ],
 "kun": [],
 "ex": [
  "毎度，毎日，毎々"
 ]
},
{
 "id": "kj_肉",
 "k": "肉",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 130,
 "rad": "⾁",
 "radName": "",
 "radChecked": false,
 "on": [
  "ニク"
 ],
 "kun": [],
 "ex": [
  "肉類，肉薄，筋肉"
 ]
},
{
 "id": "kj_通",
 "k": "通",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ツウ",
  "ツ"
 ],
 "kun": [
  "とおる",
  "とおす",
  "かよう"
 ],
 "ex": [
  "通行，通読，普通",
  "通夜",
  "通る，通り",
  "通す，通し",
  "通う，通い"
 ]
},
{
 "id": "kj_前",
 "k": "前",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 18,
 "rad": "⼑",
 "radName": "りっとう",
 "radChecked": true,
 "on": [
  "ゼン"
 ],
 "kun": [
  "まえ"
 ],
 "ex": [
  "前後，以前，空前",
  "前，前向き，名前"
 ]
},
{
 "id": "kj_場",
 "k": "場",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": false,
 "on": [
  "ジョウ",
  "ジョウ"
 ],
 "kun": [
  "ば"
 ],
 "ex": [
  "場内，会場，入場",
  "",
  "場，場所，広場"
 ]
},
{
 "id": "kj_矢",
 "k": "矢",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 111,
 "rad": "⽮",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "や"
 ],
 "ex": [
  "一矢を報いる",
  "矢，矢印，矢面"
 ]
},
{
 "id": "kj_光",
 "k": "光",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "ひかる",
  "ひかり"
 ],
 "ex": [
  "光線，栄光，観光",
  "光る，光り輝く",
  "光，稲光"
 ]
},
{
 "id": "kj_近",
 "k": "近",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "キン"
 ],
 "kun": [
  "ちかい"
 ],
 "ex": [
  "近所，近代，接近",
  "近い，近づく，近道"
 ]
},
{
 "id": "kj_角",
 "k": "角",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 148,
 "rad": "⾓",
 "radName": "",
 "radChecked": false,
 "on": [
  "カク"
 ],
 "kun": [
  "かど",
  "つの"
 ],
 "ex": [
  "角度，三角，頭角",
  "角，街角，四つ角",
  "角，角笛"
 ]
},
{
 "id": "kj_引",
 "k": "引",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 57,
 "rad": "⼸",
 "radName": "",
 "radChecked": false,
 "on": [
  "イン"
 ],
 "kun": [
  "ひく",
  "ひける"
 ],
 "ex": [
  "引力，引退，索引",
  "引く，字引",
  "引ける"
 ]
},
{
 "id": "kj_妹",
 "k": "妹",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": false,
 "on": [
  "マイ"
 ],
 "kun": [
  "いもうと"
 ],
 "ex": [
  "姉妹，義妹，令妹",
  ""
 ]
},
{
 "id": "kj_馬",
 "k": "馬",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 187,
 "rad": "⾺",
 "radName": "",
 "radChecked": false,
 "on": [
  "バ"
 ],
 "kun": [
  "うま",
  "ま"
 ],
 "ex": [
  "馬車，競馬，乗馬",
  "馬，馬小屋",
  "馬子，絵馬"
 ]
},
{
 "id": "kj_弟",
 "k": "弟",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 57,
 "rad": "⼸",
 "radName": "",
 "radChecked": false,
 "on": [
  "テイ",
  "ダイ",
  "デ"
 ],
 "kun": [
  "おとうと"
 ],
 "ex": [
  "弟妹，義弟，子弟",
  "兄弟",
  "弟子",
  ""
 ]
},
{
 "id": "kj_組",
 "k": "組",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "ソ"
 ],
 "kun": [
  "くむ",
  "くみ"
 ],
 "ex": [
  "組織，組成，改組",
  "組む，組み込む",
  "組，組長，赤組"
 ]
},
{
 "id": "kj_色",
 "k": "色",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 139,
 "rad": "⾊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショク",
  "シキ"
 ],
 "kun": [
  "いろ"
 ],
 "ex": [
  "原色，特色，物色",
  "色彩，色調，色欲",
  "色，桜色，色づく"
 ]
},
{
 "id": "kj_姉",
 "k": "姉",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "あね"
 ],
 "ex": [
  "姉妹，諸姉",
  "姉，姉上"
 ]
},
{
 "id": "kj_考",
 "k": "考",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 125,
 "rad": "⽼",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "かんがえる"
 ],
 "ex": [
  "考慮，思考，参考",
  "考える，考え"
 ]
},
{
 "id": "kj_兄",
 "k": "兄",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": false,
 "on": [
  "ケイ",
  "キョウ"
 ],
 "kun": [
  "あに"
 ],
 "ex": [
  "兄事，父兄，義兄",
  "兄弟",
  ""
 ]
},
{
 "id": "kj_楽",
 "k": "楽",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ガク",
  "ラク"
 ],
 "kun": [
  "たのしい",
  "たのしむ"
 ],
 "ex": [
  "楽隊，楽器，音楽",
  "楽園，快楽，娯楽",
  "楽しい，楽しさ，楽しげだ",
  "楽しむ"
 ]
},
{
 "id": "kj_羽",
 "k": "羽",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 124,
 "rad": "⽻",
 "radName": "",
 "radChecked": false,
 "on": [
  "ウ"
 ],
 "kun": [
  "は",
  "はね"
 ],
 "ex": [
  "羽毛，羽化，羽翼",
  "白羽の矢，一羽（わ），",
  "羽，羽飾り"
 ]
},
{
 "id": "kj_万",
 "k": "万",
 "kyu": "9級",
 "grade": 2,
 "strokes": 3,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "マン",
  "バン"
 ],
 "kun": [],
 "ex": [
  "万一，万年筆，巨万",
  "万国，万端，万全"
 ]
},
{
 "id": "kj_売",
 "k": "売",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 33,
 "rad": "⼠",
 "radName": "",
 "radChecked": false,
 "on": [
  "バイ"
 ],
 "kun": [
  "うる",
  "うれる"
 ],
 "ex": [
  "売買，売品，商売",
  "売る，売り出す",
  "売れる，売れ行き"
 ]
},
{
 "id": "kj_店",
 "k": "店",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": false,
 "on": [
  "テン"
 ],
 "kun": [
  "みせ"
 ],
 "ex": [
  "店舗，開店，本店",
  "店，夜店"
 ]
},
{
 "id": "kj_走",
 "k": "走",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 156,
 "rad": "⾛",
 "radName": "",
 "radChecked": false,
 "on": [
  "ソウ"
 ],
 "kun": [
  "はしる"
 ],
 "ex": [
  "走行，競走，滑走",
  "走る，先走る"
 ]
},
{
 "id": "kj_食",
 "k": "食",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 184,
 "rad": "⾷",
 "radName": "しょくへん",
 "radChecked": false,
 "on": [
  "ショク",
  "ジキ"
 ],
 "kun": [
  "くう",
  "くらう",
  "たべる"
 ],
 "ex": [
  "食事，食料，会食",
  "断食",
  "食う，食い物",
  "食らう",
  "食べる，食べ物"
 ]
},
{
 "id": "kj_思",
 "k": "思",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "おもう"
 ],
 "ex": [
  "思想，意思，相思",
  "思う，思い，思わしい"
 ]
},
{
 "id": "kj_行",
 "k": "行",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 144,
 "rad": "⾏",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ",
  "ギョウ",
  "アン"
 ],
 "kun": [
  "いく",
  "ゆく",
  "おこなう"
 ],
 "ex": [
  "行進，行為，旅行",
  "行列，行政，修行",
  "行脚，行火",
  "行く",
  "行く，行く末",
  "行う，行い"
 ]
},
{
 "id": "kj_形",
 "k": "形",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 59,
 "rad": "⼺",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケイ",
  "ギョウ"
 ],
 "kun": [
  "かた",
  "かたち"
 ],
 "ex": [
  "形態，形成，図形",
  "形相，人形",
  "形，形見，手形",
  ""
 ]
},
{
 "id": "kj_活",
 "k": "活",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "カツ"
 ],
 "kun": [],
 "ex": [
  "活動，活力，生活"
 ]
},
{
 "id": "kj_雲",
 "k": "雲",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 173,
 "rad": "⾬",
 "radName": "",
 "radChecked": false,
 "on": [
  "ウン"
 ],
 "kun": [
  "くも"
 ],
 "ex": [
  "雲海，風雲，積乱雲",
  "雲，雲隠れ"
 ]
},
{
 "id": "kj_明",
 "k": "明",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "メイ",
  "ミョウ"
 ],
 "kun": [
  "あかり",
  "あかるい",
  "あかるむ",
  "あからむ",
  "あきらか",
  "あける",
  "あく",
  "あくる",
  "あかす"
 ],
 "ex": [
  "明暗，説明，鮮明",
  "明日，光明，灯明",
  "明かり，薄明かり",
  "明るい，明るさ",
  "明るむ",
  "明らむ",
  "明らかだ",
  "明ける，夜明け",
  "明く",
  "明くる日，明くる朝",
  "明かす，種明かし"
 ]
},
{
 "id": "kj_買",
 "k": "買",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 154,
 "rad": "⾙",
 "radName": "かい・こがい",
 "radChecked": false,
 "on": [
  "バイ"
 ],
 "kun": [
  "かう"
 ],
 "ex": [
  "買収，売買，購買",
  "買う，買い物"
 ]
},
{
 "id": "kj_点",
 "k": "点",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "テン"
 ],
 "kun": [],
 "ex": [
  "点線，点火，採点"
 ]
},
{
 "id": "kj_多",
 "k": "多",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 36,
 "rad": "⼣",
 "radName": "",
 "radChecked": false,
 "on": [
  "タ"
 ],
 "kun": [
  "おおい"
 ],
 "ex": [
  "多少，多数，雑多",
  "多い"
 ]
},
{
 "id": "kj_心",
 "k": "心",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "こころ"
 ],
 "ex": [
  "心身，感心，中心",
  "心，心得る，親心"
 ]
},
{
 "id": "kj_紙",
 "k": "紙",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "かみ"
 ],
 "ex": [
  "紙面，用紙，新聞紙",
  "紙，紙くず，厚紙"
 ]
},
{
 "id": "kj_高",
 "k": "高",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 189,
 "rad": "⾼",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "たかい",
  "たか",
  "たかまる",
  "たかめる"
 ],
 "ex": [
  "高低，高級，最高",
  "高い，高台，高ぶる",
  "高，売上高",
  "高まる，高まり",
  "高める"
 ]
},
{
 "id": "kj_計",
 "k": "計",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ケイ"
 ],
 "kun": [
  "はかる",
  "はからう"
 ],
 "ex": [
  "計算，計画，寒暖計",
  "計る",
  "計らう，計らい"
 ]
},
{
 "id": "kj_間",
 "k": "間",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 169,
 "rad": "⾨",
 "radName": "",
 "radChecked": false,
 "on": [
  "カン",
  "ケン"
 ],
 "kun": [
  "あいだ",
  "ま"
 ],
 "ex": [
  "間隔，中間，時間",
  "世間，人間",
  "間，間柄",
  "間，間違う，客間"
 ]
},
{
 "id": "kj_園",
 "k": "園",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "エン"
 ],
 "kun": [
  "その"
 ],
 "ex": [
  "園芸，公園，楽園",
  "学びの園，花園"
 ]
},
{
 "id": "kj_鳴",
 "k": "鳴",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 196,
 "rad": "⿃",
 "radName": "",
 "radChecked": false,
 "on": [
  "メイ"
 ],
 "kun": [
  "なく",
  "なる",
  "ならす"
 ],
 "ex": [
  "鳴動，悲鳴，雷鳴",
  "鳴く，鳴き声",
  "鳴る，耳鳴り",
  "鳴らす"
 ]
},
{
 "id": "kj_麦",
 "k": "麦",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 199,
 "rad": "⿆",
 "radName": "",
 "radChecked": false,
 "on": [
  "バク"
 ],
 "kun": [
  "むぎ"
 ],
 "ex": [
  "麦芽，麦秋，精麦",
  "麦，麦粉，小麦"
 ]
},
{
 "id": "kj_電",
 "k": "電",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 173,
 "rad": "⾬",
 "radName": "",
 "radChecked": false,
 "on": [
  "デン"
 ],
 "kun": [],
 "ex": [
  "電気，電報，発電"
 ]
},
{
 "id": "kj_太",
 "k": "太",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": false,
 "on": [
  "タイ",
  "タ"
 ],
 "kun": [
  "ふとい",
  "ふとる"
 ],
 "ex": [
  "太陽，太鼓，皇太子",
  "丸太",
  "太い",
  "太る"
 ]
},
{
 "id": "kj_新",
 "k": "新",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 69,
 "rad": "⽄",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "あたらしい",
  "あらた",
  "にい"
 ],
 "ex": [
  "新旧，新聞，革新",
  "新しい，新しさ，新しがる",
  "新ただ",
  "新妻，新盆"
 ]
},
{
 "id": "kj_寺",
 "k": "寺",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 41,
 "rad": "⼨",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [
  "てら"
 ],
 "ex": [
  "寺院，社寺，末寺",
  "寺，尼寺"
 ]
},
{
 "id": "kj_黄",
 "k": "黄",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 201,
 "rad": "⿈",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ",
  "オウ"
 ],
 "kun": [
  "き",
  "こ"
 ],
 "ex": [
  "黄葉",
  "黄金，卵黄",
  "黄，黄色い，黄ばむ",
  "黄金"
 ]
},
{
 "id": "kj_元",
 "k": "元",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": true,
 "on": [
  "ゲン",
  "ガン"
 ],
 "kun": [
  "もと"
 ],
 "ex": [
  "元素，元気，多元",
  "元祖，元日，元来",
  "元，元帳，家元"
 ]
},
{
 "id": "kj_丸",
 "k": "丸",
 "kyu": "9級",
 "grade": 2,
 "strokes": 3,
 "radNo": 3,
 "rad": "⼂",
 "radName": "",
 "radChecked": false,
 "on": [
  "ガン"
 ],
 "kun": [
  "まる",
  "まるい",
  "まるめる"
 ],
 "ex": [
  "丸薬，弾丸，砲丸",
  "丸，丸太，丸洗い",
  "丸い，丸み，丸さ",
  "丸める"
 ]
},
{
 "id": "kj_遠",
 "k": "遠",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "エン",
  "オン"
 ],
 "kun": [
  "とおい"
 ],
 "ex": [
  "遠近，永遠，敬遠",
  "久遠",
  "遠い，遠出，遠ざかる"
 ]
},
{
 "id": "kj_毛",
 "k": "毛",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 82,
 "rad": "⽑",
 "radName": "",
 "radChecked": false,
 "on": [
  "モウ"
 ],
 "kun": [
  "け"
 ],
 "ex": [
  "毛髪，毛細管，不毛",
  "毛，毛糸，抜け毛"
 ]
},
{
 "id": "kj_半",
 "k": "半",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": false,
 "on": [
  "ハン"
 ],
 "kun": [
  "なかば"
 ],
 "ex": [
  "半分，半面，大半",
  "半ば"
 ]
},
{
 "id": "kj_刀",
 "k": "刀",
 "kyu": "9級",
 "grade": 2,
 "strokes": 2,
 "radNo": 18,
 "rad": "⼑",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "かたな"
 ],
 "ex": [
  "刀剣，短刀，名刀",
  ""
 ]
},
{
 "id": "kj_体",
 "k": "体",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "タイ",
  "テイ"
 ],
 "kun": [
  "からだ"
 ],
 "ex": [
  "体格，人体，主体",
  "体裁，風体",
  "体，体つき"
 ]
},
{
 "id": "kj_親",
 "k": "親",
 "kyu": "9級",
 "grade": 2,
 "strokes": 16,
 "radNo": 147,
 "rad": "⾒",
 "radName": "みる",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "おや",
  "したしい",
  "したしむ"
 ],
 "ex": [
  "親族，親友，肉親",
  "親，親子，父親",
  "親しい，親しさ",
  "親しむ"
 ]
},
{
 "id": "kj_自",
 "k": "自",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 132,
 "rad": "⾃",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ",
  "シ"
 ],
 "kun": [
  "みずから"
 ],
 "ex": [
  "自分，自由，各自",
  "自然",
  "自ら"
 ]
},
{
 "id": "kj_合",
 "k": "合",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゴウ",
  "ガッ",
  "カッ"
 ],
 "kun": [
  "あう",
  "あわす",
  "あわせる"
 ],
 "ex": [
  "合同，合計，結合",
  "合併，合宿，合点",
  "合戦",
  "合う，落ち合う，試合",
  "合わす",
  "合わせる，問い合わせる"
 ]
},
{
 "id": "kj_言",
 "k": "言",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ゲン",
  "ゴン"
 ],
 "kun": [
  "いう",
  "こと"
 ],
 "ex": [
  "言行，言論，宣言",
  "言上，伝言，無言",
  "言う，物言い",
  "言葉，寝言"
 ]
},
{
 "id": "kj_岩",
 "k": "岩",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": false,
 "on": [
  "ガン"
 ],
 "kun": [
  "いわ"
 ],
 "ex": [
  "岩石，岩塩，火成岩",
  "岩，岩場"
 ]
},
{
 "id": "kj_何",
 "k": "何",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "カ"
 ],
 "kun": [
  "なに",
  "なん"
 ],
 "ex": [
  "幾何学",
  "何，何者，何事",
  "何本，何十，何点"
 ]
},
{
 "id": "kj_門",
 "k": "門",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 169,
 "rad": "⾨",
 "radName": "",
 "radChecked": false,
 "on": [
  "モン"
 ],
 "kun": [
  "かど"
 ],
 "ex": [
  "門戸，門下生，専門",
  "門，門口，門松"
 ]
},
{
 "id": "kj_番",
 "k": "番",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "バン"
 ],
 "kun": [],
 "ex": [
  "番人，番組，順番"
 ]
},
{
 "id": "kj_冬",
 "k": "冬",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 15,
 "rad": "⼎",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "ふゆ"
 ],
 "ex": [
  "冬季，冬至，越冬",
  "冬，冬枯れ"
 ]
},
{
 "id": "kj_台",
 "k": "台",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ダイ",
  "タイ"
 ],
 "kun": [],
 "ex": [
  "台地，灯台，一台",
  "台風，舞台"
 ]
},
{
 "id": "kj_図",
 "k": "図",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "ズ",
  "ト"
 ],
 "kun": [
  "はかる"
 ],
 "ex": [
  "図画，図表，地図",
  "図書，意図，壮図",
  "図る"
 ]
},
{
 "id": "kj_時",
 "k": "時",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [
  "とき"
 ],
 "ex": [
  "時間，時候，当時",
  "時，時めく，時々"
 ]
},
{
 "id": "kj_谷",
 "k": "谷",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 150,
 "rad": "⾕",
 "radName": "",
 "radChecked": false,
 "on": [
  "コク"
 ],
 "kun": [
  "たに"
 ],
 "ex": [
  "幽谷",
  "谷，谷川"
 ]
},
{
 "id": "kj_原",
 "k": "原",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 27,
 "rad": "⼚",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゲン"
 ],
 "kun": [
  "はら"
 ],
 "ex": [
  "原因，原理，高原",
  "原，野原，松原"
 ]
},
{
 "id": "kj_顔",
 "k": "顔",
 "kyu": "9級",
 "grade": 2,
 "strokes": 18,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": false,
 "on": [
  "ガン"
 ],
 "kun": [
  "かお"
 ],
 "ex": [
  "顔面，童顔，厚顔",
  "顔，横顔，したり顔"
 ]
},
{
 "id": "kj_科",
 "k": "科",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 115,
 "rad": "⽲",
 "radName": "のぎへん",
 "radChecked": true,
 "on": [
  "カ"
 ],
 "kun": [],
 "ex": [
  "科学，教科，罪科"
 ]
},
{
 "id": "kj_夜",
 "k": "夜",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 36,
 "rad": "⼣",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヤ"
 ],
 "kun": [
  "よ",
  "よる"
 ],
 "ex": [
  "夜半，深夜，昼夜",
  "夜が明ける，夜風，月夜",
  "夜，夜昼"
 ]
},
{
 "id": "kj_父",
 "k": "父",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 88,
 "rad": "⽗",
 "radName": "",
 "radChecked": false,
 "on": [
  "フ"
 ],
 "kun": [
  "ちち"
 ],
 "ex": [
  "父母，父兄，祖父",
  "父，父親"
 ]
},
{
 "id": "kj_当",
 "k": "当",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 58,
 "rad": "⼹",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "あたる",
  "あてる"
 ],
 "ex": [
  "当惑，当然，妥当",
  "当たる，当たり",
  "当てる，当て"
 ]
},
{
 "id": "kj_地",
 "k": "地",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": false,
 "on": [
  "チ",
  "ジ"
 ],
 "kun": [],
 "ex": [
  "地下，天地，境地",
  "地面，地震，地元"
 ]
},
{
 "id": "kj_数",
 "k": "数",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": false,
 "on": [
  "スウ",
  "ス"
 ],
 "kun": [
  "かず",
  "かぞえる"
 ],
 "ex": [
  "数字，数量，年数",
  "人数",
  "",
  "数える，数え年"
 ]
},
{
 "id": "kj_室",
 "k": "室",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "シツ"
 ],
 "kun": [
  "むろ"
 ],
 "ex": [
  "室内，皇室，居室",
  "室，室咲き"
 ]
},
{
 "id": "kj_国",
 "k": "国",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "コク"
 ],
 "kun": [
  "くに"
 ],
 "ex": [
  "国際，国家，外国",
  "国，島国"
 ]
},
{
 "id": "kj_戸",
 "k": "戸",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 63,
 "rad": "⼾",
 "radName": "",
 "radChecked": false,
 "on": [
  "コ"
 ],
 "kun": [
  "と"
 ],
 "ex": [
  "戸外，戸籍，下戸",
  "戸，雨戸"
 ]
},
{
 "id": "kj_汽",
 "k": "汽",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [],
 "ex": [
  "汽車，汽船，汽笛"
 ]
},
{
 "id": "kj_夏",
 "k": "夏",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 35,
 "rad": "⼢",
 "radName": "",
 "radChecked": false,
 "on": [
  "カ",
  "ゲ",
  "カ"
 ],
 "kun": [
  "なつ"
 ],
 "ex": [
  "夏季，初夏，盛夏",
  "夏至",
  "",
  "夏，夏服，真夏"
 ]
},
{
 "id": "kj_野",
 "k": "野",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 166,
 "rad": "⾥",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヤ"
 ],
 "kun": [
  "の"
 ],
 "ex": [
  "野外，野性，分野",
  "野，野原，野放し"
 ]
},
{
 "id": "kj_風",
 "k": "風",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 182,
 "rad": "⾵",
 "radName": "",
 "radChecked": false,
 "on": [
  "フウ",
  "フ"
 ],
 "kun": [
  "かぜ",
  "かざ"
 ],
 "ex": [
  "風力，風俗，強風",
  "風情，中風",
  "風，そよ風",
  "風上，風車"
 ]
},
{
 "id": "kj_東",
 "k": "東",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "ひがし"
 ],
 "ex": [
  "東西，東国，以東",
  "東，東側"
 ]
},
{
 "id": "kj_池",
 "k": "池",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "チ"
 ],
 "kun": [
  "いけ"
 ],
 "ex": [
  "貯水池，電池",
  "池，古池"
 ]
},
{
 "id": "kj_西",
 "k": "西",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 146,
 "rad": "⾑",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "サイ"
 ],
 "kun": [
  "にし"
 ],
 "ex": [
  "西暦，西部，北西",
  "西国，東西",
  "西，西日"
 ]
},
{
 "id": "kj_社",
 "k": "社",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": false,
 "on": [
  "シャ"
 ],
 "kun": [
  "やしろ"
 ],
 "ex": [
  "社会，会社，神社",
  ""
 ]
},
{
 "id": "kj_黒",
 "k": "黒",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 203,
 "rad": "⿊",
 "radName": "",
 "radChecked": false,
 "on": [
  "コク"
 ],
 "kun": [
  "くろ",
  "くろい"
 ],
 "ex": [
  "黒板，漆黒，暗黒",
  "黒，真っ黒，白黒",
  "黒い，黒さ，腹黒い"
 ]
},
{
 "id": "kj_古",
 "k": "古",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "コ"
 ],
 "kun": [
  "ふるい",
  "ふるす"
 ],
 "ex": [
  "古代，古典，太古",
  "古い，古株，古びる",
  "使い古す"
 ]
},
{
 "id": "kj_記",
 "k": "記",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [
  "しるす"
 ],
 "ex": [
  "記入，記号，伝記",
  "記す"
 ]
},
{
 "id": "kj_家",
 "k": "家",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "カ",
  "ケ"
 ],
 "kun": [
  "いえ",
  "や"
 ],
 "ex": [
  "家屋，家庭，作家",
  "家来，本家，分家",
  "家，家柄，家元",
  "家主，借家"
 ]
},
{
 "id": "kj_友",
 "k": "友",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 29,
 "rad": "⼜",
 "radName": "",
 "radChecked": false,
 "on": [
  "ユウ"
 ],
 "kun": [
  "とも"
 ],
 "ex": [
  "友好，友情，親友",
  ""
 ]
},
{
 "id": "kj_分",
 "k": "分",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 18,
 "rad": "⼑",
 "radName": "かたな",
 "radChecked": true,
 "on": [
  "ブン",
  "フン",
  "ブ"
 ],
 "kun": [
  "わける",
  "わかれる",
  "わかる",
  "わかつ"
 ],
 "ex": [
  "分解，自分，水分",
  "分別，分銅，三十分",
  "一分一厘，五分",
  "分ける，引き分け",
  "分かれる",
  "分かる",
  "分かつ，分かち合う"
 ]
},
{
 "id": "kj_答",
 "k": "答",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "こたえる",
  "こたえ"
 ],
 "ex": [
  "答弁，応答，問答",
  "答える",
  "答え"
 ]
},
{
 "id": "kj_知",
 "k": "知",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 111,
 "rad": "⽮",
 "radName": "",
 "radChecked": false,
 "on": [
  "チ"
 ],
 "kun": [
  "しる"
 ],
 "ex": [
  "知識，知人，通知",
  "知る，物知り"
 ]
},
{
 "id": "kj_声",
 "k": "声",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 33,
 "rad": "⼠",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "こえ",
  "こわ"
 ],
 "ex": [
  "声楽，声援，名声",
  "大音声",
  "声，呼び声，歌声",
  "声色"
 ]
},
{
 "id": "kj_弱",
 "k": "弱",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 57,
 "rad": "⼸",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジャク"
 ],
 "kun": [
  "よわい",
  "よわる",
  "よわまる",
  "よわめる"
 ],
 "ex": [
  "弱点，弱小，強弱",
  "弱い，弱虫，足弱",
  "弱る",
  "弱まる",
  "弱める"
 ]
},
{
 "id": "kj_今",
 "k": "今",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "コン",
  "キン"
 ],
 "kun": [
  "いま"
 ],
 "ex": [
  "今後，今日，今朝，今年，",
  "今上",
  "今，今し方"
 ]
},
{
 "id": "kj_午",
 "k": "午",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": false,
 "on": [
  "ゴ"
 ],
 "kun": [],
 "ex": [
  "午前，正午，子午線"
 ]
},
{
 "id": "kj_帰",
 "k": "帰",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [
  "かえる",
  "かえす"
 ],
 "ex": [
  "帰還，帰納，復帰",
  "帰る，帰り",
  "帰す"
 ]
},
{
 "id": "kj_歌",
 "k": "歌",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 76,
 "rad": "⽋",
 "radName": "",
 "radChecked": false,
 "on": [
  "カ",
  "カ"
 ],
 "kun": [
  "うた",
  "うたう"
 ],
 "ex": [
  "歌曲，唱歌，短歌",
  "",
  "",
  "歌う"
 ]
},
{
 "id": "kj_用",
 "k": "用",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 101,
 "rad": "⽤",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "もちいる"
 ],
 "ex": [
  "用意，使用，費用",
  "用いる"
 ]
},
{
 "id": "kj_聞",
 "k": "聞",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 128,
 "rad": "⽿",
 "radName": "",
 "radChecked": false,
 "on": [
  "ブン",
  "モン"
 ],
 "kun": [
  "きく",
  "きこえる"
 ],
 "ex": [
  "新聞，風聞，見聞",
  "聴聞，前代未聞",
  "聞く，人聞き",
  "聞こえる，聞こえ"
 ]
},
{
 "id": "kj_頭",
 "k": "頭",
 "kyu": "9級",
 "grade": 2,
 "strokes": 16,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": false,
 "on": [
  "トウ",
  "ズ",
  "ト"
 ],
 "kun": [
  "あたま",
  "かしら"
 ],
 "ex": [
  "頭部，年頭，船頭",
  "頭脳，頭上，頭痛",
  "音頭",
  "頭，頭金，頭打ち",
  "頭，頭文字，旗頭"
 ]
},
{
 "id": "kj_茶",
 "k": "茶",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "チャ",
  "サ"
 ],
 "kun": [],
 "ex": [
  "茶色，茶番劇，番茶",
  "茶菓，茶話会，喫茶"
 ]
},
{
 "id": "kj_星",
 "k": "星",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "ほし"
 ],
 "ex": [
  "星座，流星，衛星",
  "明星",
  "星，黒星"
 ]
},
{
 "id": "kj_首",
 "k": "首",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 185,
 "rad": "⾸",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュ"
 ],
 "kun": [
  "くび"
 ],
 "ex": [
  "首尾，首席，自首",
  "首，首飾り"
 ]
},
{
 "id": "kj_才",
 "k": "才",
 "kyu": "9級",
 "grade": 2,
 "strokes": 3,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "サイ"
 ],
 "kun": [],
 "ex": [
  "才能，才覚，秀才"
 ]
},
{
 "id": "kj_後",
 "k": "後",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": false,
 "on": [
  "ゴ",
  "コウ"
 ],
 "kun": [
  "のち",
  "うしろ",
  "あと",
  "おくれる"
 ],
 "ex": [
  "後刻，前後，午後",
  "後続，後悔，後輩",
  "後，後添い，後の世",
  "後ろ，後ろめたい",
  "後，後味，後回し",
  "後れる，後れ毛，気後れ"
 ]
},
{
 "id": "kj_弓",
 "k": "弓",
 "kyu": "9級",
 "grade": 2,
 "strokes": 3,
 "radNo": 57,
 "rad": "⼸",
 "radName": "",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "ゆみ"
 ],
 "ex": [
  "弓道，弓状，洋弓",
  "弓，弓矢"
 ]
},
{
 "id": "kj_画",
 "k": "画",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "ガ",
  "カク"
 ],
 "kun": [],
 "ex": [
  "画家，図画，映画",
  "画期的，計画，区画"
 ]
},
{
 "id": "kj_曜",
 "k": "曜",
 "kyu": "9級",
 "grade": 2,
 "strokes": 18,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [],
 "ex": [
  "曜日，七曜表，日曜"
 ]
},
{
 "id": "kj_米",
 "k": "米",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 119,
 "rad": "⽶",
 "radName": "",
 "radChecked": false,
 "on": [
  "ベイ",
  "マイ"
 ],
 "kun": [
  "こめ"
 ],
 "ex": [
  "米作，米価，米食",
  "精米，新米，白米",
  "米，米粒"
 ]
},
{
 "id": "kj_同",
 "k": "同",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ドウ"
 ],
 "kun": [
  "おなじ"
 ],
 "ex": [
  "同情，異同，混同",
  "同じ，同じだ，同い年"
 ]
},
{
 "id": "kj_昼",
 "k": "昼",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "ひる"
 ],
 "ex": [
  "昼夜，昼食，白昼",
  "昼，昼寝，真昼"
 ]
},
{
 "id": "kj_晴",
 "k": "晴",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "セイ"
 ],
 "kun": [
  "はれる",
  "はらす"
 ],
 "ex": [
  "晴天，晴雨，快晴",
  "晴れる，晴れ，晴れやかだ",
  "晴らす，気晴らし"
 ]
},
{
 "id": "kj_秋",
 "k": "秋",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 115,
 "rad": "⽲",
 "radName": "のぎへん",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [
  "あき"
 ],
 "ex": [
  "秋季，秋分，晩秋",
  ""
 ]
},
{
 "id": "kj_細",
 "k": "細",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "サイ"
 ],
 "kun": [
  "ほそい",
  "ほそる",
  "こまか",
  "こまかい"
 ],
 "ex": [
  "細心，詳細，零細",
  "細い，細腕，心細い",
  "細る",
  "細かだ",
  "細かい"
 ]
},
{
 "id": "kj_語",
 "k": "語",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ゴ"
 ],
 "kun": [
  "かたる",
  "かたらう"
 ],
 "ex": [
  "語学，新語，国語",
  "語る，物語",
  "語らう，語らい"
 ]
},
{
 "id": "kj_牛",
 "k": "牛",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 93,
 "rad": "⽜",
 "radName": "うしへん",
 "radChecked": false,
 "on": [
  "ギュウ"
 ],
 "kun": [
  "うし"
 ],
 "ex": [
  "牛馬，牛乳，闘牛",
  ""
 ]
},
{
 "id": "kj_回",
 "k": "回",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "カイ",
  "エ"
 ],
 "kun": [
  "まわる",
  "まわす"
 ],
 "ex": [
  "回答，転回，次回",
  "回向",
  "回る，回り，回り道",
  "回す，手回し"
 ]
},
{
 "id": "kj_来",
 "k": "来",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ライ"
 ],
 "kun": [
  "くる",
  "きたる",
  "きたす"
 ],
 "ex": [
  "来年，来歴，往来",
  "来る，出来心",
  "来る○日",
  "来す"
 ]
},
{
 "id": "kj_歩",
 "k": "歩",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 77,
 "rad": "⽌",
 "radName": "",
 "radChecked": false,
 "on": [
  "ホ",
  "ブ",
  "フ"
 ],
 "kun": [
  "あるく",
  "あゆむ"
 ],
 "ex": [
  "歩道，徒歩，進歩",
  "歩合，日歩",
  "",
  "歩く",
  "歩む，歩み"
 ]
},
{
 "id": "kj_道",
 "k": "道",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ドウ",
  "トウ"
 ],
 "kun": [
  "みち"
 ],
 "ex": [
  "道路，道徳，報道",
  "神道",
  "道，近道"
 ]
},
{
 "id": "kj_長",
 "k": "長",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 168,
 "rad": "⾧",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [
  "ながい"
 ],
 "ex": [
  "長女，長所，成長",
  "長い，長さ"
 ]
},
{
 "id": "kj_切",
 "k": "切",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 18,
 "rad": "⼑",
 "radName": "",
 "radChecked": false,
 "on": [
  "セツ",
  "サイ"
 ],
 "kun": [
  "きる",
  "きれる"
 ],
 "ex": [
  "切断，親切，切に",
  "一切",
  "切る",
  "切れる"
 ]
},
{
 "id": "kj_週",
 "k": "週",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [],
 "ex": [
  "週刊，週末，毎週"
 ]
},
{
 "id": "kj_作",
 "k": "作",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "サク",
  "サ"
 ],
 "kun": [
  "つくる"
 ],
 "ex": [
  "作為，著作，豊作",
  "作業，作用，動作",
  "作る"
 ]
},
{
 "id": "kj_工",
 "k": "工",
 "kyu": "9級",
 "grade": 2,
 "strokes": 3,
 "radNo": 48,
 "rad": "⼯",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ",
  "ク"
 ],
 "kun": [],
 "ex": [
  "工場，加工，人工",
  "工面，細工，大工"
 ]
},
{
 "id": "kj_魚",
 "k": "魚",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 195,
 "rad": "⿂",
 "radName": "",
 "radChecked": false,
 "on": [
  "ギョ"
 ],
 "kun": [
  "うお",
  "さかな"
 ],
 "ex": [
  "魚類，金魚，鮮魚",
  "魚，魚市場",
  "魚，魚屋，煮魚"
 ]
},
{
 "id": "kj_会",
 "k": "会",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "カイ",
  "エ"
 ],
 "kun": [
  "あう"
 ],
 "ex": [
  "会話，会計，社会",
  "会釈，会得，法会",
  "会う"
 ]
},
{
 "id": "kj_里",
 "k": "里",
 "kyu": "9級",
 "grade": 2,
 "strokes": 7,
 "radNo": 166,
 "rad": "⾥",
 "radName": "",
 "radChecked": false,
 "on": [
  "リ"
 ],
 "kun": [
  "さと"
 ],
 "ex": [
  "里程，郷里，千里眼",
  "里，里心，村里"
 ]
},
{
 "id": "kj_母",
 "k": "母",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 80,
 "rad": "⽏",
 "radName": "",
 "radChecked": false,
 "on": [
  "ボ"
 ],
 "kun": [
  "はは"
 ],
 "ex": [
  "母性，父母，祖母",
  "母，母親"
 ]
},
{
 "id": "kj_読",
 "k": "読",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ドク",
  "トク",
  "トウ"
 ],
 "kun": [
  "よむ"
 ],
 "ex": [
  "読書，音読，購読",
  "読本",
  "読点，句読点",
  "読む，読み"
 ]
},
{
 "id": "kj_鳥",
 "k": "鳥",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 196,
 "rad": "⿃",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [
  "とり"
 ],
 "ex": [
  "鳥類，野鳥，一石二鳥",
  "鳥，鳥居，小鳥"
 ]
},
{
 "id": "kj_雪",
 "k": "雪",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 173,
 "rad": "⾬",
 "radName": "",
 "radChecked": false,
 "on": [
  "セツ"
 ],
 "kun": [
  "ゆき"
 ],
 "ex": [
  "雪辱，降雪，積雪",
  "雪，雪解け，初雪"
 ]
},
{
 "id": "kj_春",
 "k": "春",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "シュン"
 ],
 "kun": [
  "はる"
 ],
 "ex": [
  "春季，立春，青春",
  "春，春めく"
 ]
},
{
 "id": "kj_算",
 "k": "算",
 "kyu": "9級",
 "grade": 2,
 "strokes": 14,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "サン"
 ],
 "kun": [],
 "ex": [
  "算数，計算，予算"
 ]
},
{
 "id": "kj_公",
 "k": "公",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "おおやけ"
 ],
 "ex": [
  "公平，公私，公園",
  ""
 ]
},
{
 "id": "kj_京",
 "k": "京",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 8,
 "rad": "⼇",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョウ",
  "ケイ"
 ],
 "kun": [],
 "ex": [
  "京風，上京，帰京",
  "「京浜」，「京阪」などと使う。"
 ]
},
{
 "id": "kj_海",
 "k": "海",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "カイ"
 ],
 "kun": [
  "うみ"
 ],
 "ex": [
  "海岸，海水浴，航海",
  "海，海鳴り"
 ]
},
{
 "id": "kj_理",
 "k": "理",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 96,
 "rad": "⽟",
 "radName": "",
 "radChecked": false,
 "on": [
  "リ"
 ],
 "kun": [],
 "ex": [
  "理科，理由，整理"
 ]
},
{
 "id": "kj_方",
 "k": "方",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 70,
 "rad": "⽅",
 "radName": "",
 "radChecked": false,
 "on": [
  "ホウ"
 ],
 "kun": [
  "かた"
 ],
 "ex": [
  "方法，方角，地方",
  "お乗りの方，話し方，敵方"
 ]
},
{
 "id": "kj_内",
 "k": "内",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 13,
 "rad": "⼌",
 "radName": "",
 "radChecked": false,
 "on": [
  "ナイ",
  "ダイ"
 ],
 "kun": [
  "うち"
 ],
 "ex": [
  "内外，内容，家内",
  "内裏，参内",
  "内，内側，内気"
 ]
},
{
 "id": "kj_朝",
 "k": "朝",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [
  "あさ"
 ],
 "ex": [
  "朝食，早朝，今朝",
  "朝，朝日，毎朝"
 ]
},
{
 "id": "kj_船",
 "k": "船",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 137,
 "rad": "⾈",
 "radName": "",
 "radChecked": false,
 "on": [
  "セン"
 ],
 "kun": [
  "ふね",
  "ふな"
 ],
 "ex": [
  "船舶，乗船，汽船",
  "船，大船，親船",
  "船旅，船賃"
 ]
},
{
 "id": "kj_書",
 "k": "書",
 "kyu": "9級",
 "grade": 2,
 "strokes": 10,
 "radNo": 73,
 "rad": "⽈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショ"
 ],
 "kun": [
  "かく"
 ],
 "ex": [
  "書画，書籍，読書",
  "書く"
 ]
},
{
 "id": "kj_止",
 "k": "止",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 77,
 "rad": "⽌",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "とまる",
  "とめる"
 ],
 "ex": [
  "止宿，静止，中止",
  "止まる，行き止まり",
  "止める，歯止め"
 ]
},
{
 "id": "kj_広",
 "k": "広",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "ひろい",
  "ひろまる",
  "ひろめる",
  "ひろがる",
  "ひろげる"
 ],
 "ex": [
  "広大，広言，広義",
  "広い，広場，広々と",
  "広まる",
  "広める",
  "広がる，広がり",
  "広げる"
 ]
},
{
 "id": "kj_強",
 "k": "強",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 57,
 "rad": "⼸",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョウ",
  "ゴウ"
 ],
 "kun": [
  "つよい",
  "つよまる",
  "つよめる",
  "しいる"
 ],
 "ex": [
  "強弱，強要，勉強",
  "強引，強情，強盗",
  "強い，強がる",
  "強まる",
  "強める",
  "強いる，無理強い"
 ]
},
{
 "id": "kj_絵",
 "k": "絵",
 "kyu": "9級",
 "grade": 2,
 "strokes": 12,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "カイ",
  "エ"
 ],
 "kun": [],
 "ex": [
  "絵画",
  "絵本，絵図，口絵"
 ]
},
{
 "id": "kj_話",
 "k": "話",
 "kyu": "9級",
 "grade": 2,
 "strokes": 13,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ワ"
 ],
 "kun": [
  "はなす",
  "はなし"
 ],
 "ex": [
  "話題，会話，童話",
  "話す，話し合い",
  "話，昔話，立ち話"
 ]
},
{
 "id": "kj_北",
 "k": "北",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 21,
 "rad": "⼔",
 "radName": "",
 "radChecked": false,
 "on": [
  "ホク"
 ],
 "kun": [
  "きた"
 ],
 "ex": [
  "北進，北方，敗北",
  "北，北風，北半球"
 ]
},
{
 "id": "kj_南",
 "k": "南",
 "kyu": "9級",
 "grade": 2,
 "strokes": 9,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": false,
 "on": [
  "ナン",
  "ナ"
 ],
 "kun": [
  "みなみ"
 ],
 "ex": [
  "南北，南端，指南",
  "南無",
  "南，南向き"
 ]
},
{
 "id": "kj_直",
 "k": "直",
 "kyu": "9級",
 "grade": 2,
 "strokes": 8,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョク",
  "ジキ"
 ],
 "kun": [
  "ただちに",
  "なおす",
  "なおる"
 ],
 "ex": [
  "直立，直接，実直",
  "直訴，直筆，正直",
  "直ちに",
  "直す，手直し",
  "直る，仲直り"
 ]
},
{
 "id": "kj_線",
 "k": "線",
 "kyu": "9級",
 "grade": 2,
 "strokes": 15,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "セン"
 ],
 "kun": [],
 "ex": [
  "線路，点線，光線"
 ]
},
{
 "id": "kj_少",
 "k": "少",
 "kyu": "9級",
 "grade": 2,
 "strokes": 4,
 "radNo": 42,
 "rad": "⼩",
 "radName": "つかんむり",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "すくない",
  "すこし"
 ],
 "ex": [
  "少年，多少，減少",
  "少ない",
  "少し"
 ]
},
{
 "id": "kj_市",
 "k": "市",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "いち"
 ],
 "ex": [
  "市民，市況，都市",
  "市，競り市"
 ]
},
{
 "id": "kj_交",
 "k": "交",
 "kyu": "9級",
 "grade": 2,
 "strokes": 6,
 "radNo": 8,
 "rad": "⼇",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "まじわる",
  "まじえる",
  "まじる",
  "まざる",
  "まぜる",
  "かう",
  "かわす"
 ],
 "ex": [
  "交通，交番，社交",
  "交わる，交わり",
  "交える",
  "交じる",
  "交ざる",
  "交ぜる，交ぜ織り",
  "飛び交う",
  "交わす"
 ]
},
{
 "id": "kj_教",
 "k": "教",
 "kyu": "9級",
 "grade": 2,
 "strokes": 11,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": false,
 "on": [
  "キョウ"
 ],
 "kun": [
  "おしえる",
  "おそわる"
 ],
 "ex": [
  "教育，教訓，宗教",
  "教える，教え",
  "教わる"
 ]
},
{
 "id": "kj_外",
 "k": "外",
 "kyu": "9級",
 "grade": 2,
 "strokes": 5,
 "radNo": 36,
 "rad": "⼣",
 "radName": "",
 "radChecked": false,
 "on": [
  "ガイ",
  "ゲ"
 ],
 "kun": [
  "そと",
  "ほか",
  "はずす",
  "はずれる"
 ],
 "ex": [
  "外出，海外，除外",
  "外科，外題，外道",
  "外，外囲い",
  "外，その外",
  "外す，踏み外す",
  "外れる，町外れ"
 ]
},
{
 "id": "kj_由",
 "k": "由",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "ユ",
  "ユウ",
  "ユイ"
 ],
 "kun": [
  "よし"
 ],
 "ex": [
  "由来，経由",
  "自由，理由，事由",
  "由緒",
  "……の由"
 ]
},
{
 "id": "kj_氷",
 "k": "氷",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ヒョウ"
 ],
 "kun": [
  "こおり",
  "ひ"
 ],
 "ex": [
  "氷点，氷山，結氷",
  "",
  "氷雨"
 ]
},
{
 "id": "kj_湯",
 "k": "湯",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "ゆ"
 ],
 "ex": [
  "湯治，熱湯，微温湯",
  "湯，湯水，煮え湯"
 ]
},
{
 "id": "kj_炭",
 "k": "炭",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "タン"
 ],
 "kun": [
  "すみ"
 ],
 "ex": [
  "炭鉱，木炭，石炭",
  "炭，炭火，消し炭"
 ]
},
{
 "id": "kj_真",
 "k": "真",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "ま"
 ],
 "ex": [
  "真偽，写真，純真",
  "真南，真新しい，真っ先，"
 ]
},
{
 "id": "kj_拾",
 "k": "拾",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "シュウ",
  "ジュウ"
 ],
 "kun": [
  "ひろう"
 ],
 "ex": [
  "拾得，収拾",
  "拾万円",
  "拾う，拾い物"
 ]
},
{
 "id": "kj_仕",
 "k": "仕",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ",
  "ジ"
 ],
 "kun": [
  "つかえる"
 ],
 "ex": [
  "仕事，出仕",
  "給仕",
  "仕える"
 ]
},
{
 "id": "kj_銀",
 "k": "銀",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 167,
 "rad": "⾦",
 "radName": "かねへん",
 "radChecked": false,
 "on": [
  "ギン"
 ],
 "kun": [],
 "ex": [
  "銀貨，銀行，水銀"
 ]
},
{
 "id": "kj_開",
 "k": "開",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 169,
 "rad": "⾨",
 "radName": "",
 "radChecked": false,
 "on": [
  "カイ",
  "カイ"
 ],
 "kun": [
  "ひらく",
  "ひらける",
  "あく",
  "あける"
 ],
 "ex": [
  "開始，開拓，展開",
  "",
  "開く，川開き",
  "開ける",
  "開く",
  "開ける，開けたて"
 ]
},
{
 "id": "kj_悪",
 "k": "悪",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "アク",
  "オ"
 ],
 "kun": [
  "わるい"
 ],
 "ex": [
  "悪事，悪意，醜悪",
  "悪寒，好悪，憎悪",
  "悪い，悪さ，悪者"
 ]
},
{
 "id": "kj_油",
 "k": "油",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ユ"
 ],
 "kun": [
  "あぶら"
 ],
 "ex": [
  "油脂，油田，石油",
  "油，油絵，水油"
 ]
},
{
 "id": "kj_表",
 "k": "表",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 145,
 "rad": "⾐",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヒョウ"
 ],
 "kun": [
  "おもて",
  "あらわす",
  "あらわれる"
 ],
 "ex": [
  "表面，代表，発表",
  "表，表門，裏表",
  "表す",
  "表れる"
 ]
},
{
 "id": "kj_登",
 "k": "登",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 105,
 "rad": "⽨",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ",
  "ト"
 ],
 "kun": [
  "のぼる"
 ],
 "ex": [
  "登壇，登校，登記",
  "登山，登城",
  "登る，山登り"
 ]
},
{
 "id": "kj_短",
 "k": "短",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 111,
 "rad": "⽮",
 "radName": "",
 "radChecked": false,
 "on": [
  "タン"
 ],
 "kun": [
  "みじかい"
 ],
 "ex": [
  "短歌，短所，長短",
  "短い"
 ]
},
{
 "id": "kj_深",
 "k": "深",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "シン",
  "シン"
 ],
 "kun": [
  "ふかい",
  "ふかまる",
  "ふかめる"
 ],
 "ex": [
  "深山，深夜，水深",
  "",
  "深い，深入り，深み",
  "深まる",
  "深める"
 ]
},
{
 "id": "kj_終",
 "k": "終",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [
  "おわる",
  "おえる"
 ],
 "ex": [
  "終了，終日，最終",
  "終わる，終わり",
  "終える"
 ]
},
{
 "id": "kj_死",
 "k": "死",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 78,
 "rad": "⽍",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "しぬ"
 ],
 "ex": [
  "死亡，死角，必死",
  "死ぬ，死に絶える"
 ]
},
{
 "id": "kj_区",
 "k": "区",
 "kyu": "8級",
 "grade": 3,
 "strokes": 4,
 "radNo": 23,
 "rad": "⼖",
 "radName": "",
 "radChecked": false,
 "on": [
  "ク"
 ],
 "kun": [],
 "ex": [
  "区別，区々，地区"
 ]
},
{
 "id": "kj_階",
 "k": "階",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": true,
 "on": [
  "カイ"
 ],
 "kun": [],
 "ex": [
  "階段，階級，地階"
 ]
},
{
 "id": "kj_安",
 "k": "安",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "アン"
 ],
 "kun": [
  "やすい"
 ],
 "ex": [
  "安全，安価，不安",
  "安い，安らかだ"
 ]
},
{
 "id": "kj_有",
 "k": "有",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "ユウ",
  "ウ"
 ],
 "kun": [
  "ある"
 ],
 "ex": [
  "有益，所有，特有",
  "有無，有象無象",
  "有る，有り金"
 ]
},
{
 "id": "kj_秒",
 "k": "秒",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 115,
 "rad": "⽲",
 "radName": "のぎへん",
 "radChecked": false,
 "on": [
  "ビョウ"
 ],
 "kun": [],
 "ex": [
  "秒針，秒速，寸秒"
 ]
},
{
 "id": "kj_等",
 "k": "等",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "ひとしい"
 ],
 "ex": [
  "等分，等級，平等",
  "等しい"
 ]
},
{
 "id": "kj_談",
 "k": "談",
 "kyu": "8級",
 "grade": 3,
 "strokes": 15,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "ダン"
 ],
 "kun": [],
 "ex": [
  "談話，談判，相談"
 ]
},
{
 "id": "kj_進",
 "k": "進",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "すすむ",
  "すすめる"
 ],
 "ex": [
  "進級，進言，前進",
  "進む，進み",
  "進める"
 ]
},
{
 "id": "kj_習",
 "k": "習",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 124,
 "rad": "⽻",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [
  "ならう"
 ],
 "ex": [
  "習得，習慣，練習",
  "習う，手習い"
 ]
},
{
 "id": "kj_使",
 "k": "使",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "つかう"
 ],
 "ex": [
  "使役，使者，駆使",
  "使う，使い"
 ]
},
{
 "id": "kj_苦",
 "k": "苦",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": true,
 "on": [
  "ク"
 ],
 "kun": [
  "くるしい",
  "くるしむ",
  "くるしめる",
  "にがい",
  "にがる"
 ],
 "ex": [
  "苦心，苦労，辛苦",
  "苦しい，苦しがる，見苦しい",
  "苦しむ，苦しみ",
  "苦しめる",
  "苦い，苦虫，苦々しい",
  "苦り切る"
 ]
},
{
 "id": "kj_寒",
 "k": "寒",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "カン"
 ],
 "kun": [
  "さむい"
 ],
 "ex": [
  "寒暑，寒村，厳寒",
  "寒い，寒がる，寒空"
 ]
},
{
 "id": "kj_暗",
 "k": "暗",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": true,
 "on": [
  "アン"
 ],
 "kun": [
  "くらい"
 ],
 "ex": [
  "暗示，暗愚，明暗",
  "暗い，暗がり"
 ]
},
{
 "id": "kj_遊",
 "k": "遊",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ユウ",
  "ユ"
 ],
 "kun": [
  "あそぶ"
 ],
 "ex": [
  "遊戯，遊離，交遊",
  "遊山",
  "遊ぶ，遊び"
 ]
},
{
 "id": "kj_病",
 "k": "病",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 104,
 "rad": "⽧",
 "radName": "",
 "radChecked": false,
 "on": [
  "ビョウ",
  "ヘイ"
 ],
 "kun": [
  "やむ",
  "やまい"
 ],
 "ex": [
  "病気，病根，看病",
  "疾病",
  "病む，病み付き",
  ""
 ]
},
{
 "id": "kj_動",
 "k": "動",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "ドウ"
 ],
 "kun": [
  "うごく",
  "うごかす"
 ],
 "ex": [
  "動物，活動，騒動",
  "動く，動き",
  "動かす"
 ]
},
{
 "id": "kj_着",
 "k": "着",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "チャク",
  "ジャク"
 ],
 "kun": [
  "きる",
  "きせる",
  "つく",
  "つける"
 ],
 "ex": [
  "着用，着手，土着",
  "愛着，執着",
  "着る，着物，晴れ着",
  "着せる，お仕着せ",
  "着く，船着き場",
  "着ける"
 ]
},
{
 "id": "kj_世",
 "k": "世",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "セ"
 ],
 "kun": [
  "よ"
 ],
 "ex": [
  "世紀，時世，処世",
  "世界，世間，出世",
  "世，世の中"
 ]
},
{
 "id": "kj_集",
 "k": "集",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 172,
 "rad": "⾫",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [
  "あつまる",
  "あつめる",
  "つどう"
 ],
 "ex": [
  "集合，集結，全集",
  "集まる，集まり",
  "集める，人集め",
  "集う，集い"
 ]
},
{
 "id": "kj_始",
 "k": "始",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "はじめる",
  "はじまる"
 ],
 "ex": [
  "始終，年始，開始",
  "始める，始め",
  "始まる，始まり"
 ]
},
{
 "id": "kj_具",
 "k": "具",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": false,
 "on": [
  "グ"
 ],
 "kun": [],
 "ex": [
  "具体的，具備，道具"
 ]
},
{
 "id": "kj_感",
 "k": "感",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "カン"
 ],
 "kun": [],
 "ex": [
  "感心，感覚，直感"
 ]
},
{
 "id": "kj_医",
 "k": "医",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 23,
 "rad": "⼖",
 "radName": "",
 "radChecked": false,
 "on": [
  "イ"
 ],
 "kun": [],
 "ex": [
  "医学，医療，名医"
 ]
},
{
 "id": "kj_予",
 "k": "予",
 "kyu": "8級",
 "grade": 3,
 "strokes": 4,
 "radNo": 6,
 "rad": "⼅",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヨ"
 ],
 "kun": [],
 "ex": [
  "予定，予備，猶予"
 ]
},
{
 "id": "kj_品",
 "k": "品",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヒン"
 ],
 "kun": [
  "しな"
 ],
 "ex": [
  "品評，作品，上品",
  "品，品物，手品"
 ]
},
{
 "id": "kj_童",
 "k": "童",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 117,
 "rad": "⽴",
 "radName": "",
 "radChecked": false,
 "on": [
  "ドウ"
 ],
 "kun": [
  "わらべ"
 ],
 "ex": [
  "童話，童心，児童",
  "童，童歌"
 ]
},
{
 "id": "kj_注",
 "k": "注",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "そそぐ"
 ],
 "ex": [
  "注入，注意，発注",
  "注ぐ"
 ]
},
{
 "id": "kj_整",
 "k": "整",
 "kyu": "8級",
 "grade": 3,
 "strokes": 16,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": false,
 "on": [
  "セイ",
  "セイ"
 ],
 "kun": [
  "ととのえる",
  "ととのう"
 ],
 "ex": [
  "整理，整列，調整",
  "",
  "整える",
  "整う"
 ]
},
{
 "id": "kj_住",
 "k": "住",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジュウ"
 ],
 "kun": [
  "すむ",
  "すまう"
 ],
 "ex": [
  "住所，安住，衣食住",
  "住む",
  "住まう，住まい"
 ]
},
{
 "id": "kj_指",
 "k": "指",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "シ",
  "シ"
 ],
 "kun": [
  "ゆび",
  "さす"
 ],
 "ex": [
  "指示，指導，屈指",
  "",
  "指，指先",
  "指す，指図，名指し"
 ]
},
{
 "id": "kj_君",
 "k": "君",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "クン"
 ],
 "kun": [
  "きみ"
 ],
 "ex": [
  "君主，君臨，諸君",
  "君，母君"
 ]
},
{
 "id": "kj_漢",
 "k": "漢",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "カン"
 ],
 "kun": [],
 "ex": [
  "漢字，漢語，門外漢"
 ]
},
{
 "id": "kj_委",
 "k": "委",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": false,
 "on": [
  "イ"
 ],
 "kun": [
  "ゆだねる"
 ],
 "ex": [
  "委任，委員，委細",
  "委ねる"
 ]
},
{
 "id": "kj_羊",
 "k": "羊",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 123,
 "rad": "⽺",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "ひつじ"
 ],
 "ex": [
  "羊毛，綿羊，牧羊",
  ""
 ]
},
{
 "id": "kj_負",
 "k": "負",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 154,
 "rad": "⾙",
 "radName": "かい・こがい",
 "radChecked": false,
 "on": [
  "フ"
 ],
 "kun": [
  "まける",
  "まかす",
  "おう"
 ],
 "ex": [
  "負担，負傷，勝負",
  "負ける，負け",
  "負かす",
  "負う，負い目，背負う"
 ]
},
{
 "id": "kj_農",
 "k": "農",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 161,
 "rad": "⾠",
 "radName": "",
 "radChecked": false,
 "on": [
  "ノウ"
 ],
 "kun": [],
 "ex": [
  "農業，農具，酪農"
 ]
},
{
 "id": "kj_柱",
 "k": "柱",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "はしら"
 ],
 "ex": [
  "支柱，円柱，電柱",
  "柱，帆柱，大黒柱"
 ]
},
{
 "id": "kj_昔",
 "k": "昔",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "セキ",
  "シャク"
 ],
 "kun": [
  "むかし"
 ],
 "ex": [
  "昔日，昔年，昔時",
  "今昔",
  "昔，昔話"
 ]
},
{
 "id": "kj_重",
 "k": "重",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 166,
 "rad": "⾥",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジュウ",
  "チョウ"
 ],
 "kun": [
  "え",
  "おもい",
  "かさねる",
  "かさなる"
 ],
 "ex": [
  "重量，重大，二重",
  "重畳，慎重，貴重",
  "一重，八重桜",
  "重い，重たい",
  "重ねる，重ね着",
  "重なる"
 ]
},
{
 "id": "kj_歯",
 "k": "歯",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 77,
 "rad": "⽌",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "は"
 ],
 "ex": [
  "歯科，乳歯，義歯",
  "歯，入れ歯"
 ]
},
{
 "id": "kj_係",
 "k": "係",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケイ"
 ],
 "kun": [
  "かかる",
  "かかり"
 ],
 "ex": [
  "係累，係争，関係",
  "係る",
  "係，係員，庶務係"
 ]
},
{
 "id": "kj_館",
 "k": "館",
 "kyu": "8級",
 "grade": 3,
 "strokes": 16,
 "radNo": 184,
 "rad": "⾷",
 "radName": "しょくへん",
 "radChecked": true,
 "on": [
  "カン"
 ],
 "kun": [
  "やかた"
 ],
 "ex": [
  "館内，旅館，図書館",
  ""
 ]
},
{
 "id": "kj_意",
 "k": "意",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "イ",
  "イ"
 ],
 "kun": [],
 "ex": [
  "意見，意味，決意",
  ""
 ]
},
{
 "id": "kj_洋",
 "k": "洋",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [],
 "ex": [
  "洋楽，洋風，海洋"
 ]
},
{
 "id": "kj_部",
 "k": "部",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 163,
 "rad": "⾢",
 "radName": "",
 "radChecked": false,
 "on": [
  "ブ"
 ],
 "kun": [],
 "ex": [
  "部分，全部，本部"
 ]
},
{
 "id": "kj_波",
 "k": "波",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ハ"
 ],
 "kun": [
  "なみ"
 ],
 "ex": [
  "波浪，波及，電波",
  "波，波立つ，荒波"
 ]
},
{
 "id": "kj_丁",
 "k": "丁",
 "kyu": "8級",
 "grade": 3,
 "strokes": 2,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "チョウ",
  "テイ"
 ],
 "kun": [],
 "ex": [
  "丁数，落丁，二丁目",
  "丁字路，甲乙丙丁"
 ]
},
{
 "id": "kj_全",
 "k": "全",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 11,
 "rad": "⼊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゼン"
 ],
 "kun": [
  "まったく",
  "すべて"
 ],
 "ex": [
  "全部，全国，完全",
  "全く，全うする",
  "全て"
 ]
},
{
 "id": "kj_宿",
 "k": "宿",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "シュク"
 ],
 "kun": [
  "やど",
  "やどる",
  "やどす"
 ],
 "ex": [
  "宿泊，宿題，合宿",
  "宿，宿屋",
  "宿る，雨宿り",
  "宿す"
 ]
},
{
 "id": "kj_詩",
 "k": "詩",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [],
 "ex": [
  "詩情，詩人，詩歌"
 ]
},
{
 "id": "kj_軽",
 "k": "軽",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 159,
 "rad": "⾞",
 "radName": "くるまへん",
 "radChecked": false,
 "on": [
  "ケイ"
 ],
 "kun": [
  "かるい",
  "かろやか"
 ],
 "ex": [
  "軽快，軽薄，軽率",
  "軽い，軽々と，手軽だ",
  "軽やかだ"
 ]
},
{
 "id": "kj_岸",
 "k": "岸",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": false,
 "on": [
  "ガン"
 ],
 "kun": [
  "きし"
 ],
 "ex": [
  "岸壁，対岸，彼岸",
  "岸，向こう岸"
 ]
},
{
 "id": "kj_育",
 "k": "育",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 130,
 "rad": "⾁",
 "radName": "",
 "radChecked": false,
 "on": [
  "イク"
 ],
 "kun": [
  "そだつ",
  "そだてる",
  "はぐくむ"
 ],
 "ex": [
  "育児，教育，発育",
  "育つ，育ち",
  "育てる，育て親",
  "育む"
 ]
},
{
 "id": "kj_葉",
 "k": "葉",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "は"
 ],
 "ex": [
  "葉緑素，落葉，紅葉",
  "葉，枯れ葉，落ち葉"
 ]
},
{
 "id": "kj_服",
 "k": "服",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "フク"
 ],
 "kun": [],
 "ex": [
  "服装，服従，洋服"
 ]
},
{
 "id": "kj_配",
 "k": "配",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 164,
 "rad": "⾣",
 "radName": "",
 "radChecked": false,
 "on": [
  "ハイ"
 ],
 "kun": [
  "くばる"
 ],
 "ex": [
  "配分，交配，心配",
  "配る"
 ]
},
{
 "id": "kj_帳",
 "k": "帳",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [],
 "ex": [
  "帳面，帳簿，通帳"
 ]
},
{
 "id": "kj_相",
 "k": "相",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "ソウ",
  "ショウ"
 ],
 "kun": [
  "あい"
 ],
 "ex": [
  "相当，相談，真相",
  "首相，宰相",
  "相手，相宿"
 ]
},
{
 "id": "kj_所",
 "k": "所",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 63,
 "rad": "⼾",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショ"
 ],
 "kun": [
  "ところ"
 ],
 "ex": [
  "所得，住所，近所",
  "所，台所"
 ]
},
{
 "id": "kj_次",
 "k": "次",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 76,
 "rad": "⽋",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ",
  "シ"
 ],
 "kun": [
  "つぐ",
  "つぎ"
 ],
 "ex": [
  "次回，次元，目次",
  "次第",
  "次ぐ，次いで〔副〕",
  "次，次に，次々と"
 ]
},
{
 "id": "kj_血",
 "k": "血",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 143,
 "rad": "⾎",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケツ"
 ],
 "kun": [
  "ち"
 ],
 "ex": [
  "血液，血統，鮮血",
  "血，鼻血"
 ]
},
{
 "id": "kj_起",
 "k": "起",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 156,
 "rad": "⾛",
 "radName": "",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [
  "おきる",
  "おこる",
  "おこす"
 ],
 "ex": [
  "起立，起源，奮起",
  "起きる，早起き",
  "起こる",
  "起こす"
 ]
},
{
 "id": "kj_員",
 "k": "員",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "イン"
 ],
 "kun": [],
 "ex": [
  "満員，定員，社員"
 ]
},
{
 "id": "kj_陽",
 "k": "陽",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [],
 "ex": [
  "陽光，陰陽，太陽"
 ]
},
{
 "id": "kj_福",
 "k": "福",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": false,
 "on": [
  "フク"
 ],
 "kun": [],
 "ex": [
  "福祉，福徳，幸福"
 ]
},
{
 "id": "kj_倍",
 "k": "倍",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "バイ"
 ],
 "kun": [],
 "ex": [
  "倍率，倍加，二倍"
 ]
},
{
 "id": "kj_調",
 "k": "調",
 "kyu": "8級",
 "grade": 3,
 "strokes": 15,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": false,
 "on": [
  "チョウ"
 ],
 "kun": [
  "しらべる",
  "ととのう",
  "ととのえる"
 ],
 "ex": [
  "調和，調査，好調",
  "調べる，調べ",
  "調う",
  "調える"
 ]
},
{
 "id": "kj_送",
 "k": "送",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ソウ"
 ],
 "kun": [
  "おくる"
 ],
 "ex": [
  "送別，放送，運送",
  "送る，見送り"
 ]
},
{
 "id": "kj_暑",
 "k": "暑",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ショ"
 ],
 "kun": [
  "あつい"
 ],
 "ex": [
  "暑気，残暑，避暑",
  "暑い，暑さ"
 ]
},
{
 "id": "kj_事",
 "k": "事",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 6,
 "rad": "⼅",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ",
  "ズ"
 ],
 "kun": [
  "こと"
 ],
 "ex": [
  "事物，無事，師事",
  "好事家",
  "事，仕事，出来事"
 ]
},
{
 "id": "kj_決",
 "k": "決",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ケツ"
 ],
 "kun": [
  "きめる",
  "きまる"
 ],
 "ex": [
  "決裂，決意，解決",
  "決める，取り決め",
  "決まる，決まり"
 ]
},
{
 "id": "kj_期",
 "k": "期",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "キ",
  "ゴ"
 ],
 "kun": [],
 "ex": [
  "期間，期待，予期",
  "最期，この期に及んで"
 ]
},
{
 "id": "kj_院",
 "k": "院",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": false,
 "on": [
  "イン"
 ],
 "kun": [],
 "ex": [
  "院内，議院，病院"
 ]
},
{
 "id": "kj_様",
 "k": "様",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "さま"
 ],
 "ex": [
  "様式，様子，模様",
  "様，○○様"
 ]
},
{
 "id": "kj_物",
 "k": "物",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 93,
 "rad": "⽜",
 "radName": "うしへん",
 "radChecked": true,
 "on": [
  "ブツ",
  "モツ"
 ],
 "kun": [
  "もの"
 ],
 "ex": [
  "物質，人物，動物",
  "食物，進物，禁物",
  "物，物語，品物"
 ]
},
{
 "id": "kj_箱",
 "k": "箱",
 "kyu": "8級",
 "grade": 3,
 "strokes": 15,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": true,
 "on": [],
 "kun": [
  "はこ"
 ],
 "ex": [
  "箱，箱庭，小箱"
 ]
},
{
 "id": "kj_追",
 "k": "追",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ツイ"
 ],
 "kun": [
  "おう"
 ],
 "ex": [
  "追跡，追放，訴追",
  "追う"
 ]
},
{
 "id": "kj_想",
 "k": "想",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "ソウ",
  "ソ"
 ],
 "kun": [],
 "ex": [
  "想像，感想，予想",
  "愛想"
 ]
},
{
 "id": "kj_助",
 "k": "助",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "ジョ"
 ],
 "kun": [
  "たすける",
  "たすかる",
  "すけ"
 ],
 "ex": [
  "助力，助監督，救助",
  "助ける，助け",
  "助かる，大助かり",
  "助太刀"
 ]
},
{
 "id": "kj_持",
 "k": "持",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": true,
 "on": [
  "ジ"
 ],
 "kun": [
  "もつ"
 ],
 "ex": [
  "持参，持続，支持",
  "持つ"
 ]
},
{
 "id": "kj_研",
 "k": "研",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 112,
 "rad": "⽯",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン"
 ],
 "kun": [
  "とぐ"
 ],
 "ex": [
  "研究，研修",
  "研ぐ"
 ]
},
{
 "id": "kj_客",
 "k": "客",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "キャク",
  "カク"
 ],
 "kun": [],
 "ex": [
  "客間，客車，乗客",
  "客死，主客，旅客"
 ]
},
{
 "id": "kj_飲",
 "k": "飲",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 184,
 "rad": "⾷",
 "radName": "しょくへん",
 "radChecked": true,
 "on": [
  "イン"
 ],
 "kun": [
  "のむ"
 ],
 "ex": [
  "飲料，飲食，痛飲",
  "飲む，飲み水"
 ]
},
{
 "id": "kj_落",
 "k": "落",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ラク"
 ],
 "kun": [
  "おちる",
  "おとす"
 ],
 "ex": [
  "落語，落涙，集落",
  "落ちる，落ち着く",
  "落とす，力落とし"
 ]
},
{
 "id": "kj_平",
 "k": "平",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 51,
 "rad": "⼲",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヘイ",
  "ビョウ"
 ],
 "kun": [
  "たいら",
  "ひら"
 ],
 "ex": [
  "平面，平和，公平",
  "平等",
  "平らな土地，平らげる",
  "平手，平謝り，平たい"
 ]
},
{
 "id": "kj_畑",
 "k": "畑",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [],
 "kun": [
  "はた",
  "はたけ"
 ],
 "ex": [
  "畑，畑作",
  "畑，畑違い，麦畑"
 ]
},
{
 "id": "kj_定",
 "k": "定",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "テイ",
  "ジョウ"
 ],
 "kun": [
  "さだめる",
  "さだまる",
  "さだか"
 ],
 "ex": [
  "定価，安定，決定",
  "定石，定紋，必定",
  "定める，定め",
  "定まる",
  "定かだ"
 ]
},
{
 "id": "kj_息",
 "k": "息",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "ソク"
 ],
 "kun": [
  "いき"
 ],
 "ex": [
  "休息，消息，子息",
  "息，息巻く，吐息"
 ]
},
{
 "id": "kj_昭",
 "k": "昭",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [],
 "ex": [
  "昭和"
 ]
},
{
 "id": "kj_式",
 "k": "式",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 56,
 "rad": "⼷",
 "radName": "",
 "radChecked": false,
 "on": [
  "シキ"
 ],
 "kun": [],
 "ex": [
  "式典，形式，数式"
 ]
},
{
 "id": "kj_県",
 "k": "県",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン"
 ],
 "kun": [],
 "ex": [
  "県庁，県立，○○県"
 ]
},
{
 "id": "kj_究",
 "k": "究",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 116,
 "rad": "⽳",
 "radName": "",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "きわめる"
 ],
 "ex": [
  "究明，研究，学究",
  "究める"
 ]
},
{
 "id": "kj_運",
 "k": "運",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ウン"
 ],
 "kun": [
  "はこぶ"
 ],
 "ex": [
  "運動，運命，海運",
  "運ぶ"
 ]
},
{
 "id": "kj_流",
 "k": "流",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "リュウ",
  "ル"
 ],
 "kun": [
  "ながれる",
  "ながす"
 ],
 "ex": [
  "流行，流動，電流",
  "流布，流転，流罪",
  "流れる，流れ",
  "流す，流し"
 ]
},
{
 "id": "kj_返",
 "k": "返",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ヘン"
 ],
 "kun": [
  "かえす",
  "かえる"
 ],
 "ex": [
  "返却，返事，返礼",
  "返す，仕返し",
  "返る，寝返り"
 ]
},
{
 "id": "kj_発",
 "k": "発",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 105,
 "rad": "⽨",
 "radName": "",
 "radChecked": false,
 "on": [
  "ハツ",
  "ホツ"
 ],
 "kun": [],
 "ex": [
  "発明，発射，突発",
  "発作，発端，発起"
 ]
},
{
 "id": "kj_庭",
 "k": "庭",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": true,
 "on": [
  "テイ"
 ],
 "kun": [
  "にわ"
 ],
 "ex": [
  "庭園，校庭，家庭",
  "庭，庭先"
 ]
},
{
 "id": "kj_速",
 "k": "速",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": false,
 "on": [
  "ソク"
 ],
 "kun": [
  "はやい",
  "はやめる",
  "はやまる",
  "すみやか"
 ],
 "ex": [
  "速度，敏速，時速",
  "速い，速さ",
  "速める",
  "速まる",
  "速やかだ"
 ]
},
{
 "id": "kj_消",
 "k": "消",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "きえる",
  "けす"
 ],
 "ex": [
  "消滅，消極的，費消",
  "消える，立ち消え",
  "消す，消しゴム"
 ]
},
{
 "id": "kj_実",
 "k": "実",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "ジツ"
 ],
 "kun": [
  "み",
  "みのる"
 ],
 "ex": [
  "実力，充実，実に",
  "実，実入り",
  "実る，実り"
 ]
},
{
 "id": "kj_庫",
 "k": "庫",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": false,
 "on": [
  "コ",
  "ク"
 ],
 "kun": [],
 "ex": [
  "倉庫，文庫，車庫",
  "庫裏"
 ]
},
{
 "id": "kj_急",
 "k": "急",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "いそぐ"
 ],
 "ex": [
  "急速，急務，緊急",
  "急ぐ，急ぎ"
 ]
},
{
 "id": "kj_泳",
 "k": "泳",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "エイ"
 ],
 "kun": [
  "およぐ"
 ],
 "ex": [
  "泳法，水泳，背泳",
  "泳ぐ，泳ぎ"
 ]
},
{
 "id": "kj_旅",
 "k": "旅",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 70,
 "rad": "⽅",
 "radName": "",
 "radChecked": false,
 "on": [
  "リョ"
 ],
 "kun": [
  "たび"
 ],
 "ex": [
  "旅行，旅情，旅券",
  "旅，旅先，船旅"
 ]
},
{
 "id": "kj_勉",
 "k": "勉",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "ベン"
 ],
 "kun": [],
 "ex": [
  "勉強，勉学，勤勉"
 ]
},
{
 "id": "kj_反",
 "k": "反",
 "kyu": "8級",
 "grade": 3,
 "strokes": 4,
 "radNo": 29,
 "rad": "⼜",
 "radName": "",
 "radChecked": false,
 "on": [
  "ハン",
  "ホン",
  "タン"
 ],
 "kun": [
  "そる",
  "そらす"
 ],
 "ex": [
  "反映，反対，違反",
  "謀反",
  "反物",
  "反る，反り",
  "反らす"
 ]
},
{
 "id": "kj_笛",
 "k": "笛",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "テキ"
 ],
 "kun": [
  "ふえ"
 ],
 "ex": [
  "汽笛，警笛，牧笛",
  "笛，口笛"
 ]
},
{
 "id": "kj_族",
 "k": "族",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 70,
 "rad": "⽅",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゾク"
 ],
 "kun": [],
 "ex": [
  "一族，家族，民族"
 ]
},
{
 "id": "kj_商",
 "k": "商",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "あきなう"
 ],
 "ex": [
  "商売，商業，貿易商",
  "商う，商い"
 ]
},
{
 "id": "kj_写",
 "k": "写",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 14,
 "rad": "⼍",
 "radName": "",
 "radChecked": false,
 "on": [
  "シャ"
 ],
 "kun": [
  "うつす",
  "うつる"
 ],
 "ex": [
  "写真，描写，映写",
  "写す，写し",
  "写る，写り"
 ]
},
{
 "id": "kj_湖",
 "k": "湖",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "コ"
 ],
 "kun": [
  "みずうみ"
 ],
 "ex": [
  "湖水，湖沼，湖畔",
  ""
 ]
},
{
 "id": "kj_級",
 "k": "級",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [],
 "ex": [
  "等級，上級，階級"
 ]
},
{
 "id": "kj_駅",
 "k": "駅",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 187,
 "rad": "⾺",
 "radName": "",
 "radChecked": false,
 "on": [
  "エキ"
 ],
 "kun": [],
 "ex": [
  "駅長，駅伝，貨物駅"
 ]
},
{
 "id": "kj_両",
 "k": "両",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "リョウ"
 ],
 "kun": [],
 "ex": [
  "両親，両立，千両"
 ]
},
{
 "id": "kj_放",
 "k": "放",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": false,
 "on": [
  "ホウ"
 ],
 "kun": [
  "はなす",
  "はなつ",
  "はなれる",
  "ほうる"
 ],
 "ex": [
  "放送，放棄，追放",
  "放す，手放す",
  "放つ",
  "放れる",
  "放る"
 ]
},
{
 "id": "kj_坂",
 "k": "坂",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": false,
 "on": [
  "ハン"
 ],
 "kun": [
  "さか"
 ],
 "ex": [
  "急坂",
  "坂，坂道，下り坂"
 ]
},
{
 "id": "kj_鉄",
 "k": "鉄",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 167,
 "rad": "⾦",
 "radName": "かねへん",
 "radChecked": true,
 "on": [
  "テツ"
 ],
 "kun": [],
 "ex": [
  "鉄道，鉄筋，鋼鉄"
 ]
},
{
 "id": "kj_他",
 "k": "他",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "タ"
 ],
 "kun": [
  "ほか"
 ],
 "ex": [
  "他国，自他，排他的",
  "他，○○の他"
 ]
},
{
 "id": "kj_章",
 "k": "章",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 117,
 "rad": "⽴",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [],
 "ex": [
  "憲章，勲章，文章"
 ]
},
{
 "id": "kj_者",
 "k": "者",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 125,
 "rad": "⽼",
 "radName": "",
 "radChecked": false,
 "on": [
  "シャ"
 ],
 "kun": [
  "もの"
 ],
 "ex": [
  "医者，前者，第三者",
  "者，若者"
 ]
},
{
 "id": "kj_向",
 "k": "向",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "むく",
  "むける",
  "むかう",
  "むこう"
 ],
 "ex": [
  "向上，傾向，趣向",
  "向く，向き",
  "向ける，顔向け",
  "向かう，向かい",
  "向こう，向こう側"
 ]
},
{
 "id": "kj_宮",
 "k": "宮",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "キュウ",
  "グウ",
  "ク"
 ],
 "kun": [
  "みや"
 ],
 "ex": [
  "宮殿，宮廷，離宮",
  "宮司，神宮，東宮",
  "「宮内庁」などと使う。",
  "宮，宮様"
 ]
},
{
 "id": "kj_央",
 "k": "央",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": false,
 "on": [
  "オウ"
 ],
 "kun": [],
 "ex": [
  "中央"
 ]
},
{
 "id": "kj_緑",
 "k": "緑",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "リョク",
  "ロク"
 ],
 "kun": [
  "みどり"
 ],
 "ex": [
  "緑茶，緑陰，新緑",
  "緑青",
  "緑，薄緑"
 ]
},
{
 "id": "kj_味",
 "k": "味",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 30,
 "rad": "⼝",
 "radName": "くちへん",
 "radChecked": true,
 "on": [
  "ミ"
 ],
 "kun": [
  "あじ",
  "あじわう"
 ],
 "ex": [
  "味覚，意味，興味",
  "味，味見，塩味",
  "味わう，味わい"
 ]
},
{
 "id": "kj_板",
 "k": "板",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ハン",
  "バン"
 ],
 "kun": [
  "いた"
 ],
 "ex": [
  "乾板，鉄板",
  "黒板，掲示板",
  "板，板前"
 ]
},
{
 "id": "kj_転",
 "k": "転",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 159,
 "rad": "⾞",
 "radName": "くるまへん",
 "radChecked": true,
 "on": [
  "テン"
 ],
 "kun": [
  "ころがる",
  "ころげる",
  "ころがす",
  "ころぶ"
 ],
 "ex": [
  "転出，回転，運転",
  "転がる",
  "転げる",
  "転がす",
  "転ぶ"
 ]
},
{
 "id": "kj_打",
 "k": "打",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "ダ"
 ],
 "kun": [
  "うつ"
 ],
 "ex": [
  "打撃，打破，乱打",
  "打つ"
 ]
},
{
 "id": "kj_勝",
 "k": "勝",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "かつ",
  "まさる"
 ],
 "ex": [
  "勝敗，優勝，名勝",
  "勝つ，勝ち，勝手",
  "勝る，男勝り"
 ]
},
{
 "id": "kj_主",
 "k": "主",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 3,
 "rad": "⼂",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュ",
  "ス"
 ],
 "kun": [
  "ぬし",
  "おも"
 ],
 "ex": [
  "主人，主権，施主",
  "法主，坊主",
  "主，地主",
  "主な人々"
 ]
},
{
 "id": "kj_幸",
 "k": "幸",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 51,
 "rad": "⼲",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "さいわい",
  "さち",
  "しあわせ"
 ],
 "ex": [
  "幸福，不幸，行幸",
  "幸い，幸いな事",
  "",
  "幸せ，幸せな人"
 ]
},
{
 "id": "kj_球",
 "k": "球",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 96,
 "rad": "⽟",
 "radName": "",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "たま"
 ],
 "ex": [
  "球形，球技，地球",
  ""
 ]
},
{
 "id": "kj_横",
 "k": "横",
 "kyu": "8級",
 "grade": 3,
 "strokes": 15,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "オウ"
 ],
 "kun": [
  "よこ"
 ],
 "ex": [
  "横断，横領，専横",
  "横，横顔，横たわる"
 ]
},
{
 "id": "kj_礼",
 "k": "礼",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": true,
 "on": [
  "レイ",
  "ライ"
 ],
 "kun": [],
 "ex": [
  "礼儀，謝礼，無礼",
  "礼賛，礼拝"
 ]
},
{
 "id": "kj_命",
 "k": "命",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "メイ",
  "ミョウ"
 ],
 "kun": [
  "いのち"
 ],
 "ex": [
  "命令，運命，生命",
  "寿命",
  "命，命拾い"
 ]
},
{
 "id": "kj_皮",
 "k": "皮",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 107,
 "rad": "⽪",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヒ"
 ],
 "kun": [
  "かわ"
 ],
 "ex": [
  "皮膚，皮相，樹皮",
  "皮，毛皮"
 ]
},
{
 "id": "kj_都",
 "k": "都",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 163,
 "rad": "⾢",
 "radName": "",
 "radChecked": false,
 "on": [
  "ト",
  "ツ"
 ],
 "kun": [
  "みやこ"
 ],
 "ex": [
  "都会，都心，首都",
  "都合，都度",
  "都，都落ち"
 ]
},
{
 "id": "kj_対",
 "k": "対",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 41,
 "rad": "⼨",
 "radName": "",
 "radChecked": false,
 "on": [
  "タイ",
  "ツイ"
 ],
 "kun": [],
 "ex": [
  "対立，絶対，反対",
  "対句，一対"
 ]
},
{
 "id": "kj_乗",
 "k": "乗",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 4,
 "rad": "⼃",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジョウ"
 ],
 "kun": [
  "のる",
  "のせる"
 ],
 "ex": [
  "乗数，乗車，大乗的",
  "乗る，乗り物",
  "乗せる"
 ]
},
{
 "id": "kj_守",
 "k": "守",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": false,
 "on": [
  "シュ",
  "ス"
 ],
 "kun": [
  "まもる",
  "もり"
 ],
 "ex": [
  "守備，保守，攻守",
  "留守",
  "守る，守り",
  "お守り，子守，灯台守"
 ]
},
{
 "id": "kj_港",
 "k": "港",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "みなと"
 ],
 "ex": [
  "港湾，漁港，出港",
  ""
 ]
},
{
 "id": "kj_去",
 "k": "去",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 28,
 "rad": "⼛",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョ",
  "コ"
 ],
 "kun": [
  "さる"
 ],
 "ex": [
  "去年，去就，除去",
  "過去",
  "去る，去る○日"
 ]
},
{
 "id": "kj_屋",
 "k": "屋",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 44,
 "rad": "⼫",
 "radName": "",
 "radChecked": false,
 "on": [
  "オク"
 ],
 "kun": [
  "や"
 ],
 "ex": [
  "屋上，屋外，家屋",
  "屋根，花屋，楽屋"
 ]
},
{
 "id": "kj_列",
 "k": "列",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 18,
 "rad": "⼑",
 "radName": "",
 "radChecked": false,
 "on": [
  "レツ"
 ],
 "kun": [],
 "ex": [
  "列外，列車，陳列"
 ]
},
{
 "id": "kj_面",
 "k": "面",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 176,
 "rad": "⾯",
 "radName": "",
 "radChecked": false,
 "on": [
  "メン"
 ],
 "kun": [
  "おも",
  "おもて",
  "つら"
 ],
 "ex": [
  "面会，顔面，方面",
  "川の面，面影，面長",
  "面，細面",
  "面，面魂，鼻面"
 ]
},
{
 "id": "kj_悲",
 "k": "悲",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": false,
 "on": [
  "ヒ"
 ],
 "kun": [
  "かなしい",
  "かなしむ"
 ],
 "ex": [
  "悲喜，悲劇，慈悲",
  "悲しい，悲しがる",
  "悲しむ，悲しみ"
 ]
},
{
 "id": "kj_度",
 "k": "度",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": false,
 "on": [
  "ド",
  "ト",
  "タク"
 ],
 "kun": [
  "たび"
 ],
 "ex": [
  "度胸，制度，限度",
  "法度",
  "支度",
  "度，度重なる，この度"
 ]
},
{
 "id": "kj_待",
 "k": "待",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": false,
 "on": [
  "タイ"
 ],
 "kun": [
  "まつ"
 ],
 "ex": [
  "待機，待遇，期待",
  "待つ，待ち遠しい"
 ]
},
{
 "id": "kj_植",
 "k": "植",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショク"
 ],
 "kun": [
  "うえる",
  "うわる"
 ],
 "ex": [
  "植樹，植物，誤植",
  "植える，植木",
  "植わる"
 ]
},
{
 "id": "kj_取",
 "k": "取",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 29,
 "rad": "⼜",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュ"
 ],
 "kun": [
  "とる"
 ],
 "ex": [
  "取捨，取材，聴取",
  "取る"
 ]
},
{
 "id": "kj_号",
 "k": "号",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ゴウ"
 ],
 "kun": [],
 "ex": [
  "号令，号外，番号"
 ]
},
{
 "id": "kj_橋",
 "k": "橋",
 "kyu": "8級",
 "grade": 3,
 "strokes": 16,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョウ"
 ],
 "kun": [
  "はし"
 ],
 "ex": [
  "橋脚，鉄橋，歩道橋",
  "橋，丸木橋"
 ]
},
{
 "id": "kj_温",
 "k": "温",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "オン"
 ],
 "kun": [
  "あたたか",
  "あたたかい",
  "あたたまる",
  "あたためる"
 ],
 "ex": [
  "温暖，温厚，気温",
  "温かだ",
  "温かい",
  "温まる",
  "温める"
 ]
},
{
 "id": "kj_練",
 "k": "練",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "レン"
 ],
 "kun": [
  "ねる"
 ],
 "ex": [
  "練習，試練，熟練",
  "練る，練り直す"
 ]
},
{
 "id": "kj_問",
 "k": "問",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "モン"
 ],
 "kun": [
  "とう",
  "とい",
  "とん"
 ],
 "ex": [
  "問題，問答，訪問",
  "問う，問いただす",
  "問い",
  "問屋"
 ]
},
{
 "id": "kj_美",
 "k": "美",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 123,
 "rad": "⽺",
 "radName": "",
 "radChecked": false,
 "on": [
  "ビ"
 ],
 "kun": [
  "うつくしい"
 ],
 "ex": [
  "美醜，美術，賛美",
  "美しい，美しさ"
 ]
},
{
 "id": "kj_投",
 "k": "投",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "なげる"
 ],
 "ex": [
  "投資，投下，暴投",
  "投げる，身投げ"
 ]
},
{
 "id": "kj_代",
 "k": "代",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ダイ",
  "タイ"
 ],
 "kun": [
  "かわる",
  "かえる",
  "よ",
  "しろ"
 ],
 "ex": [
  "代理，世代，現代",
  "代謝，交代",
  "代わる，代わり",
  "代える",
  "代，神代",
  "代物，苗代"
 ]
},
{
 "id": "kj_申",
 "k": "申",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "もうす"
 ],
 "ex": [
  "申告，申請，内申書",
  "申す，申し上げる"
 ]
},
{
 "id": "kj_酒",
 "k": "酒",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 164,
 "rad": "⾣",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュ"
 ],
 "kun": [
  "さけ",
  "さか"
 ],
 "ex": [
  "酒宴，飲酒，洋酒",
  "酒，酒好き，甘酒",
  "酒屋，酒場，酒盛り"
 ]
},
{
 "id": "kj_根",
 "k": "根",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "コン"
 ],
 "kun": [
  "ね"
 ],
 "ex": [
  "根拠，根気，平方根",
  "根，根強い，屋根"
 ]
},
{
 "id": "kj_業",
 "k": "業",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ギョウ",
  "ゴウ"
 ],
 "kun": [
  "わざ"
 ],
 "ex": [
  "業績，職業，卒業",
  "業病，罪業，自業自得",
  "業，仕業，早業"
 ]
},
{
 "id": "kj_化",
 "k": "化",
 "kyu": "8級",
 "grade": 3,
 "strokes": 4,
 "radNo": 21,
 "rad": "⼔",
 "radName": "",
 "radChecked": false,
 "on": [
  "カ",
  "ケ"
 ],
 "kun": [
  "ばける",
  "ばかす"
 ],
 "ex": [
  "化石，化学，文化",
  "化粧，化身，権化",
  "化ける，お化け",
  "化かす"
 ]
},
{
 "id": "kj_路",
 "k": "路",
 "kyu": "8級",
 "grade": 3,
 "strokes": 13,
 "radNo": 157,
 "rad": "⾜",
 "radName": "",
 "radChecked": false,
 "on": [
  "ロ"
 ],
 "kun": [
  "じ"
 ],
 "ex": [
  "路上，道路",
  "家路，旅路，山路"
 ]
},
{
 "id": "kj_役",
 "k": "役",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": false,
 "on": [
  "ヤク",
  "エキ"
 ],
 "kun": [],
 "ex": [
  "役所，役目，荷役",
  "役務，使役，兵役"
 ]
},
{
 "id": "kj_鼻",
 "k": "鼻",
 "kyu": "8級",
 "grade": 3,
 "strokes": 14,
 "radNo": 209,
 "rad": "⿐",
 "radName": "",
 "radChecked": false,
 "on": [
  "ビ"
 ],
 "kun": [
  "はな"
 ],
 "ex": [
  "鼻音，鼻孔，耳鼻科",
  "鼻，鼻血，小鼻"
 ]
},
{
 "id": "kj_豆",
 "k": "豆",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 151,
 "rad": "⾖",
 "radName": "",
 "radChecked": false,
 "on": [
  "トウ",
  "ズ"
 ],
 "kun": [
  "まめ"
 ],
 "ex": [
  "豆腐，納豆",
  "大豆",
  "豆，豆粒，煮豆"
 ]
},
{
 "id": "kj_第",
 "k": "第",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "ダイ"
 ],
 "kun": [],
 "ex": [
  "第一，第三者，及第"
 ]
},
{
 "id": "kj_身",
 "k": "身",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 158,
 "rad": "⾝",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン"
 ],
 "kun": [
  "み"
 ],
 "ex": [
  "身体，単身，等身大",
  "身，身内，親身"
 ]
},
{
 "id": "kj_受",
 "k": "受",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 29,
 "rad": "⼜",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジュ"
 ],
 "kun": [
  "うける",
  "うかる"
 ],
 "ex": [
  "受諾，受験，甘受",
  "受ける，受付",
  "受かる"
 ]
},
{
 "id": "kj_祭",
 "k": "祭",
 "kyu": "8級",
 "grade": 3,
 "strokes": 11,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": false,
 "on": [
  "サイ"
 ],
 "kun": [
  "まつる",
  "まつり"
 ],
 "ex": [
  "祭礼，文化祭",
  "祭る，祭り上げる",
  "祭り，秋祭り"
 ]
},
{
 "id": "kj_曲",
 "k": "曲",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 73,
 "rad": "⽈",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョク"
 ],
 "kun": [
  "まがる",
  "まげる"
 ],
 "ex": [
  "曲線，曲面，名曲",
  "曲がる",
  "曲げる"
 ]
},
{
 "id": "kj_荷",
 "k": "荷",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "カ"
 ],
 "kun": [
  "に"
 ],
 "ex": [
  "出荷，入荷",
  "荷，荷物，初荷"
 ]
},
{
 "id": "kj_和",
 "k": "和",
 "kyu": "8級",
 "grade": 3,
 "strokes": 8,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "ワ",
  "オ"
 ],
 "kun": [
  "やわらぐ",
  "やわらげる",
  "なごむ",
  "なごやか"
 ],
 "ex": [
  "和解，和服，柔和",
  "和尚",
  "和らぐ",
  "和らげる",
  "和む",
  "和やかだ"
 ]
},
{
 "id": "kj_薬",
 "k": "薬",
 "kyu": "8級",
 "grade": 3,
 "strokes": 16,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ヤク"
 ],
 "kun": [
  "くすり"
 ],
 "ex": [
  "薬剤，薬局，火薬",
  "薬，飲み薬"
 ]
},
{
 "id": "kj_筆",
 "k": "筆",
 "kyu": "8級",
 "grade": 3,
 "strokes": 12,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "ヒツ"
 ],
 "kun": [
  "ふで"
 ],
 "ex": [
  "筆力，筆記，毛筆",
  "筆，筆先"
 ]
},
{
 "id": "kj_島",
 "k": "島",
 "kyu": "8級",
 "grade": 3,
 "strokes": 10,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "しま"
 ],
 "ex": [
  "島民，半島，列島",
  "島，島国，離れ島"
 ]
},
{
 "id": "kj_題",
 "k": "題",
 "kyu": "8級",
 "grade": 3,
 "strokes": 18,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": false,
 "on": [
  "ダイ"
 ],
 "kun": [],
 "ex": [
  "題名，問題，出題"
 ]
},
{
 "id": "kj_神",
 "k": "神",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": false,
 "on": [
  "シン",
  "ジン"
 ],
 "kun": [
  "かみ",
  "かん",
  "こう"
 ],
 "ex": [
  "神聖，神経，精神",
  "神社，神宮，神通力",
  "神，神様，貧乏神",
  "神主",
  "神々しい"
 ]
},
{
 "id": "kj_州",
 "k": "州",
 "kyu": "8級",
 "grade": 3,
 "strokes": 6,
 "radNo": 47,
 "rad": "⼮",
 "radName": "",
 "radChecked": false,
 "on": [
  "シュウ"
 ],
 "kun": [
  "す"
 ],
 "ex": [
  "州議会，六大州",
  "州，中州，三角州"
 ]
},
{
 "id": "kj_皿",
 "k": "皿",
 "kyu": "8級",
 "grade": 3,
 "strokes": 5,
 "radNo": 108,
 "rad": "⽫",
 "radName": "",
 "radChecked": false,
 "on": [],
 "kun": [
  "さら"
 ],
 "ex": [
  "皿，灰皿"
 ]
},
{
 "id": "kj_局",
 "k": "局",
 "kyu": "8級",
 "grade": 3,
 "strokes": 7,
 "radNo": 44,
 "rad": "⼫",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョク"
 ],
 "kun": [],
 "ex": [
  "局部，時局，結局"
 ]
},
{
 "id": "kj_界",
 "k": "界",
 "kyu": "8級",
 "grade": 3,
 "strokes": 9,
 "radNo": 102,
 "rad": "⽥",
 "radName": "",
 "radChecked": false,
 "on": [
  "カイ"
 ],
 "kun": [],
 "ex": [
  "境界，限界，世界"
 ]
},
{
 "id": "kj_民",
 "k": "民",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 83,
 "rad": "⽒",
 "radName": "",
 "radChecked": false,
 "on": [
  "ミン"
 ],
 "kun": [
  "たみ"
 ],
 "ex": [
  "民族，民主的，国民",
  ""
 ]
},
{
 "id": "kj_票",
 "k": "票",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": false,
 "on": [
  "ヒョウ"
 ],
 "kun": [],
 "ex": [
  "票決，投票，伝票"
 ]
},
{
 "id": "kj_典",
 "k": "典",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": true,
 "on": [
  "テン"
 ],
 "kun": [],
 "ex": [
  "典拠，古典，式典"
 ]
},
{
 "id": "kj_然",
 "k": "然",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": true,
 "on": [
  "ゼン",
  "ネン"
 ],
 "kun": [],
 "ex": [
  "当然，自然，必然",
  "天然"
 ]
},
{
 "id": "kj_唱",
 "k": "唱",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 30,
 "rad": "⼝",
 "radName": "くちへん",
 "radChecked": true,
 "on": [
  "ショウ"
 ],
 "kun": [
  "となえる"
 ],
 "ex": [
  "唱歌，合唱，提唱",
  "唱える"
 ]
},
{
 "id": "kj_産",
 "k": "産",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 100,
 "rad": "⽣",
 "radName": "",
 "radChecked": false,
 "on": [
  "サン"
 ],
 "kun": [
  "うむ",
  "うまれる",
  "うぶ"
 ],
 "ex": [
  "産業，生産，出産",
  "産む，産み月",
  "産まれる",
  "産湯，産着，産毛"
 ]
},
{
 "id": "kj_健",
 "k": "健",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン"
 ],
 "kun": [
  "すこやか"
 ],
 "ex": [
  "健康，健闘，強健",
  "健やかだ"
 ]
},
{
 "id": "kj_泣",
 "k": "泣",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "なく"
 ],
 "ex": [
  "号泣，感泣",
  "泣く，泣き沈む"
 ]
},
{
 "id": "kj_械",
 "k": "械",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 75,
 "rad": "⽊",
 "radName": "きへん",
 "radChecked": true,
 "on": [
  "カイ"
 ],
 "kun": [],
 "ex": [
  "機械"
 ]
},
{
 "id": "kj_愛",
 "k": "愛",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": true,
 "on": [
  "アイ"
 ],
 "kun": [],
 "ex": [
  "愛情，愛読，恋愛"
 ]
},
{
 "id": "kj_無",
 "k": "無",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": true,
 "on": [
  "ム",
  "ブ"
 ],
 "kun": [
  "ない"
 ],
 "ex": [
  "無名，無理，皆無",
  "無事，無礼，無愛想",
  "無い，無くす，無くなる"
 ]
},
{
 "id": "kj_標",
 "k": "標",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 75,
 "rad": "⽊",
 "radName": "きへん",
 "radChecked": true,
 "on": [
  "ヒョウ"
 ],
 "kun": [],
 "ex": [
  "標準，標本，目標"
 ]
},
{
 "id": "kj_伝",
 "k": "伝",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "デン"
 ],
 "kun": [
  "つたわる",
  "つたえる",
  "つたう"
 ],
 "ex": [
  "伝言，伝統，宣伝",
  "伝わる",
  "伝える，言い伝え",
  "伝う"
 ]
},
{
 "id": "kj_争",
 "k": "争",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 6,
 "rad": "⼅",
 "radName": "",
 "radChecked": false,
 "on": [
  "ソウ"
 ],
 "kun": [
  "あらそう"
 ],
 "ex": [
  "争議，競争，紛争",
  "争う，争い"
 ]
},
{
 "id": "kj_焼",
 "k": "焼",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "やく",
  "やける"
 ],
 "ex": [
  "焼却，燃焼，全焼",
  "焼く，炭焼き",
  "焼ける，夕焼け"
 ]
},
{
 "id": "kj_散",
 "k": "散",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": true,
 "on": [
  "サン"
 ],
 "kun": [
  "ちる",
  "ちらす",
  "ちらかす",
  "ちらかる"
 ],
 "ex": [
  "散歩，散文，解散",
  "散る，散り散りに",
  "散らす",
  "散らかす",
  "散らかる"
 ]
},
{
 "id": "kj_験",
 "k": "験",
 "kyu": "7級",
 "grade": 4,
 "strokes": 18,
 "radNo": 187,
 "rad": "⾺",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン",
  "ゲン"
 ],
 "kun": [],
 "ex": [
  "試験，経験，実験",
  "験がある，霊験"
 ]
},
{
 "id": "kj_給",
 "k": "給",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": true,
 "on": [
  "キュウ"
 ],
 "kun": [],
 "ex": [
  "給水，配給，月給"
 ]
},
{
 "id": "kj_害",
 "k": "害",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": true,
 "on": [
  "ガイ"
 ],
 "kun": [],
 "ex": [
  "害悪，被害，損害"
 ]
},
{
 "id": "kj_案",
 "k": "案",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "アン"
 ],
 "kun": [],
 "ex": [
  "案文，案内，新案"
 ]
},
{
 "id": "kj_約",
 "k": "約",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": true,
 "on": [
  "ヤク"
 ],
 "kun": [],
 "ex": [
  "約束，約半分，節約"
 ]
},
{
 "id": "kj_不",
 "k": "不",
 "kyu": "7級",
 "grade": 4,
 "strokes": 4,
 "radNo": 1,
 "rad": "⼀",
 "radName": "",
 "radChecked": false,
 "on": [
  "フ",
  "ブ"
 ],
 "kun": [],
 "ex": [
  "不当，不利，不賛成",
  "不作法，不用心"
 ]
},
{
 "id": "kj_徒",
 "k": "徒",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": true,
 "on": [
  "ト"
 ],
 "kun": [],
 "ex": [
  "徒歩，徒労，信徒"
 ]
},
{
 "id": "kj_倉",
 "k": "倉",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 9,
 "rad": "⼈",
 "radName": "ひとやね",
 "radChecked": true,
 "on": [
  "ソウ"
 ],
 "kun": [
  "くら"
 ],
 "ex": [
  "倉庫，穀倉",
  "倉，倉敷料"
 ]
},
{
 "id": "kj_照",
 "k": "照",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": true,
 "on": [
  "ショウ"
 ],
 "kun": [
  "てる",
  "てらす",
  "てれる"
 ],
 "ex": [
  "照明，照会，対照的",
  "照る，日照り",
  "照らす",
  "照れる"
 ]
},
{
 "id": "kj_残",
 "k": "残",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 78,
 "rad": "⽍",
 "radName": "",
 "radChecked": false,
 "on": [
  "ザン"
 ],
 "kun": [
  "のこる",
  "のこす"
 ],
 "ex": [
  "残留，残念，敗残",
  "残る，残り",
  "残す，食べ残し"
 ]
},
{
 "id": "kj_固",
 "k": "固",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 31,
 "rad": "⼞",
 "radName": "",
 "radChecked": false,
 "on": [
  "コ"
 ],
 "kun": [
  "かためる",
  "かたまる",
  "かたい"
 ],
 "ex": [
  "固定，固有，堅固",
  "固める，固め",
  "固まる，固まり",
  "固い，固さ"
 ]
},
{
 "id": "kj_挙",
 "k": "挙",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": false,
 "on": [
  "キョ"
 ],
 "kun": [
  "あげる",
  "あがる"
 ],
 "ex": [
  "挙手，挙国，壮挙",
  "挙げる，挙げて〔副〕",
  "挙がる"
 ]
},
{
 "id": "kj_街",
 "k": "街",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 144,
 "rad": "⾏",
 "radName": "",
 "radChecked": false,
 "on": [
  "ガイ",
  "カイ"
 ],
 "kun": [
  "まち"
 ],
 "ex": [
  "街頭，市街，商店街",
  "街道",
  "街，街角"
 ]
},
{
 "id": "kj_以",
 "k": "以",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "イ"
 ],
 "kun": [],
 "ex": [
  "以上，以内，以後"
 ]
},
{
 "id": "kj_勇",
 "k": "勇",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": true,
 "on": [
  "ユウ"
 ],
 "kun": [
  "いさむ"
 ],
 "ex": [
  "勇敢，勇気，武勇",
  "勇む，勇み足，勇ましい"
 ]
},
{
 "id": "kj_夫",
 "k": "夫",
 "kyu": "7級",
 "grade": 4,
 "strokes": 4,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": true,
 "on": [
  "フ",
  "フウ"
 ],
 "kun": [
  "おっと"
 ],
 "ex": [
  "夫妻，農夫，凡夫",
  "夫婦，工夫",
  ""
 ]
},
{
 "id": "kj_努",
 "k": "努",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": true,
 "on": [
  "ド"
 ],
 "kun": [
  "つとめる"
 ],
 "ex": [
  "努力",
  "努める，努めて〔副〕"
 ]
},
{
 "id": "kj_巣",
 "k": "巣",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 42,
 "rad": "⼩",
 "radName": "つかんむり",
 "radChecked": true,
 "on": [
  "ソウ"
 ],
 "kun": [
  "す"
 ],
 "ex": [
  "営巣，卵巣，病巣",
  "巣，巣箱，巣立つ"
 ]
},
{
 "id": "kj_城",
 "k": "城",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": true,
 "on": [
  "ジョウ"
 ],
 "kun": [
  "しろ"
 ],
 "ex": [
  "城内，城下町，落城",
  "城，城跡"
 ]
},
{
 "id": "kj_氏",
 "k": "氏",
 "kyu": "7級",
 "grade": 4,
 "strokes": 4,
 "radNo": 83,
 "rad": "⽒",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [
  "うじ"
 ],
 "ex": [
  "氏名，姓氏，某氏",
  "氏，氏神"
 ]
},
{
 "id": "kj_功",
 "k": "功",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": true,
 "on": [
  "コウ",
  "ク"
 ],
 "kun": [],
 "ex": [
  "功名，功績，成功",
  "功徳"
 ]
},
{
 "id": "kj_漁",
 "k": "漁",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "ギョ",
  "リョウ"
 ],
 "kun": [],
 "ex": [
  "漁業，漁船，漁村",
  "漁師，大漁，不漁"
 ]
},
{
 "id": "kj_各",
 "k": "各",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 30,
 "rad": "⼝",
 "radName": "くち",
 "radChecked": true,
 "on": [
  "カク"
 ],
 "kun": [
  "おのおの"
 ],
 "ex": [
  "各自，各種，各位",
  ""
 ]
},
{
 "id": "kj_衣",
 "k": "衣",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 145,
 "rad": "⾐",
 "radName": "",
 "radChecked": false,
 "on": [
  "イ"
 ],
 "kun": [
  "ころも"
 ],
 "ex": [
  "衣服，衣食住，作業衣",
  "衣，羽衣"
 ]
},
{
 "id": "kj_要",
 "k": "要",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 146,
 "rad": "⾑",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "かなめ",
  "いる"
 ],
 "ex": [
  "要点，要注意，重要",
  "",
  "要る"
 ]
},
{
 "id": "kj_付",
 "k": "付",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "フ"
 ],
 "kun": [
  "つける",
  "つく"
 ],
 "ex": [
  "付与，交付，給付",
  "付ける，名付け",
  "付く，気付く"
 ]
},
{
 "id": "kj_灯",
 "k": "灯",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "トウ"
 ],
 "kun": [
  "ひ"
 ],
 "ex": [
  "灯火，電灯，点灯",
  ""
 ]
},
{
 "id": "kj_束",
 "k": "束",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 75,
 "rad": "⽊",
 "radName": "き",
 "radChecked": true,
 "on": [
  "ソク"
 ],
 "kun": [
  "たば"
 ],
 "ex": [
  "束縛，結束，約束",
  "束，花束，束ねる"
 ]
},
{
 "id": "kj_縄",
 "k": "縄",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": true,
 "on": [
  "ジョウ"
 ],
 "kun": [
  "なわ"
 ],
 "ex": [
  "縄文，自縄自縛",
  "縄，縄張"
 ]
},
{
 "id": "kj_司",
 "k": "司",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 30,
 "rad": "⼝",
 "radName": "",
 "radChecked": false,
 "on": [
  "シ"
 ],
 "kun": [],
 "ex": [
  "司会，司令，上司"
 ]
},
{
 "id": "kj_好",
 "k": "好",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": true,
 "on": [
  "コウ",
  "コウ"
 ],
 "kun": [
  "このむ",
  "すく"
 ],
 "ex": [
  "好意，好敵手，良好",
  "",
  "好む，好み，好ましい",
  "好く，好き嫌い，好きな絵"
 ]
},
{
 "id": "kj_共",
 "k": "共",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": true,
 "on": [
  "キョウ"
 ],
 "kun": [
  "とも"
 ],
 "ex": [
  "共同，共通，公共",
  "共に，共々，共食い"
 ]
},
{
 "id": "kj_覚",
 "k": "覚",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 147,
 "rad": "⾒",
 "radName": "みる",
 "radChecked": true,
 "on": [
  "カク"
 ],
 "kun": [
  "おぼえる",
  "さます",
  "さめる"
 ],
 "ex": [
  "覚悟，知覚，発覚",
  "覚える，覚え",
  "覚ます，目覚まし",
  "覚める，目覚め"
 ]
},
{
 "id": "kj_位",
 "k": "位",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "イ"
 ],
 "kun": [
  "くらい"
 ],
 "ex": [
  "位置，第一位，各位",
  "位，位取り，位する"
 ]
},
{
 "id": "kj_養",
 "k": "養",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 184,
 "rad": "⾷",
 "radName": "しょくへん",
 "radChecked": false,
 "on": [
  "ヨウ"
 ],
 "kun": [
  "やしなう"
 ],
 "ex": [
  "養育，養子，休養",
  "養う"
 ]
},
{
 "id": "kj_府",
 "k": "府",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": true,
 "on": [
  "フ"
 ],
 "kun": [],
 "ex": [
  "府県，首府，政府"
 ]
},
{
 "id": "kj_働",
 "k": "働",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "ドウ"
 ],
 "kun": [
  "はたらく"
 ],
 "ex": [
  "労働，実働",
  "働く，働き"
 ]
},
{
 "id": "kj_側",
 "k": "側",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "ソク"
 ],
 "kun": [
  "がわ"
 ],
 "ex": [
  "側面，側近，側壁",
  "側，裏側，片側"
 ]
},
{
 "id": "kj_臣",
 "k": "臣",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 131,
 "rad": "⾂",
 "radName": "",
 "radChecked": false,
 "on": [
  "シン",
  "ジン"
 ],
 "kun": [],
 "ex": [
  "臣下，君臣",
  "大臣"
 ]
},
{
 "id": "kj_試",
 "k": "試",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": true,
 "on": [
  "シ"
 ],
 "kun": [
  "こころみる",
  "ためす"
 ],
 "ex": [
  "試験，試作，追試",
  "試みる，試み",
  "試す，試し"
 ]
},
{
 "id": "kj_香",
 "k": "香",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 186,
 "rad": "⾹",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ",
  "キョウ"
 ],
 "kun": [
  "か",
  "かおり",
  "かおる"
 ],
 "ex": [
  "香水，香気，線香",
  "香車",
  "香，色香，移り香",
  "香り",
  "香る"
 ]
},
{
 "id": "kj_協",
 "k": "協",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": true,
 "on": [
  "キョウ"
 ],
 "kun": [],
 "ex": [
  "協力，協会，妥協"
 ]
},
{
 "id": "kj_潟",
 "k": "潟",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [],
 "kun": [
  "かた"
 ],
 "ex": [
  "干潟，○○潟"
 ]
},
{
 "id": "kj_茨",
 "k": "茨",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [],
 "kun": [
  "いばら"
 ],
 "ex": [
  "茨城県"
 ]
},
{
 "id": "kj_浴",
 "k": "浴",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "ヨク"
 ],
 "kun": [
  "あびる",
  "あびせる"
 ],
 "ex": [
  "浴場，海水浴",
  "浴びる，水浴び",
  "浴びせる"
 ]
},
{
 "id": "kj_阜",
 "k": "阜",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": false,
 "on": [
  "フ"
 ],
 "kun": [],
 "ex": [
  "岐阜県"
 ]
},
{
 "id": "kj_特",
 "k": "特",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 93,
 "rad": "⽜",
 "radName": "うしへん",
 "radChecked": true,
 "on": [
  "トク"
 ],
 "kun": [],
 "ex": [
  "特殊，特産，独特"
 ]
},
{
 "id": "kj_続",
 "k": "続",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": true,
 "on": [
  "ゾク"
 ],
 "kun": [
  "つづく",
  "つづける"
 ],
 "ex": [
  "続出，続行，連続",
  "続く，続き",
  "続ける"
 ]
},
{
 "id": "kj_信",
 "k": "信",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "シン"
 ],
 "kun": [],
 "ex": [
  "信用，信頼，通信"
 ]
},
{
 "id": "kj_児",
 "k": "児",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": true,
 "on": [
  "ジ",
  "ニ"
 ],
 "kun": [],
 "ex": [
  "児童，幼児，優良児",
  "小児科"
 ]
},
{
 "id": "kj_候",
 "k": "候",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "コウ"
 ],
 "kun": [
  "そうろう"
 ],
 "ex": [
  "候補，気候，測候所",
  "候文，居候"
 ]
},
{
 "id": "kj_鏡",
 "k": "鏡",
 "kyu": "7級",
 "grade": 4,
 "strokes": 19,
 "radNo": 167,
 "rad": "⾦",
 "radName": "かねへん",
 "radChecked": true,
 "on": [
  "キョウ"
 ],
 "kun": [
  "かがみ"
 ],
 "ex": [
  "鏡台，望遠鏡，反射鏡",
  ""
 ]
},
{
 "id": "kj_完",
 "k": "完",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": true,
 "on": [
  "カン"
 ],
 "kun": [],
 "ex": [
  "完全，完成，未完"
 ]
},
{
 "id": "kj_印",
 "k": "印",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 26,
 "rad": "⼙",
 "radName": "",
 "radChecked": false,
 "on": [
  "イン"
 ],
 "kun": [
  "しるし"
 ],
 "ex": [
  "印刷，印象，調印",
  "印，目印，矢印"
 ]
},
{
 "id": "kj_利",
 "k": "利",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 18,
 "rad": "⼑",
 "radName": "りっとう",
 "radChecked": true,
 "on": [
  "リ"
 ],
 "kun": [
  "きく"
 ],
 "ex": [
  "利益，鋭利，勝利",
  "利く，左利き，口利き"
 ]
},
{
 "id": "kj_富",
 "k": "富",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": true,
 "on": [
  "フ",
  "フウ"
 ],
 "kun": [
  "とむ",
  "とみ"
 ],
 "ex": [
  "富強，富裕，貧富",
  "富貴",
  "富む，富み栄える",
  ""
 ]
},
{
 "id": "kj_徳",
 "k": "徳",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": true,
 "on": [
  "トク"
 ],
 "kun": [],
 "ex": [
  "徳義，徳用，道徳"
 ]
},
{
 "id": "kj_卒",
 "k": "卒",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": true,
 "on": [
  "ソツ"
 ],
 "kun": [],
 "ex": [
  "卒業，卒中，兵卒"
 ]
},
{
 "id": "kj_井",
 "k": "井",
 "kyu": "7級",
 "grade": 4,
 "strokes": 4,
 "radNo": 7,
 "rad": "⼆",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "い"
 ],
 "ex": [
  "油井，市井",
  "天井",
  "井戸"
 ]
},
{
 "id": "kj_治",
 "k": "治",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "ジ",
  "チ"
 ],
 "kun": [
  "おさめる",
  "おさまる",
  "なおる",
  "なおす"
 ],
 "ex": [
  "政治，療治",
  "治安，治水，自治",
  "治める",
  "治まる",
  "治る",
  "治す"
 ]
},
{
 "id": "kj_康",
 "k": "康",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": true,
 "on": [
  "コウ"
 ],
 "kun": [],
 "ex": [
  "健康，小康"
 ]
},
{
 "id": "kj_競",
 "k": "競",
 "kyu": "7級",
 "grade": 4,
 "strokes": 20,
 "radNo": 117,
 "rad": "⽴",
 "radName": "",
 "radChecked": false,
 "on": [
  "キョウ",
  "ケイ"
 ],
 "kun": [
  "きそう",
  "せる"
 ],
 "ex": [
  "競争，競技，競泳",
  "競馬，競輪",
  "競う",
  "競る，競り合う"
 ]
},
{
 "id": "kj_官",
 "k": "官",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": true,
 "on": [
  "カン"
 ],
 "kun": [],
 "ex": [
  "官庁，官能，教官"
 ]
},
{
 "id": "kj_英",
 "k": "英",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": true,
 "on": [
  "エイ"
 ],
 "kun": [],
 "ex": [
  "英雄，英断，俊英"
 ]
},
{
 "id": "kj_陸",
 "k": "陸",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": true,
 "on": [
  "リク"
 ],
 "kun": [],
 "ex": [
  "陸地，陸橋，着陸"
 ]
},
{
 "id": "kj_副",
 "k": "副",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 18,
 "rad": "⼑",
 "radName": "りっとう",
 "radChecked": true,
 "on": [
  "フク"
 ],
 "kun": [],
 "ex": [
  "副業，副作用，正副"
 ]
},
{
 "id": "kj_栃",
 "k": "栃",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [],
 "kun": [
  "とち"
 ],
 "ex": [
  "栃木県"
 ]
},
{
 "id": "kj_孫",
 "k": "孫",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 39,
 "rad": "⼦",
 "radName": "こ",
 "radChecked": false,
 "on": [
  "ソン"
 ],
 "kun": [
  "まご"
 ],
 "ex": [
  "子孫，嫡孫",
  ""
 ]
},
{
 "id": "kj_成",
 "k": "成",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 62,
 "rad": "⼽",
 "radName": "ほこづくり・ほこがまえ",
 "radChecked": true,
 "on": [
  "セイ",
  "ジョウ"
 ],
 "kun": [
  "なる",
  "なす"
 ],
 "ex": [
  "成功，完成，賛成",
  "成就，成仏",
  "成る，成り立つ",
  "成す，成し遂げる"
 ]
},
{
 "id": "kj_滋",
 "k": "滋",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [],
 "ex": [
  "滋味，滋養"
 ]
},
{
 "id": "kj_佐",
 "k": "佐",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "サ"
 ],
 "kun": [],
 "ex": [
  "佐幕，補佐，大佐"
 ]
},
{
 "id": "kj_極",
 "k": "極",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 75,
 "rad": "⽊",
 "radName": "きへん",
 "radChecked": true,
 "on": [
  "キョク",
  "ゴク"
 ],
 "kun": [
  "きわめる",
  "きわまる",
  "きわみ"
 ],
 "ex": [
  "極限，終極，積極的",
  "極上，極秘，至極",
  "極める，極め付き，",
  "極まる，極まり",
  "極み"
 ]
},
{
 "id": "kj_管",
 "k": "管",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": true,
 "on": [
  "カン"
 ],
 "kun": [
  "くだ"
 ],
 "ex": [
  "管理，管制，鉄管",
  ""
 ]
},
{
 "id": "kj_栄",
 "k": "栄",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "エイ"
 ],
 "kun": [
  "さかえる",
  "はえ",
  "はえる"
 ],
 "ex": [
  "栄枯，栄養，繁栄",
  "栄える，栄え",
  "栄えある，見栄え，出来栄え",
  "栄える"
 ]
},
{
 "id": "kj_良",
 "k": "良",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 138,
 "rad": "⾉",
 "radName": "",
 "radChecked": false,
 "on": [
  "リョウ"
 ],
 "kun": [
  "よい"
 ],
 "ex": [
  "良好，良心，優良",
  "良い"
 ]
},
{
 "id": "kj_兵",
 "k": "兵",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 12,
 "rad": "⼋",
 "radName": "は",
 "radChecked": true,
 "on": [
  "ヘイ",
  "ヒョウ"
 ],
 "kun": [],
 "ex": [
  "兵器，兵隊，撤兵",
  "兵糧，雑兵"
 ]
},
{
 "id": "kj_奈",
 "k": "奈",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": true,
 "on": [
  "ナ"
 ],
 "kun": [],
 "ex": [
  "奈落"
 ]
},
{
 "id": "kj_帯",
 "k": "帯",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": true,
 "on": [
  "タイ"
 ],
 "kun": [
  "おびる",
  "おび"
 ],
 "ex": [
  "携帯，地帯，連帯",
  "帯びる",
  "帯，角帯"
 ]
},
{
 "id": "kj_省",
 "k": "省",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 109,
 "rad": "⽬",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ショウ"
 ],
 "kun": [
  "かえりみる",
  "はぶく"
 ],
 "ex": [
  "反省，内省，帰省",
  "省略，各省",
  "省みる",
  "省く"
 ]
},
{
 "id": "kj_辞",
 "k": "辞",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 160,
 "rad": "⾟",
 "radName": "",
 "radChecked": false,
 "on": [
  "ジ"
 ],
 "kun": [
  "やめる"
 ],
 "ex": [
  "辞書，辞職，式辞",
  "辞める"
 ]
},
{
 "id": "kj_差",
 "k": "差",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 48,
 "rad": "⼯",
 "radName": "",
 "radChecked": false,
 "on": [
  "サ"
 ],
 "kun": [
  "さす"
 ],
 "ex": [
  "差異，差別，誤差",
  "差す"
 ]
},
{
 "id": "kj_熊",
 "k": "熊",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [],
 "kun": [
  "くま"
 ],
 "ex": [
  ""
 ]
},
{
 "id": "kj_関",
 "k": "関",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 169,
 "rad": "⾨",
 "radName": "",
 "radChecked": false,
 "on": [
  "カン"
 ],
 "kun": [
  "せき",
  "かかわる"
 ],
 "ex": [
  "関節，関係，関する",
  "関，関取，関の山",
  "関わる，関わり"
 ]
},
{
 "id": "kj_媛",
 "k": "媛",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 38,
 "rad": "⼥",
 "radName": "おんなへん",
 "radChecked": true,
 "on": [
  "エン"
 ],
 "kun": [],
 "ex": [
  "才媛"
 ]
},
{
 "id": "kj_料",
 "k": "料",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 68,
 "rad": "⽃",
 "radName": "",
 "radChecked": false,
 "on": [
  "リョウ"
 ],
 "kun": [],
 "ex": [
  "料金，料理，材料"
 ]
},
{
 "id": "kj_別",
 "k": "別",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 18,
 "rad": "⼑",
 "radName": "りっとう",
 "radChecked": true,
 "on": [
  "ベツ"
 ],
 "kun": [
  "わかれる"
 ],
 "ex": [
  "別離，区別，特別",
  "別れる，別れ"
 ]
},
{
 "id": "kj_梨",
 "k": "梨",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 75,
 "rad": "⽊",
 "radName": "き",
 "radChecked": true,
 "on": [],
 "kun": [
  "なし"
 ],
 "ex": [
  ""
 ]
},
{
 "id": "kj_隊",
 "k": "隊",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": true,
 "on": [
  "タイ"
 ],
 "kun": [],
 "ex": [
  "隊列，軍隊，部隊"
 ]
},
{
 "id": "kj_清",
 "k": "清",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "セイ",
  "ショウ",
  "セイ"
 ],
 "kun": [
  "きよい",
  "きよまる",
  "きよめる"
 ],
 "ex": [
  "清潔，清算，粛清",
  "六根清浄",
  "",
  "清い，清らかだ",
  "清まる",
  "清める"
 ]
},
{
 "id": "kj_鹿",
 "k": "鹿",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 198,
 "rad": "⿅",
 "radName": "",
 "radChecked": false,
 "on": [],
 "kun": [
  "しか",
  "か"
 ],
 "ex": [
  "",
  "鹿の子"
 ]
},
{
 "id": "kj_菜",
 "k": "菜",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": true,
 "on": [
  "サイ"
 ],
 "kun": [
  "な"
 ],
 "ex": [
  "菜園，菜食，野菜",
  "菜，青菜"
 ]
},
{
 "id": "kj_訓",
 "k": "訓",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": true,
 "on": [
  "クン"
 ],
 "kun": [],
 "ex": [
  "訓練，教訓，音訓"
 ]
},
{
 "id": "kj_観",
 "k": "観",
 "kyu": "7級",
 "grade": 4,
 "strokes": 18,
 "radNo": 147,
 "rad": "⾒",
 "radName": "みる",
 "radChecked": true,
 "on": [
  "カン"
 ],
 "kun": [],
 "ex": [
  "観察，客観，壮観"
 ]
},
{
 "id": "kj_塩",
 "k": "塩",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": true,
 "on": [
  "エン"
 ],
 "kun": [
  "しお"
 ],
 "ex": [
  "塩分，塩酸，食塩",
  "塩，塩辛い"
 ]
},
{
 "id": "kj_量",
 "k": "量",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 166,
 "rad": "⾥",
 "radName": "",
 "radChecked": false,
 "on": [
  "リョウ"
 ],
 "kun": [
  "はかる"
 ],
 "ex": [
  "量産，測量，度量",
  "量る"
 ]
},
{
 "id": "kj_辺",
 "k": "辺",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": true,
 "on": [
  "ヘン"
 ],
 "kun": [
  "あたり",
  "べ"
 ],
 "ex": [
  "辺境，周辺，その辺",
  "辺り",
  "海辺，岸辺"
 ]
},
{
 "id": "kj_熱",
 "k": "熱",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 86,
 "rad": "⽕",
 "radName": "れんが・れっか",
 "radChecked": false,
 "on": [
  "ネツ"
 ],
 "kun": [
  "あつい"
 ],
 "ex": [
  "熱病，熱湯，情熱",
  "熱い，熱さ"
 ]
},
{
 "id": "kj_達",
 "k": "達",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": true,
 "on": [
  "タツ"
 ],
 "kun": [],
 "ex": [
  "達人，調達，伝達"
 ]
},
{
 "id": "kj_静",
 "k": "静",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 174,
 "rad": "⾭",
 "radName": "",
 "radChecked": false,
 "on": [
  "セイ",
  "ジョウ"
 ],
 "kun": [
  "しず",
  "しずか",
  "しずまる",
  "しずめる"
 ],
 "ex": [
  "静止，静穏，安静",
  "静脈",
  "静々と，静けさ",
  "静かだ",
  "静まる",
  "静める"
 ]
},
{
 "id": "kj_失",
 "k": "失",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 37,
 "rad": "⼤",
 "radName": "だい",
 "radChecked": true,
 "on": [
  "シツ"
 ],
 "kun": [
  "うしなう"
 ],
 "ex": [
  "失望，失敗，消失",
  "失う"
 ]
},
{
 "id": "kj_最",
 "k": "最",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 73,
 "rad": "⽈",
 "radName": "",
 "radChecked": false,
 "on": [
  "サイ"
 ],
 "kun": [
  "もっとも"
 ],
 "ex": [
  "最大，最近，最先端",
  "最も"
 ]
},
{
 "id": "kj_軍",
 "k": "軍",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 159,
 "rad": "⾞",
 "radName": "くるまへん",
 "radChecked": false,
 "on": [
  "グン"
 ],
 "kun": [],
 "ex": [
  "軍隊，軍備，空軍"
 ]
},
{
 "id": "kj_願",
 "k": "願",
 "kyu": "7級",
 "grade": 4,
 "strokes": 19,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": true,
 "on": [
  "ガン"
 ],
 "kun": [
  "ねがう"
 ],
 "ex": [
  "願望，祈願，志願",
  "願う，願い，願わしい"
 ]
},
{
 "id": "kj_岡",
 "k": "岡",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": false,
 "on": [],
 "kun": [
  "おか"
 ],
 "ex": [
  "岡山県，静岡県，福岡県"
 ]
},
{
 "id": "kj_輪",
 "k": "輪",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 159,
 "rad": "⾞",
 "radName": "くるまへん",
 "radChecked": true,
 "on": [
  "リン"
 ],
 "kun": [
  "わ"
 ],
 "ex": [
  "輪番，一輪，車輪",
  "輪，輪切り，首輪"
 ]
},
{
 "id": "kj_変",
 "k": "変",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 34,
 "rad": "⼡",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヘン"
 ],
 "kun": [
  "かわる",
  "かえる"
 ],
 "ex": [
  "変化，異変，大変",
  "変わる，変わり種",
  "変える"
 ]
},
{
 "id": "kj_念",
 "k": "念",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": true,
 "on": [
  "ネン"
 ],
 "kun": [],
 "ex": [
  "念願，信念，断念"
 ]
},
{
 "id": "kj_単",
 "k": "単",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 42,
 "rad": "⼩",
 "radName": "つかんむり",
 "radChecked": true,
 "on": [
  "タン"
 ],
 "kun": [],
 "ex": [
  "単独，単位，簡単"
 ]
},
{
 "id": "kj_席",
 "k": "席",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": true,
 "on": [
  "セキ"
 ],
 "kun": [],
 "ex": [
  "席上，座席，出席"
 ]
},
{
 "id": "kj_借",
 "k": "借",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "シャク"
 ],
 "kun": [
  "かりる"
 ],
 "ex": [
  "借用，借金，貸借",
  "借りる，借り"
 ]
},
{
 "id": "kj_埼",
 "k": "埼",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 32,
 "rad": "⼟",
 "radName": "つちへん",
 "radChecked": true,
 "on": [],
 "kun": [
  "さい"
 ],
 "ex": [
  "埼玉県"
 ]
},
{
 "id": "kj_郡",
 "k": "郡",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 163,
 "rad": "⾢",
 "radName": "",
 "radChecked": false,
 "on": [
  "グン"
 ],
 "kun": [],
 "ex": [
  "郡部，○○郡"
 ]
},
{
 "id": "kj_岐",
 "k": "岐",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": true,
 "on": [
  "キ"
 ],
 "kun": [],
 "ex": [
  "岐路，分岐，多岐"
 ]
},
{
 "id": "kj_億",
 "k": "億",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "オク"
 ],
 "kun": [],
 "ex": [
  "億万，一億"
 ]
},
{
 "id": "kj_類",
 "k": "類",
 "kyu": "7級",
 "grade": 4,
 "strokes": 18,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": true,
 "on": [
  "ルイ"
 ],
 "kun": [
  "たぐい"
 ],
 "ex": [
  "類型，種類，分類",
  "類い，○○の類い"
 ]
},
{
 "id": "kj_便",
 "k": "便",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 9,
 "rad": "⼈",
 "radName": "にんべん",
 "radChecked": true,
 "on": [
  "ベン",
  "ビン"
 ],
 "kun": [
  "たより"
 ],
 "ex": [
  "便利，便法，簡便",
  "便乗，郵便，定期便",
  "便り，初便り，花便り"
 ]
},
{
 "id": "kj_敗",
 "k": "敗",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": true,
 "on": [
  "ハイ"
 ],
 "kun": [
  "やぶれる"
 ],
 "ex": [
  "敗北，腐敗，失敗",
  "敗れる"
 ]
},
{
 "id": "kj_置",
 "k": "置",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 122,
 "rad": "⽹",
 "radName": "",
 "radChecked": false,
 "on": [
  "チ"
 ],
 "kun": [
  "おく"
 ],
 "ex": [
  "位置，放置，処置",
  "置く"
 ]
},
{
 "id": "kj_積",
 "k": "積",
 "kyu": "7級",
 "grade": 4,
 "strokes": 16,
 "radNo": 115,
 "rad": "⽲",
 "radName": "のぎへん",
 "radChecked": true,
 "on": [
  "セキ"
 ],
 "kun": [
  "つむ",
  "つもる"
 ],
 "ex": [
  "積雪，蓄積，面積",
  "積む，下積み",
  "積もる，見積書"
 ]
},
{
 "id": "kj_種",
 "k": "種",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 115,
 "rad": "⽲",
 "radName": "のぎへん",
 "radChecked": true,
 "on": [
  "シュ"
 ],
 "kun": [
  "たね"
 ],
 "ex": [
  "種類，人種，品種",
  "種，菜種，一粒種"
 ]
},
{
 "id": "kj_材",
 "k": "材",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ザイ"
 ],
 "kun": [],
 "ex": [
  "材木，材料，人材"
 ]
},
{
 "id": "kj_群",
 "k": "群",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 123,
 "rad": "⽺",
 "radName": "",
 "radChecked": false,
 "on": [
  "グン"
 ],
 "kun": [
  "むれる",
  "むれ",
  "むら"
 ],
 "ex": [
  "群居，大群，抜群",
  "群れる",
  "群れ",
  "群すずめ，群千鳥，群がる"
 ]
},
{
 "id": "kj_希",
 "k": "希",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 50,
 "rad": "⼱",
 "radName": "はば",
 "radChecked": true,
 "on": [
  "キ"
 ],
 "kun": [],
 "ex": [
  "希望，希少，希薄"
 ]
},
{
 "id": "kj_加",
 "k": "加",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": false,
 "on": [
  "カ"
 ],
 "kun": [
  "くわえる",
  "くわわる"
 ],
 "ex": [
  "加入，加減，追加",
  "加える",
  "加わる"
 ]
},
{
 "id": "kj_令",
 "k": "令",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 9,
 "rad": "⼈",
 "radName": "ひとやね",
 "radChecked": true,
 "on": [
  "レイ"
 ],
 "kun": [],
 "ex": [
  "令嬢，法令，命令"
 ]
},
{
 "id": "kj_包",
 "k": "包",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 20,
 "rad": "⼓",
 "radName": "",
 "radChecked": false,
 "on": [
  "ホウ"
 ],
 "kun": [
  "つつむ"
 ],
 "ex": [
  "包囲，包容力，内包",
  "包む，包み，小包"
 ]
},
{
 "id": "kj_梅",
 "k": "梅",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "バイ"
 ],
 "kun": [
  "うめ"
 ],
 "ex": [
  "梅園，梅雨，紅梅",
  "梅，梅見，梅酒"
 ]
},
{
 "id": "kj_仲",
 "k": "仲",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "なか"
 ],
 "ex": [
  "仲介，仲裁，伯仲",
  "仲，仲間"
 ]
},
{
 "id": "kj_折",
 "k": "折",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 64,
 "rad": "⼿",
 "radName": "てへん",
 "radChecked": true,
 "on": [
  "セツ"
 ],
 "kun": [
  "おる",
  "おり",
  "おれる"
 ],
 "ex": [
  "折衷，折衝，屈折",
  "折る，折り紙，折り箱",
  "折，……する折",
  "折れる，名折れ"
 ]
},
{
 "id": "kj_周",
 "k": "周",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 30,
 "rad": "⼝",
 "radName": "くち",
 "radChecked": true,
 "on": [
  "シュウ"
 ],
 "kun": [
  "まわり"
 ],
 "ex": [
  "周知，周囲，円周",
  "周り"
 ]
},
{
 "id": "kj_崎",
 "k": "崎",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 46,
 "rad": "⼭",
 "radName": "やまへん",
 "radChecked": true,
 "on": [],
 "kun": [
  "さき"
 ],
 "ex": [
  "○○崎"
 ]
},
{
 "id": "kj_径",
 "k": "径",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 60,
 "rad": "⼻",
 "radName": "ぎょうにんべん",
 "radChecked": true,
 "on": [
  "ケイ"
 ],
 "kun": [],
 "ex": [
  "直径，直情径行"
 ]
},
{
 "id": "kj_季",
 "k": "季",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 39,
 "rad": "⼦",
 "radName": "こ",
 "radChecked": true,
 "on": [
  "キ"
 ],
 "kun": [],
 "ex": [
  "季節，四季，雨季"
 ]
},
{
 "id": "kj_果",
 "k": "果",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 75,
 "rad": "⽊",
 "radName": "き",
 "radChecked": true,
 "on": [
  "カ"
 ],
 "kun": [
  "はたす",
  "はてる",
  "はて"
 ],
 "ex": [
  "果実，果断，結果",
  "果たす，果たして〔副〕",
  "果てる",
  "果て"
 ]
},
{
 "id": "kj_冷",
 "k": "冷",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 15,
 "rad": "⼎",
 "radName": "",
 "radChecked": false,
 "on": [
  "レイ"
 ],
 "kun": [
  "つめたい",
  "ひえる",
  "ひや",
  "ひやす",
  "ひやかす",
  "さめる",
  "さます"
 ],
 "ex": [
  "冷却，冷淡，寒冷",
  "冷たい，冷たさ",
  "冷える，底冷え",
  "冷や，冷や汗，冷ややかだ",
  "冷やす",
  "冷やかす，冷やかし",
  "冷める",
  "冷ます，湯冷まし"
 ]
},
{
 "id": "kj_法",
 "k": "法",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "ホウ",
  "ハッ",
  "ホッ"
 ],
 "kun": [],
 "ex": [
  "法律，文法，方法",
  "法度",
  "法主"
 ]
},
{
 "id": "kj_博",
 "k": "博",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 24,
 "rad": "⼗",
 "radName": "じゅう",
 "radChecked": true,
 "on": [
  "ハク",
  "バク"
 ],
 "kun": [],
 "ex": [
  "博識，博覧，博士号",
  "博労，博徒"
 ]
},
{
 "id": "kj_沖",
 "k": "沖",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "チュウ"
 ],
 "kun": [
  "おき"
 ],
 "ex": [
  "沖積層，沖天，沖する",
  ""
 ]
},
{
 "id": "kj_節",
 "k": "節",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": true,
 "on": [
  "セツ",
  "セチ"
 ],
 "kun": [
  "ふし"
 ],
 "ex": [
  "節約，季節，関節",
  "お節料理",
  "節，節穴"
 ]
},
{
 "id": "kj_祝",
 "k": "祝",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 113,
 "rad": "⽰",
 "radName": "しめすへん",
 "radChecked": true,
 "on": [
  "シュク",
  "シュウ"
 ],
 "kun": [
  "いわう"
 ],
 "ex": [
  "祝賀，祝日，慶祝",
  "祝儀，祝言",
  "祝う"
 ]
},
{
 "id": "kj_昨",
 "k": "昨",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": true,
 "on": [
  "サク"
 ],
 "kun": [],
 "ex": [
  "昨日，昨年，一昨日"
 ]
},
{
 "id": "kj_景",
 "k": "景",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 72,
 "rad": "⽇",
 "radName": "ひへん",
 "radChecked": false,
 "on": [
  "ケイ"
 ],
 "kun": [],
 "ex": [
  "景気，風景，光景"
 ]
},
{
 "id": "kj_旗",
 "k": "旗",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 70,
 "rad": "⽅",
 "radName": "",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [
  "はた"
 ],
 "ex": [
  "旗手，旗艦，国旗",
  "旗，旗色，手旗"
 ]
},
{
 "id": "kj_貨",
 "k": "貨",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 154,
 "rad": "⾙",
 "radName": "かい・こがい",
 "radChecked": true,
 "on": [
  "カ"
 ],
 "kun": [],
 "ex": [
  "貨物，貨幣，通貨"
 ]
},
{
 "id": "kj_例",
 "k": "例",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "レイ"
 ],
 "kun": [
  "たとえる"
 ],
 "ex": [
  "例外，例年，用例",
  "例える，例え，例えば"
 ]
},
{
 "id": "kj_望",
 "k": "望",
 "kyu": "7級",
 "grade": 4,
 "strokes": 11,
 "radNo": 74,
 "rad": "⽉",
 "radName": "",
 "radChecked": false,
 "on": [
  "ボウ",
  "モウ"
 ],
 "kun": [
  "のぞむ"
 ],
 "ex": [
  "望郷，希望，人望",
  "所望，大望，本望",
  "望む，望み，望ましい"
 ]
},
{
 "id": "kj_阪",
 "k": "阪",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 170,
 "rad": "⾩",
 "radName": "こざとへん",
 "radChecked": false,
 "on": [
  "ハン"
 ],
 "kun": [],
 "ex": [
  "阪神，京阪"
 ]
},
{
 "id": "kj_兆",
 "k": "兆",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 10,
 "rad": "⼉",
 "radName": "ひとあし・にんにょう",
 "radChecked": true,
 "on": [
  "チョウ"
 ],
 "kun": [
  "きざす",
  "きざし"
 ],
 "ex": [
  "兆候，前兆，億兆",
  "兆す",
  "兆し"
 ]
},
{
 "id": "kj_説",
 "k": "説",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": true,
 "on": [
  "セツ",
  "ゼイ"
 ],
 "kun": [
  "とく"
 ],
 "ex": [
  "説明，小説，演説",
  "遊説",
  "説く"
 ]
},
{
 "id": "kj_順",
 "k": "順",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 181,
 "rad": "⾴",
 "radName": "おおがい",
 "radChecked": true,
 "on": [
  "ジュン"
 ],
 "kun": [],
 "ex": [
  "順序，順調，従順"
 ]
},
{
 "id": "kj_札",
 "k": "札",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 75,
 "rad": "⽊",
 "radName": "きへん",
 "radChecked": true,
 "on": [
  "サツ"
 ],
 "kun": [
  "ふだ"
 ],
 "ex": [
  "札入れ，表札，入札",
  "札，名札"
 ]
},
{
 "id": "kj_芸",
 "k": "芸",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ゲイ"
 ],
 "kun": [],
 "ex": [
  "芸術，芸能，文芸"
 ]
},
{
 "id": "kj_器",
 "k": "器",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 30,
 "rad": "⼝",
 "radName": "くち",
 "radChecked": true,
 "on": [
  "キ"
 ],
 "kun": [
  "うつわ"
 ],
 "ex": [
  "器量，器用，陶器",
  ""
 ]
},
{
 "id": "kj_課",
 "k": "課",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": true,
 "on": [
  "カ"
 ],
 "kun": [],
 "ex": [
  "課，日課，課する"
 ]
},
{
 "id": "kj_連",
 "k": "連",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": true,
 "on": [
  "レン"
 ],
 "kun": [
  "つらなる",
  "つらねる",
  "つれる"
 ],
 "ex": [
  "連合，連続，関連",
  "連なる",
  "連ねる",
  "連れる，連れ"
 ]
},
{
 "id": "kj_牧",
 "k": "牧",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 93,
 "rad": "⽜",
 "radName": "うしへん",
 "radChecked": true,
 "on": [
  "ボク"
 ],
 "kun": [
  "まき"
 ],
 "ex": [
  "牧場，牧師，遊牧",
  "牧場"
 ]
},
{
 "id": "kj_飯",
 "k": "飯",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 184,
 "rad": "⾷",
 "radName": "しょくへん",
 "radChecked": true,
 "on": [
  "ハン"
 ],
 "kun": [
  "めし"
 ],
 "ex": [
  "御飯，炊飯，赤飯",
  "飯，飯粒，五目飯"
 ]
},
{
 "id": "kj_低",
 "k": "低",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 9,
 "rad": "⼈",
 "radName": "",
 "radChecked": false,
 "on": [
  "テイ"
 ],
 "kun": [
  "ひくい",
  "ひくめる",
  "ひくまる"
 ],
 "ex": [
  "低級，低気圧，高低",
  "低い，低さ",
  "低める",
  "低まる"
 ]
},
{
 "id": "kj_浅",
 "k": "浅",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "セン"
 ],
 "kun": [
  "あさい"
 ],
 "ex": [
  "浅薄，浅学，深浅",
  "浅い，浅瀬，遠浅"
 ]
},
{
 "id": "kj_初",
 "k": "初",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 18,
 "rad": "⼑",
 "radName": "かたな",
 "radChecked": true,
 "on": [
  "ショ"
 ],
 "kun": [
  "はじめ",
  "はじめて",
  "はつ",
  "うい",
  "そめる"
 ],
 "ex": [
  "初期，初心者，最初",
  "初め",
  "初めて〔副〕",
  "初の受賞，初雪，初耳",
  "初陣，初々しい",
  "書き初め，出初め式"
 ]
},
{
 "id": "kj_刷",
 "k": "刷",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 18,
 "rad": "⼑",
 "radName": "",
 "radChecked": false,
 "on": [
  "サツ"
 ],
 "kun": [
  "する"
 ],
 "ex": [
  "刷新，印刷，増刷",
  "刷る"
 ]
},
{
 "id": "kj_欠",
 "k": "欠",
 "kyu": "7級",
 "grade": 4,
 "strokes": 4,
 "radNo": 76,
 "rad": "⽋",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケツ"
 ],
 "kun": [
  "かける",
  "かく"
 ],
 "ex": [
  "欠乏，欠席，補欠",
  "欠ける",
  "欠く"
 ]
},
{
 "id": "kj_機",
 "k": "機",
 "kyu": "7級",
 "grade": 4,
 "strokes": 16,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "キ"
 ],
 "kun": [
  "はた"
 ],
 "ex": [
  "機械，機会，危機",
  "機，機織り"
 ]
},
{
 "id": "kj_芽",
 "k": "芽",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 140,
 "rad": "⾋",
 "radName": "くさかんむり",
 "radChecked": false,
 "on": [
  "ガ"
 ],
 "kun": [
  "め"
 ],
 "ex": [
  "発芽，麦芽，肉芽",
  "芽，芽生える，新芽"
 ]
},
{
 "id": "kj_老",
 "k": "老",
 "kyu": "7級",
 "grade": 4,
 "strokes": 6,
 "radNo": 125,
 "rad": "⽼",
 "radName": "",
 "radChecked": false,
 "on": [
  "ロウ"
 ],
 "kun": [
  "おいる",
  "ふける"
 ],
 "ex": [
  "老巧，老人，長老",
  "老いる，老い",
  "老ける，老け役"
 ]
},
{
 "id": "kj_末",
 "k": "末",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "マツ",
  "バツ"
 ],
 "kun": [
  "すえ"
 ],
 "ex": [
  "末代，本末，粉末",
  "末子，末弟",
  "末，末っ子，末頼もしい"
 ]
},
{
 "id": "kj_飛",
 "k": "飛",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 183,
 "rad": "⾶",
 "radName": "",
 "radChecked": false,
 "on": [
  "ヒ"
 ],
 "kun": [
  "とぶ",
  "とばす"
 ],
 "ex": [
  "飛行，飛躍，雄飛",
  "飛ぶ，飛び火",
  "飛ばす"
 ]
},
{
 "id": "kj_底",
 "k": "底",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 53,
 "rad": "⼴",
 "radName": "まだれ",
 "radChecked": false,
 "on": [
  "テイ"
 ],
 "kun": [
  "そこ"
 ],
 "ex": [
  "底流，海底，到底",
  "底，奥底"
 ]
},
{
 "id": "kj_戦",
 "k": "戦",
 "kyu": "7級",
 "grade": 4,
 "strokes": 13,
 "radNo": 62,
 "rad": "⼽",
 "radName": "ほこづくり・ほこがまえ",
 "radChecked": true,
 "on": [
  "セン"
 ],
 "kun": [
  "いくさ",
  "たたかう"
 ],
 "ex": [
  "戦争，苦戦，論戦",
  "戦，勝ち戦",
  "戦う，戦い"
 ]
},
{
 "id": "kj_松",
 "k": "松",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 75,
 "rad": "⽊",
 "radName": "",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "まつ"
 ],
 "ex": [
  "松竹梅，白砂青松",
  "松，松原，門松"
 ]
},
{
 "id": "kj_察",
 "k": "察",
 "kyu": "7級",
 "grade": 4,
 "strokes": 14,
 "radNo": 40,
 "rad": "⼧",
 "radName": "うかんむり",
 "radChecked": true,
 "on": [
  "サツ"
 ],
 "kun": [],
 "ex": [
  "察知，観察，考察"
 ]
},
{
 "id": "kj_結",
 "k": "結",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 120,
 "rad": "⽷",
 "radName": "いとへん",
 "radChecked": false,
 "on": [
  "ケツ"
 ],
 "kun": [
  "むすぶ",
  "ゆう",
  "ゆわえる"
 ],
 "ex": [
  "結論，結婚，連結",
  "結ぶ，結び",
  "結う，元結",
  "結わえる"
 ]
},
{
 "id": "kj_議",
 "k": "議",
 "kyu": "7級",
 "grade": 4,
 "strokes": 20,
 "radNo": 149,
 "rad": "⾔",
 "radName": "ごんべん",
 "radChecked": true,
 "on": [
  "ギ"
 ],
 "kun": [],
 "ex": [
  "議論，会議，異議"
 ]
},
{
 "id": "kj_賀",
 "k": "賀",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 154,
 "rad": "⾙",
 "radName": "かい・こがい",
 "radChecked": true,
 "on": [
  "ガ"
 ],
 "kun": [],
 "ex": [
  "賀状，祝賀，賀する"
 ]
},
{
 "id": "kj_労",
 "k": "労",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 19,
 "rad": "⼒",
 "radName": "ちから",
 "radChecked": true,
 "on": [
  "ロウ"
 ],
 "kun": [],
 "ex": [
  "労働，労力，疲労"
 ]
},
{
 "id": "kj_満",
 "k": "満",
 "kyu": "7級",
 "grade": 4,
 "strokes": 12,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": true,
 "on": [
  "マン"
 ],
 "kun": [
  "みちる",
  "みたす"
 ],
 "ex": [
  "満月，満足，充満",
  "満ちる，満ち潮",
  "満たす"
 ]
},
{
 "id": "kj_必",
 "k": "必",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 61,
 "rad": "⼼",
 "radName": "こころ",
 "radChecked": true,
 "on": [
  "ヒツ"
 ],
 "kun": [
  "かならず"
 ],
 "ex": [
  "必然，必死，必要",
  "必ず，必ずしも"
 ]
},
{
 "id": "kj_的",
 "k": "的",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 106,
 "rad": "⽩",
 "radName": "",
 "radChecked": false,
 "on": [
  "テキ"
 ],
 "kun": [
  "まと"
 ],
 "ex": [
  "的中，目的，科学的",
  "的，的外れ"
 ]
},
{
 "id": "kj_選",
 "k": "選",
 "kyu": "7級",
 "grade": 4,
 "strokes": 15,
 "radNo": 162,
 "rad": "⾡",
 "radName": "しんにょう・しんにゅう",
 "radChecked": true,
 "on": [
  "セン"
 ],
 "kun": [
  "えらぶ"
 ],
 "ex": [
  "選択，選挙，当選",
  "選ぶ"
 ]
},
{
 "id": "kj_笑",
 "k": "笑",
 "kyu": "7級",
 "grade": 4,
 "strokes": 10,
 "radNo": 118,
 "rad": "⽵",
 "radName": "たけかんむり",
 "radChecked": false,
 "on": [
  "ショウ"
 ],
 "kun": [
  "わらう",
  "えむ"
 ],
 "ex": [
  "笑覧，微笑，談笑",
  "笑う，大笑い",
  "ほくそ笑む，笑み"
 ]
},
{
 "id": "kj_参",
 "k": "参",
 "kyu": "7級",
 "grade": 4,
 "strokes": 8,
 "radNo": 28,
 "rad": "⼛",
 "radName": "",
 "radChecked": false,
 "on": [
  "サン"
 ],
 "kun": [
  "まいる"
 ],
 "ex": [
  "参加，参万円，降参",
  "参る，寺参り"
 ]
},
{
 "id": "kj_建",
 "k": "建",
 "kyu": "7級",
 "grade": 4,
 "strokes": 9,
 "radNo": 54,
 "rad": "⼵",
 "radName": "",
 "radChecked": false,
 "on": [
  "ケン",
  "コン"
 ],
 "kun": [
  "たてる",
  "たつ"
 ],
 "ex": [
  "建築，建議，封建的",
  "建立",
  "建てる，建物，二階建て",
  "建つ，一戸建ち"
 ]
},
{
 "id": "kj_求",
 "k": "求",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 85,
 "rad": "⽔",
 "radName": "さんずい",
 "radChecked": false,
 "on": [
  "キュウ"
 ],
 "kun": [
  "もとめる"
 ],
 "ex": [
  "求職，要求，追求",
  "求める，求め"
 ]
},
{
 "id": "kj_改",
 "k": "改",
 "kyu": "7級",
 "grade": 4,
 "strokes": 7,
 "radNo": 66,
 "rad": "⽁",
 "radName": "のぶん・ぼくづくり",
 "radChecked": true,
 "on": [
  "カイ"
 ],
 "kun": [
  "あらためる",
  "あらたまる"
 ],
 "ex": [
  "改造，改革，更改",
  "改める，改めて〔副〕",
  "改まる"
 ]
},
{
 "id": "kj_録",
 "k": "録",
 "kyu": "7級",
 "grade": 4,
 "strokes": 16,
 "radNo": 167,
 "rad": "⾦",
 "radName": "かねへん",
 "radChecked": true,
 "on": [
  "ロク"
 ],
 "kun": [],
 "ex": [
  "録音，記録，実録"
 ]
},
{
 "id": "kj_未",
 "k": "未",
 "kyu": "7級",
 "grade": 4,
 "strokes": 5,
 "radNo": 75,
 "rad": "⽊",
 "radName": "き",
 "radChecked": true,
 "on": [
  "ミ"
 ],
 "kun": [],
 "ex": [
  "未来，未満，前代未聞"
 ]
}
];
