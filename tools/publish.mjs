/* ★配信の関門。**push はこれを通すこと。**
 *   git add <出すファイル>                   … ★先に自分で add する（2026-09-11〜。git add -A はしない）
 *   node tools/publish.mjs "コミットメッセージ"
 *   node tools/publish.mjs -F メッセージファイル
 *   node tools/publish.mjs --dry     … 検査だけして、commit も push もしない
 *
 * ⚠️⚠️ **なぜ `.git/hooks/` ではなく `tools/` に置くのか**
 *   フックは `.git/hooks/` にあり、**リポジトリに入りません。**
 *   クローンし直すと消えます。**消えても何も言わないので、「入れたつもり」になります。**
 *   → **黙って効かなくなり、しかも効いているように見える。**
 *     これは `check_leak.mjs` が日本語ファイル名を黙って飛ばしていたのと**まったく同じ形**です。
 *   **`tools/` はリポジトリに入るので、クローンしても消えません。**
 *   ⚠️ フックを併用しても構いませんが、**それは保険です。**
 *      **フックが無い環境でも守られる形が本体。**
 *
 * 何を守るか（2026-09-11、実際に平文を1件漏らした）:
 *   ① 検出器の自己試験 … **鳴らない検出器で「漏れ0件」と言わない**
 *   ② 平文の漏れ走査   … 追跡ファイル全部（`.md` 含む）
 *   ③ 除外フォルダの混入 … `公式資料` `元データ` `情報` `書き起こし`
 *   ④ テスト
 *   **全部通ったときだけ commit / push する。**
 */
import { execSync, execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const args = process.argv.slice(2);
const dry = args.includes("--dry");

function run(label, cmd, cmdArgs) {
  process.stdout.write("― " + label + " … ");
  try {
    const out = execFileSync(cmd, cmdArgs, { cwd: ROOT, encoding: "utf8" });
    console.log("OK");
    return out;
  } catch (e) {
    console.log("★★ 止めました");
    console.log((e.stdout || "") + (e.stderr || ""));
    process.exit(1);
  }
}

/* ⓪ 「テストするもの」と「commit するもの」を一致させる（2026-09-11 取り込み担当 claude-91 [2a9e1f]）
 *   ⚠️ 以前はここで `git add -A` していた。**同じ作業ツリーを2人（アプリ担当・取り込み担当）が使うので、
 *      相手の作業途中のファイルまで commit・push されていた。**
 *   → **commit するのは「先に git add したもの」だけ。**
 *   → 未ステージの変更・追跡外のファイルがあったら止める。
 *     （テストは作業ツリーで走るので、未ステージがあると「テストしたもの」と「配信するもの」がずれる）
 *   相手の作業途中があって自分のぶんだけ出したいときは、`git worktree` で別のツリーを作ってそこで通す。 */
function treeState() {
  const lines = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
  return {
    staged: lines.filter(l => l[0] !== " " && l[0] !== "?"),
    dirty: lines.filter(l => l[1] !== " " || l.startsWith("??"))
  };
}
function checkTree(when) {
  const t = treeState();
  if (t.dirty.length) {
    console.log(`★★ 止めました（${when}）: 未ステージの変更か、追跡外のファイルがあります。`);
    console.log("    テストした中身と commit する中身がずれるので、配信しません。");
    t.dirty.forEach(l => console.log("    " + l));
    console.log("    自分のぶんは git add する／他人の作業途中なら git worktree で別のツリーから通す。");
    process.exit(1);
  }
  return t;
}

console.log("=== 配信前の関門 ===");
process.stdout.write("― 作業ツリーの状態 … ");
if (dry) {
  const t = treeState();
  console.log(t.dirty.length ? `（--dry なので続けます）★未ステージ・追跡外 ${t.dirty.length} 件。このままでは本番は止まります` : "OK");
} else {
  const t = checkTree("検査の前");
  if (!t.staged.length) { console.log("★★ 止めました: git add されたものがありません。"); process.exit(1); }
  console.log(`OK（ステージ ${t.staged.length} 件・未ステージ 0 件）`);
  t.staged.forEach(l => console.log("    " + l));
}

/* ① ② 平文の漏れ（check_leak.mjs が中で自己試験もする） */
const leak = run("平文の漏れ走査（自己試験つき）", process.execPath, [path.join(HERE, "check_leak.mjs")]);
process.stdout.write(leak.split("\n").filter(Boolean).map(l => "    " + l).join("\n") + "\n");

/* ③ 除外フォルダが追跡されていないか */
process.stdout.write("― 除外フォルダの混入 … ");
const tracked = execSync("git ls-files -z", { cwd: ROOT, encoding: "utf8" }).split("\0").filter(Boolean);
const bad = tracked.filter(f => /公式資料|元データ|情報|書き起こし/.test(f));
if (bad.length) {
  console.log("★★ 止めました");
  bad.forEach(f => console.log("    " + f));
  process.exit(1);
}
console.log(`OK（追跡 ${tracked.length} 本）`);

/* ④ テスト */
run("テスト（smoke-test）", process.execPath, [path.join(HERE, "smoke-test.mjs")]);
run("テスト（test_gen）", process.execPath, [path.join(HERE, "test_gen.js")]);

if (dry) { console.log("\n--dry なので、commit も push もしていません。"); process.exit(0); }

/* commit / push */
const fi = args.indexOf("-F");
const msg = fi >= 0 ? null : args.filter(a => a !== "--dry")[0];
const msgFile = fi >= 0 ? args[fi + 1] : null;
if (!msg && !msgFile) {
  console.log("\nコミットメッセージがありません。");
  console.log('  node tools/publish.mjs "メッセージ"');
  console.log("  node tools/publish.mjs -F メッセージファイル");
  console.log("  node tools/publish.mjs --dry   … 検査だけ");
  process.exit(2);
}
/* ★テストの間に作業ツリーが変わっていないか、もう一度見る（C-4c: 検査と実行の間にも中身は変わりうる） */
checkTree("commit の直前");

console.log("\n― commit …");
if (msgFile) execFileSync("git", ["commit", "-F", msgFile], { cwd: ROOT, stdio: "inherit" });
else execFileSync("git", ["commit", "-m", msg], { cwd: ROOT, stdio: "inherit" });

/* HEAD:master … worktree の別ブランチから通しても、公開ブランチ（master）に出るように */
console.log("― push …");
execFileSync("git", ["push", "origin", "HEAD:master"], { cwd: ROOT, stdio: "inherit" });
console.log("\n★ 配信しました。");
console.log("⚠️ 公開への反映は push とは別です。実際に取得して確かめてください。");
