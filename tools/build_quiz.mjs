/* 平文の書き起こしJSONを、暗号化した1ファイルに固める。
 *
 *   node tools/build_quiz.mjs "<平文のフォルダ>" [...さらにフォルダ]
 *   例) node tools/build_quiz.mjs "G:/マイドライブ/四谷大塚/司令塔/漢検書き起こし_ドリル/data" \
 *                                 "G:/マイドライブ/四谷大塚/司令塔/漢検書き起こし_ノート/data"
 *
 * ⚠️⚠️ **平文をこのリポジトリに置かないこと。**
 *   平文は `司令塔\漢検書き起こし_*\` にあり、そこはどのリポジトリにも属していない。
 *   この道具は「外から読んで、暗号文だけをここに書く」ためのもの。
 *
 * ⚠️ **合言葉は引数にも環境変数のファイルにも残さない。**標準入力から受け取る。
 *   （コマンド履歴に残ると、リポジトリに書くのと大差なくなる）
 *
 * 出力: kanken-quiz.enc.js  … Base64のみ。これはコミットしてよい
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { webcrypto as crypto } from "node:crypto";
import { fileURLToPath } from "node:url";

/* ⚠️ import.meta.url を手で剥がすとパスが壊れる。
   このプロジェクトのパスには日本語が入っていて、URLでは %E3%83%9E... とエンコードされる。
   **必ず fileURLToPath を使うこと。**（引き継ぎ.md にも同じハマりどころが書いてある） */
const HERE = path.dirname(fileURLToPath(import.meta.url));

const ITER = 200000;   // ★kanken-crypto.js の PBKDF2_ITER と必ず同じ値にすること
const OUT = path.resolve(HERE, "..", "kanken-quiz.enc.js");

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error("使い方: node tools/build_quiz.mjs <平文フォルダ> [...]"); process.exit(2); }

/* 平文を読む。★このリポジトリの中を読ませない（事故防止） */
const REPO = path.resolve(HERE, "..");
const units = [];
for (const d of dirs) {
  const abs = path.resolve(d);
  if (abs.startsWith(REPO)) {
    console.error("★中止: 平文フォルダがリポジトリの中にあります → " + abs);
    console.error("  平文はリポジトリの外（司令塔\漢検書き起こし_*）に置いてください。");
    process.exit(3);
  }
  if (!fs.existsSync(abs)) { console.error("フォルダがありません: " + abs); process.exit(2); }
  for (const f of fs.readdirSync(abs).filter(x => x.endsWith(".json")).sort()) {
    units.push(JSON.parse(fs.readFileSync(path.join(abs, f), "utf8")));
  }
  console.log(`読みました: ${abs} (${fs.readdirSync(abs).filter(x => x.endsWith(".json")).length} ファイル)`);
}
if (!units.length) { console.error("★中止: 単元が0件です。"); process.exit(3); }

const items = units.reduce((a, u) => a + ((u.groups || []).reduce((b, g) => b + (g.items || []).length, 0) || (u.items || []).length), 0);
console.log(`単元 ${units.length} 件 / 設問 ${items} 件`);

/* 合言葉を標準入力から。★履歴に残さない */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const pass = await new Promise(r => rl.question("合言葉を入力してください（画面に出ます。人に見られていないか確認して）: ", a => { rl.close(); r(a); }));
if (!pass || pass.length < 4) { console.error("★中止: 合言葉が短すぎます。"); process.exit(3); }

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(units)));

const b64 = b => Buffer.from(b).toString("base64");
fs.writeFileSync(OUT,
`/* 本の問題データ（暗号化ずみ）。自動生成: tools/build_quiz.mjs
   ⚠️ 手で編集しないこと。平文は 司令塔\漢検書き起こし_* にあります。
   ⚠️ この仕組みは「検索やクローラに拾われないこと」が目的です。
      鍵はブラウザに渡るので、本気で解析する相手には勝てません（kanken-crypto.js 参照）。 */
var KANKEN_QUIZ_ENC = {
  v: 1,
  iter: ${ITER},
  salt: ${JSON.stringify(b64(salt))},
  iv: ${JSON.stringify(b64(iv))},
  data: ${JSON.stringify(b64(cipher))}
};
`, "utf8");
console.log(`書きました: ${OUT}`);
console.log(`  暗号文 ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
console.log("\n★平文はリポジトリに入っていません。push 前に git status で確認してください。");
