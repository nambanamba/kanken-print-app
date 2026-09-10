/* 紙を実際に出力して、PNGで保存する。**照合する人が自分で走らせるための道具。**
 *
 *   set KANKEN_PASS=<合言葉>
 *   node tools/print_sheets.mjs --out "<出力先フォルダ>" [単元id ...]
 *
 *   例) node tools/print_sheets.mjs --out "%TEMP%\kanken_sheets" dr_25 dr_08 dr_01 dr_54 today
 *   単元idを省くと、照合ずみの全単元＋`today` を出します。
 *   `today` … 単元を指定せず、**その日ぶんの通常の1枚**（実際にお子さんが受け取る形）
 *
 * ⚠️ **出力先は必ず `--out` で指定してください。**既定はありません。
 *    `kanken-print-app` の中に書かせないためです（照合担当はここに書き込めない）。
 * ⚠️ **合言葉は環境変数から読みます。**引数に書くとコマンド履歴に残ります。
 *    合言葉はリポジトリに書かれていません。**司令塔が持っています。**
 *
 * 出るもの（1単元につき2枚）:
 *   <単元id>.png       … 紙の全体（問題＋折り線＋答え）
 *   <単元id>_info.json … その紙の中身を機械で照合するための情報
 *                        （行ごとの 問番号／書くマスの数／マスの読み／答え／扱う漢字）
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
if (oi < 0 || !args[oi + 1]) {
  console.error("使い方: node tools/print_sheets.mjs --out <出力先フォルダ> [単元id ...]");
  console.error("  例) node tools/print_sheets.mjs --out \"%TEMP%\kanken_sheets\" dr_25 today");
  process.exit(2);
}
const OUT = path.resolve(args[oi + 1]);
if (OUT.startsWith(ROOT)) {
  console.error("★中止: 出力先が kanken-print-app の中です → " + OUT);
  console.error("  リポジトリの外（一時領域など）を指定してください。");
  process.exit(3);
}
fs.mkdirSync(OUT, { recursive: true });

const pass = process.env.KANKEN_PASS;
if (!pass) {
  console.error("★中止: 環境変数 KANKEN_PASS に合言葉を入れてください。");
  console.error("  合言葉はリポジトリに書かれていません。司令塔が持っています。");
  process.exit(2);
}
let want = args.filter((a, i) => i !== oi && i !== oi + 1);

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, r) => {
  if (q.url === "/favicon.ico") { r.writeHead(204); return r.end(); }
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html");
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));

const b = await launchBrowser(await getChromium());
const p = await b.newPage();
p.on("dialog", d => d.accept());
const errs = [];
p.on("pageerror", e => errs.push(String(e)));
await p.goto("http://127.0.0.1:" + srv.address().port + "/index.html", { waitUntil: "networkidle" });

await p.click('.tab[data-page="setei"]');
await p.fill("#q-pass", pass);
await p.click('button:has-text("よみこむ")');
try {
  await p.waitForFunction(() => window.BOOK_UNITS !== null, { timeout: 30000 });
} catch {
  console.error("★中止: 合言葉で復号できませんでした。");
  await b.close(); srv.close(); process.exit(3);
}
const stats = await p.evaluate(() => bookStats());
console.log(`取り込み: ${stats.units}単元 / ${stats.items}問`);

await p.click('.tab[data-page="kyou"]');
await p.click('button:has-text("はじめる")');

if (!want.length) {
  want = await p.evaluate(() => BOOK_UNITS.map(u => u.unitId).filter(isVerifiedUnit));
  want.push("today");
}

// ★本来の planToday を控えておく。**単元を指定したあと必ず戻す。**
//   戻さないと "today"（＝その日ぶんの通常の1枚）が、直前に指定した単元のまま出る。
//   実際にそうなって、today と dr_54 が同じ紙になった。
await p.evaluate(() => { window.__planTodayOrig = window.planToday; });

for (const u of want) {
  // ★測る前に印刷用のCSSを当てる。
  //   `.p-sheet` の指定は @media print の中にあるので、画面のままだと
  //   高さも折り線の位置も 0 になり、**測った値が意味を持たない。**
  await p.emulateMedia({ media: "print" });
  await p.setViewportSize({ width: 794, height: 1123 });

  const info = await p.evaluate((u) => {
    window.planToday = (u === "today")
      ? window.__planTodayOrig
      : () => ({ unit: u, from: 1, to: 999, n: 999, day: 1, parts: 1, part: 1,
                 mat: u.startsWith("tn") ? "tn" : "dr", label: u, pages: "?" });
    printSessionPractice();
    const region = document.getElementById("print-region");
    const sheets = [...region.querySelectorAll(".p-sheet")];
    const rows = [...region.querySelectorAll(".p-body tr")].map(tr => ({
      no: tr.querySelector(".p-no") ? tr.querySelector(".p-no").textContent.trim() : null,
      q: tr.querySelector(".p-q") ? tr.querySelector(".p-q").textContent.trim() : null,
      slots: tr.querySelectorAll(".p-slot").length,
      slotLabels: [...tr.querySelectorAll(".p-slotlab")].map(e => e.textContent)
    }));
    const key = region.querySelector(".p-key");
    return {
      unit: u,
      verified: u === "today" ? null : isVerifiedUnit(u),
      sheets: sheets.length,
      sheetHeights: sheets.map(s => Math.round(s.getBoundingClientRect().height)),
      foldOffsets: sheets.map(s => {
        const f = s.querySelector(".p-fold");
        return f ? Math.round(f.getBoundingClientRect().top - s.getBoundingClientRect().top) : -1;
      }),
      rows,
      totalSlots: rows.reduce((a, r) => a + r.slots, 0),
      answerBlock: key ? key.textContent.replace(/\s+/g, " ").trim() : null,
      bodyText: region.querySelector(".p-body") ? region.querySelector(".p-body").textContent : ""
    };
  }, u);

  // ★中身が無いなら、PNGも info も作らない。
  //   作ると「1枚出た」ように見えて、**中身が前の単元のまま**でも気づけない。
  if (!info.rows.length) {
    await p.emulateMedia({ media: null });
    console.log(`  ${u}: 照合ずみ=${info.verified === null ? "-" : (info.verified ? "○" : "×")} / 出るものがありません（0枚）`);
    continue;
  }
  await p.screenshot({ path: path.join(OUT, u + ".png"), fullPage: true });
  await p.emulateMedia({ media: null });

  fs.writeFileSync(path.join(OUT, u + "_info.json"), JSON.stringify(info, null, 1), "utf8");
  console.log(`  ${u}: 照合ずみ=${info.verified === null ? "-" : (info.verified ? "○" : "×")}` +
              ` / ${info.sheets}枚 / 行${info.rows.length} / 書くマス計${info.totalSlots}`);
}

console.log(`\n出力先: ${OUT}`);
console.log("JSエラー:", errs.length ? errs.join(" | ") : "なし");
await b.close(); srv.close();
