/* ★画像の関門。**画像・PDF を1つも追跡させない。本の画像を文字列で埋めこんだファイルも追跡させない。**
 *
 *   node tools/check_no_images.mjs         … 追跡ファイルを調べる（見つかったら終了コード1）
 *
 * なぜあるか（2026-09-11）:
 *   ・本の図（何画目の太い画など）を切り出して出す。**画像は本の複製**なので、暗号の中にだけ置く
 *   ・漏れ検査（check_leak.mjs）は**文字しか見ない**。画像に写った問題文は素通りする
 *     実際に、前の撮影 tools/shot_paper_book.png に本の問題文と答えが写ったまま公開されていた
 *   → **例外を作らない。**アプリの画面の撮影も、一時領域に出す（smoke-test --shot）
 *
 * 見るもの:
 *   ① 拡張子が画像・PDF のファイル（png jpg jpeg gif webp bmp heic tif tiff pdf svg）
 *   ② 追跡されている文字のファイルに「data:image/」が入っている（画像を base64 で埋めこんだもの）
 *      ※ 暗号文 kanken-quiz.enc.js の中身は暗号なので「data:image/」は現れない。現れたら平文が混ざっている
 *      ※ この関門の説明文そのものは除く（このファイル）
 * 毎回まず自己試験（わざと入れた1件を捕まえるか）をしてから本番を見る（D-17）。
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const IMG = /\.(png|jpe?g|gif|webp|bmp|heic|tiff?|pdf|svg)$/i;
const SELF = path.relative(ROOT, fileURLToPath(import.meta.url)).split(path.sep).join("/");

function scan(files, readFile) {
  const bad = [];
  for (const f of files) {
    if (IMG.test(f)) { bad.push(f + "  ← 画像・PDFのファイル"); continue; }
    if (f === SELF) continue;
    const txt = readFile(f);
    if (txt === null) { bad.push(f + "  ← 読めない（黙って飛ばさない）"); continue; }
    if (txt.includes("data:image/")) bad.push(f + "  ← 画像を埋めこんだ文字列（data:image/）");
  }
  return bad;
}

/* 自己試験: 画像名1件と data:image 入り1件を混ぜ、両方とも捕まえること */
const probe = scan(["a.png", "b.txt", "c.js"], f => f === "c.js" ? 'x="data:image/png;base64,AAAA"' : "ok");
if (!(probe.length === 2 && probe[0].startsWith("a.png") && probe[1].startsWith("c.js"))) {
  console.log("★★ 自己試験に失敗: この関門は鳴りません。配信しないでください。");
  process.exit(2);
}
console.log("自己試験: OK（わざと入れた2件を捕まえた）");

const tracked = execSync("git ls-files -z", { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
const bad = scan(tracked, f => {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return null;
  const buf = fs.readFileSync(p);
  return buf.includes(0) ? "" : buf.toString("utf8");   // バイナリは文字として見ない（①で拡張子を見ている）
});
console.log(`追跡ファイル ${tracked.length} 本を調べました。`);
if (bad.length) {
  console.log(`★★ 画像が ${bad.length} 件あります。**push しないでください。**`);
  bad.forEach(b => console.log("  " + b));
  process.exit(1);
}
console.log("★ 画像 0 件。");
