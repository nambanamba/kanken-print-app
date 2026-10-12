// 書き取りの「語ぜんぶ・送りがなまで」（kanken-practice.js の kakiWholeFor）が、決めたとおりに出るかを見る。
// ユーザー指示 2026-10-12「□合（試合）なんですが試合全部書かせてほしいです」「どっちも送り仮名まで書かせたいです」
//
// 使い方: node tools/check_kaki_whole.mjs
//
// ★入口に自己テストを置いてある（確認ポイント 4-6）。偽物が1つでも鳴らなければ、結果を出さずに終了コード3で止まる。
// ⚠️ 本の問題文は使わない（このファイルは公開リポジトリに入る）。文はすべてこの検査のための自作。

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS = fs.readFileSync(path.join(ROOT, "kanken-practice.js"), "utf8");
const KJ = fs.readFileSync(path.join(ROOT, "kanken-kanji.js"), "utf8");

function load(js) {
  const ctx = { module: { exports: {} } };
  vm.createContext(ctx);
  vm.runInContext(KJ + ";this.M=KANJI_MASTER;", ctx);
  vm.runInContext(js, ctx);
  const master = {};
  ctx.M.forEach((r) => { master[r.k] = r; });
  return { P: ctx.module.exports, master };
}

// 自作の文。[文, カタカナ, 答え, 期待する語（null＝今までどおり字だけ）, 期待する——線]
const CASES = [
  ["あしたのシ合に出る。", "シ", "試", "試合", "シ合"],          // となりの漢字（熟語ぜんぶ）
  ["コップの食エンを足す。", "エン", "塩", "食塩", "食エン"],
  ["弟がワラっている。", "ワラ", "笑", "笑っ", "ワラっ"],        // 五段動詞（活用した形のまま）
  ["へやがシズかになる。", "シズ", "静", "静か", "シズか"],      // 形容動詞
  ["空が赤みをオびてきた。", "オ", "帯", "帯び", "オび"],        // 一段動詞（る を落とす）
  ["雪がツもれば楽しい。", "ツ", "積", "積もれ", "ツもれ"],      // 積む と 積もる → 長いほう
  ["友だちとナカ直りした。", "ナカ", "仲", "仲直り", "ナカ直り"],  // 後ろの字の送りがな
  ["二人のサをちぢめる。", "サ", "差", null, null],               // 「を」は送りがなにしない
  ["イサましい音楽だ。", "イサ", "勇", null, null],               // 勇ましい は決められない → 字だけ
  ["ヒクい山にのぼる。", "ヒク", "低", "低い", "ヒクい"],        // 形容詞
];
const NONKAKI = { field: "yomi", text: "あしたのシ合に出る。", target: "シ", targetNth: 1, answers: [{ text: "試" }] };

function run(js) {
  const { P, master } = load(js);
  const bad = [];
  for (const [text, target, k, want, wantU] of CASES) {
    const it = { field: "kaki", text, target, targetNth: 1, answers: [{ text: k }] };
    const w = P.kakiWholeFor(it, { field: "kaki" }, null, master);
    const got = w ? w.word : null, gotU = w ? text.slice(w.ui, w.ui + w.ul) : null;
    if (got !== want || gotU !== wantU) bad.push(`${k}: 語 ${got} ／——線 ${gotU}（期待 ${want} ／ ${wantU}）`);
  }
  if (P.kakiWholeFor(NONKAKI, { field: "yomi" }, null, master)) bad.push("書き取り以外が語ぜんぶになった");
  return bad;
}

function mutate(src, from, to, name) {
  if (!src.includes(from)) { console.error("✋ 偽物「" + name + "」を作れませんでした: " + from); process.exit(3); }
  return src.replace(from, to);
}
const FAKES = [
  ["助詞も送りがなにする", () => mutate(JS, "free.indexOf(got.charAt(n - 1)) < 0", "false", "助詞")],
  ["一段動詞の る を落とさない", () => mutate(JS, "n = L - 1;   // 一段動詞", "n = L;   // 一段動詞", "一段")],
  ["となりの漢字を付けない", () => mutate(JS, "var o = ownPartsOf(it, g, k, wd) || { pre: \"\", post: \"\" };", "var o = { pre: \"\", post: \"\" };", "となり")],
  ["割れたら短いほう", () => mutate(JS, "return b.length - a.length;", "return a.length - b.length;", "割れ")],
  ["書き取り以外も語にする", () => mutate(JS, "if (f !== \"kaki\") return null;", "", "書き取り以外")],
];

console.log("=== 入口の自己テスト（落ちたら結果を出さずに止まります） ===");
let selfBad = 0;
for (const [name, make] of FAKES) {
  const r = run(make());
  console.log(`  ${r.length ? "OK" : "NG"}  ${name} → ${r.length ? "鳴った（" + r[0] + "）" : "鳴らなかった"}`);
  if (!r.length) selfBad++;
}
if (selfBad) { console.log(`\n✋ 自己テストが ${selfBad} 件落ちました。検査が信用できないので、結果は出しません。`); process.exit(3); }

console.log("\n=== 本物の kanken-practice.js ===");
const bad = run(JS);
bad.forEach((b) => console.log("  ✗ " + b));
console.log(bad.length ? `\n✋ ${bad.length} 件 ちがいます` : `  ${CASES.length + 1} 件\n\n★ 全部通りました`);
process.exit(bad.length ? 1 : 0);
