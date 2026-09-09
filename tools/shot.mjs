// 画面と印刷物のスクリーンショットを撮る。 使い方: node tools/shot.mjs
// ★見た目は「そう見える」だけで条件どおりとは限らないので、実描画幅も数値で出す（確認ポイント D-9）。
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chromium = await getChromium();
const MIME = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, r) => {
  // Edge / Chrome は自分から /favicon.ico を取りに来る（smoke-test.mjs と同じ理由で204を返す）
  if (q.url === "/favicon.ico") { r.writeHead(204); return r.end(); }
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html");
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const base = "http://127.0.0.1:" + srv.address().port;

const b = await launchBrowser(chromium);
console.log("ブラウザ:", b._kankenChannel);
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on("dialog", d => d.accept());
await p.goto(base + "/index.html", { waitUntil: "networkidle" });
console.log("実描画幅:", await p.evaluate(() => window.innerWidth) + "px");

await p.click('.tab[data-page="kyou"]');
await p.screenshot({ path: "tools/shot_kyou_start.png", fullPage: true });
await p.click('button:has-text("はじめる")');

// 前半（選択式）の画面を撮る
await p.screenshot({ path: "tools/shot_kyou_select.png", fullPage: true });

// 最後まで進める。前半→切りかえ→後半→終了
let g = 0, shotSwitch = false, shotKaki = false;
while (g++ < 400) {
  const st = await p.evaluate(() => ({
    done: SESSION.done, phase: SESSION.phase, f: (SESSION.items[SESSION.pos] || {}).field
  }));
  if (st.done) break;
  if (st.phase === "switch") {
    // ★前半→後半の切りかえ画面（頭を切りかえる一拍）
    if (!shotSwitch) { shotSwitch = true; await p.screenshot({ path: "tools/shot_kyou_switch.png", fullPage: true }); }
    await p.click('button:has-text("すすむ")');
    continue;
  }
  if (st.f === "kaki") {
    // 書き取りの自己申告の画面
    if (!shotKaki) { shotKaki = true; await p.screenshot({ path: "tools/shot_kyou_kaki.png", fullPage: true }); }
    await p.click('button:has-text("あやしい")');
  } else {
    await p.evaluate(() => document.querySelectorAll("#ky-choices .ky-btn")[0].click());
    await p.waitForTimeout(650);
  }
}
await p.screenshot({ path: "tools/shot_kyou_end.png", fullPage: true });

await p.click('button:has-text("この字の練習プリントを印刷")');
await p.click('.tab[data-page="kiroku"]');
for (const i of [0, 3]) await p.locator(".mark").nth(i).click();
await p.screenshot({ path: "tools/shot_kiroku.png", fullPage: true });
await p.click('button:has-text("この字を記録する")');
await p.waitForTimeout(300);
await p.click('.tab[data-page="ouen"]');
await p.screenshot({ path: "tools/shot_ouen.png", fullPage: true });

// 印刷（A4相当）
await p.click('.tab[data-page="kyou"]');
await p.evaluate(() => printSessionPractice());
await p.emulateMedia({ media: "print" });
await p.setViewportSize({ width: 794, height: 1123 });
await p.screenshot({ path: "tools/shot_print.png", fullPage: true });

await b.close(); srv.close();
console.log("撮影しました: shot_kyou_start / _select / _switch / _kaki / _end / shot_kiroku / shot_ouen / shot_print");
