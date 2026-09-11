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
import { execFileSync } from "node:child_process";
import { webcrypto as crypto } from "node:crypto";
import { fileURLToPath } from "node:url";

/* ⚠️ import.meta.url を手で剥がすとパスが壊れる。
   このプロジェクトのパスには日本語が入っていて、URLでは %E3%83%9E... とエンコードされる。
   **必ず fileURLToPath を使うこと。**（引き継ぎ.md にも同じハマりどころが書いてある） */
const HERE = path.dirname(fileURLToPath(import.meta.url));

const ITER = 200000;   // ★kanken-crypto.js の PBKDF2_ITER と必ず同じ値にすること
const OUT = path.resolve(HERE, "..", "kanken-quiz.enc.js");

/* ★引数なしで走れるようにする（単元が増えるたびに手でパスを打つと、そこが律速になる）。
   ⚠️ 既定のパスは「このリポジトリの1つ上の 司令塔\漢検書き起こし_*\data」。
      フォルダが動いたらここを直すこと。**絶対パスを直書きしない**（D-11b）。 */
const DEFAULT_DIRS = [
  path.resolve(HERE, "..", "..", "司令塔", "漢検書き起こし_ドリル", "data"),
  path.resolve(HERE, "..", "..", "司令塔", "漢検書き起こし_ノート", "data")
];
let dirs = process.argv.slice(2).filter(a => a !== "--new-pass");
if (!dirs.length) {
  dirs = DEFAULT_DIRS.filter(d => fs.existsSync(d));
  if (!dirs.length) {
    console.error("平文フォルダが見つかりません。既定の場所:");
    DEFAULT_DIRS.forEach(d => console.error("  " + d));
    console.error("別の場所なら: node tools/build_quiz.mjs <平文フォルダ> [...]");
    process.exit(2);
  }
  console.log("既定の平文フォルダを使います（引数で上書きできます）");
}

/* 平文を読む。★このリポジトリの中を読ませない（事故防止） */
const REPO = path.resolve(HERE, "..");
const units = [];
const unitFiles = [];   // 図の切り出しに渡す
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
    unitFiles.push(path.join(abs, f));
  }
  console.log(`読みました: ${abs} (${fs.readdirSync(abs).filter(x => x.endsWith(".json")).length} ファイル)`);
}
if (!units.length) { console.error("★中止: 単元が0件です。"); process.exit(3); }

const items = units.reduce((a, u) => a + ((u.groups || []).reduce((b, g) => b + (g.items || []).length, 0) || (u.items || []).length), 0);
console.log(`単元 ${units.length} 件 / 設問 ${items} 件`);

/* ★図（items[].figure = {page, box}）を本のPDFから切り出し、figureImg（data URI）として入れる
   （2026-09-11 ユーザー承認「おねがいします、いれて」・司令塔決定。切り出しは tools/crop_figures.py＝claude-eb）
   ⚠️ 画像は本の複製。**暗号文の中にだけ入れる。**ファイルは作らない（crop_figures.py は標準出力に JSON を出すだけ）。
   ⚠️ **黙って落とさない。**figure があるのに画像が来なかった問・頼んでいない画像が来た問があれば止める。
      アプリは figureImg がある問題だけを出すので、落ちると「図が要る問が静かに消える」ことになる。 */
const figItems = new Map(), figFiles = [];
units.forEach((u, i) => {
  let has = false;
  for (const g of u.groups || []) for (const it of g.items || []) if (it.figure) { figItems.set(it.id, it); has = true; }
  if (has) figFiles.push(unitFiles[i]);
});
if (figItems.size) {
  let out;
  try {
    // ⚠️ 図を持つ単元のファイルだけ渡す（crop_figures.py は PDF を知らない教材＝ノートが来ると止まる）
    out = execFileSync("python", [path.join(HERE, "crop_figures.py"), "--json", ...figFiles],
                       { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "inherit"] });
  } catch (e) {
    console.error("★中止: 図の切り出し（crop_figures.py）が失敗しました。本のPDFの場所（リポジトリの1つ上の 情報\\）を確かめてください。");
    process.exit(3);
  }
  const figs = JSON.parse(out);
  const missing = [...figItems.keys()].filter(id => !(typeof figs[id] === "string" && figs[id].startsWith("data:" + "image/png;base64,") && figs[id].length > 1000));
  const extra = Object.keys(figs).filter(id => !figItems.has(id));
  if (missing.length || extra.length) {
    console.error(`★中止: 図の数が合いません。figure ${figItems.size} 問／切り出し ${Object.keys(figs).length} 枚`);
    missing.forEach(id => console.error("  画像が来ない: " + id));
    extra.forEach(id => console.error("  頼んでいない画像: " + id));
    process.exit(3);
  }
  for (const [id, it] of figItems) it.figureImg = figs[id];
  console.log(`図: figure ${figItems.size} 問 → 切り出し ${figItems.size} 枚を入れました（${[...new Set([...figItems.keys()].map(id => id.split("_").slice(0, 2).join("_")))].join("・")}）`);
} else {
  console.log("図: figure を持つ問題はありません");
}

/* 合言葉を標準入力から。★履歴に残さない */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const pass = await new Promise(r => rl.question("合言葉を入力してください（画面に出ます。人に見られていないか確認して）: ", a => { rl.close(); r(a); }));
if (!pass || pass.length < 4) { console.error("★中止: 合言葉が短すぎます。"); process.exit(3); }

const enc = new TextEncoder();

/* ★合言葉が「いま配信中の暗号文」を開けるか先に試す（2026-09-11 取り込み担当 claude-91 [2a9e1f]）
   ⚠️ 実際に起きた: Windows PowerShell 5.1 で `$env:KANKEN_PASS | node build_quiz.mjs` とパイプすると、
      日本語の合言葉が ASCII に落ちて「?」になり、**違う合言葉で暗号化された暗号文が黙ってできた。**
      アプリでは誰も開けない。復号して突き合わせる道具（diff_enc.mjs）で初めて気づいた。
   → 前の暗号文を開けない合言葉では作らない。**合言葉を変えるときだけ** --new-pass を付ける。 */
/* 基準は「コミット済みの暗号文」（作業ツリーのものは、壊れた作り直しで上書きされているかもしれない） */
let committed = null;
try { committed = execFileSync("git", ["show", "HEAD:kanken-quiz.enc.js"], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch (e) {}
if (committed && !process.argv.includes("--new-pass")) {
  const src = committed;
  const pick = k => (src.match(new RegExp(k + ':\\s*"([^"]*)"')) || [])[1];
  const it = Number((src.match(/iter:\s*(\d+)/) || [])[1]);
  const b = s => Uint8Array.from(Buffer.from(s, "base64"));
  try {
    const pb = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
    const pk = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b(pick("salt")), iterations: it, hash: "SHA-256" },
      pb, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: b(pick("iv")) }, pk, b(pick("data")));
    console.log("合言葉: 配信中の暗号文を開けました（同じ合言葉です）");
  } catch (e) {
    console.error("★中止: この合言葉では、配信中の暗号文を開けません。");
    console.error("  PowerShell 5.1 のパイプだと日本語が「?」に化けます。bash から printf で渡してください。");
    console.error("  合言葉そのものを変えるときだけ --new-pass を付けてください。");
    process.exit(3);
  }
}

const salt =crypto.getRandomValues(new Uint8Array(16));
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
