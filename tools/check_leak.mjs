/* 公開リポジトリに、問題集の中身が漏れていないかを見る。
 *   node tools/check_leak.mjs
 *
 * ⚠️ **なぜ要るか**
 *   このリポジトリは公開（GitHub Pages）。`.gitignore` で除外しているのは
 *   `公式資料/` と `元データ/` だけで、**`.md` は全部追跡されている。**
 *   `作業メモ.md` も `引き継ぎ.md` も世界中から読める。
 *   問題文をアプリでは暗号化して置いているのに、作業メモに平文で書いたら意味がない。
 *
 * ⚠️ **目視では捕まらない**
 *   `git status` / `git show --stat` は「見覚えのない .md が増えた」ことには気づけるが、
 *   **「見覚えのある .md の中身が増えた」ことには気づけない。**だから機械で見る。
 *
 * 何を見るか:
 *   追跡されている全ファイル（.md 含む）に、平文の書き起こしJSONの
 *   **問題文・答え・解説の文字列**が出てこないこと。
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PLAIN_DIRS = [
  path.resolve(ROOT, "..", "司令塔", "漢検書き起こし_ドリル", "data"),
  path.resolve(ROOT, "..", "司令塔", "漢検書き起こし_ノート", "data")
];

/* 平文から「これが出てきたら漏れ」という文字列を集める */
const needles = new Map();   // 文字列 -> どこ由来か
let units = 0;
for (const d of PLAIN_DIRS) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(x => x.endsWith(".json"))) {
    const u = JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
    units++;
    const src = u.unitId || f;
    for (const g of (u.groups || [])) {
      if (g.instruction) needles.set(g.instruction, src + " の指示文");
      for (const it of (g.items || [])) {
        // ★短すぎる文字列は誤検出のもと。8文字以上だけ見る
        if (it.text && it.text.length >= 8) needles.set(it.text, src + " の問題文 no." + it.no);
        if (it.onePoint && it.onePoint.length >= 8) needles.set(it.onePoint, src + " の解説 no." + it.no);
        if (it.note && it.note.length >= 8) needles.set(it.note, src + " の注意 no." + it.no);
        for (const a of (it.answers || [])) {
          for (const ng of (a.ng || [])) if (ng.length >= 3) needles.set(ng, src + " の×例 no." + it.no);
        }
      }
    }
  }
}

if (!needles.size) {
  console.log("平文の書き起こしが見つかりません（まだ0単元）。検査するものがありません。");
  process.exit(0);
}
console.log(`平文 ${units} 単元から、検査する文字列 ${needles.size} 種を集めました。`);

/* 追跡されている全ファイルを見る */
const tracked = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split("\n").map(s => s.trim()).filter(Boolean);

const hits = [];
let scanned = 0;
for (const rel of tracked) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const st = fs.statSync(abs);
  if (st.size > 8 * 1024 * 1024) continue;
  let body;
  try { body = fs.readFileSync(abs, "utf8"); } catch { continue; }
  scanned++;
  for (const [needle, src] of needles) {
    if (body.includes(needle)) hits.push({ file: rel, src, needle: needle.slice(0, 30) });
  }
}

console.log(`追跡ファイル ${scanned} 本を走査しました。`);
if (!hits.length) {
  console.log("★ 漏れ 0 件。");
  process.exit(0);
}
console.log(`★★ 漏れ ${hits.length} 件。**push しないでください。**`);
hits.forEach(h => console.log(`  ${h.file} ← ${h.src}  「${h.needle}…」`));
process.exit(1);
