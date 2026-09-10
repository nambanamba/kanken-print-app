/* 例語（ex）の位置ずれを直す。
 *
 * ⚠️ **何が起きていたか**
 *   `kanken-gen.js` の `kunWords()` は **`ex` を `on.length + kun の添字`** で引いている。
 *   つまり **`ex` は on と kun の**すべての**読みに1つずつ対応している前提**。
 *   ところがマスタは、**例語が空の読みを `ex` からだけ落としていた。**
 *   → **48字で位置がずれ、訓読みに別の語がぶら下がっていた。**
 *
 * ⚠️ **幸い誤答は出ていない。**`kunWords()` に
 *   「語の残りが読みの末尾と一致すること」という検査があり、ずれた組は弾かれる。
 *   **代わりに、その字は書き取り・読みの出題から静かに消える**（＝取りこぼし）。
 *
 * 直し方: 元データ（常用漢字表のパース結果）から **読み1つにつき ex を1つ**（空なら ""）で組み直す。
 *   ⚠️ **on / kun 自体は触らない。**マスタの読みは既に検証されているので、動かさない。
 *   ⚠️ **id と k も触らない**（C-5）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const MASTER = path.join(ROOT, "kanken-kanji.js");
const JOYO = path.join(ROOT, "元データ", "joyo_parsed.json");

const src = fs.readFileSync(MASTER, "utf8");
const head = src.slice(0, src.indexOf("const KANJI_MASTER = ["));
const body = src.slice(src.indexOf("const KANJI_MASTER = [") + "const KANJI_MASTER = ".length);
const jsonPart = body.slice(0, body.lastIndexOf("]") + 1);
const tail = body.slice(body.lastIndexOf("]") + 1);
const arr = JSON.parse(jsonPart);
const joyo = JSON.parse(fs.readFileSync(JOYO, "utf8"));

let fixed = 0, skipped = [], mismatch = [];
for (const r of arr) {
  const j = joyo[r.k];
  if (!j) { skipped.push(r.k + "(元データに無い)"); continue; }
  // ★並びではなく **読みの値** で対応づける。
  //   ⚠️ 元データが正しいとは限らない。実例: 梨 の kun が元データでは ["なし","なぞ"] になっている
  //      （「なぞ」は梨の読みではない。パースの取りこぼし）。**マスタの読みのほうが正しい。**
  //   → **マスタの読みを正として、その読みの例語を元データから引く。**
  //      元データに無い読みは、例語を "" にする（**推測で埋めない**）。
  const pick = (pairs) => {
    const used = new Set();
    return (rd) => {
      const arr2 = pairs || [];
      for (let i = 0; i < arr2.length; i++) {
        if (arr2[i][0] === rd && !used.has(i)) { used.add(i); return arr2[i][1] || ""; }
      }
      return "";
    };
  };
  const onEx = pick(j.on), kunEx = pick(j.kun);
  const want = [...(r.on || []).map(onEx), ...(r.kun || []).map(kunEx)];
  // 元データに1つも例語が無い読みばかりなら、触らずに記録だけする
  if (want.length !== (r.on || []).length + (r.kun || []).length) { mismatch.push(r.k); continue; }
  if (JSON.stringify(want) !== JSON.stringify(r.ex || [])) { r.ex = want; fixed++; }
}

console.log(`直した字: ${fixed}`);
if (mismatch.length) console.log(`⚠️ 読みが元データと違うので触らなかった字: ${mismatch.length}  ${mismatch.slice(0,10).join(" ")}`);
if (skipped.length) console.log(`⚠️ 元データに無い字: ${skipped.length}  ${skipped.slice(0,10).join(" ")}`);

const bad = arr.filter(r => (r.ex || []).length !== (r.on || []).length + (r.kun || []).length);
console.log(`★直したあと、まだ数が合わない字: ${bad.length}  ${bad.slice(0,10).map(r=>r.k).join(" ")}`);

if (process.argv.includes("--write")) {
  const out = head + "const KANJI_MASTER = " +
    "[\n" + arr.map(r => JSON.stringify(r, null, 1)).join(",\n") + "\n]" + tail;
  fs.writeFileSync(MASTER, out, "utf8");
  console.log("kanken-kanji.js を書きかえました。");
} else {
  console.log("（--write を付けると書きかえます）");
}
