/* 採点入力の速さを実測する。
 *   node tools/measure_input.mjs [CPUの倍率]   既定は6倍しぼり
 *
 * ⚠️ **PCの速さで測らないこと。**実機は廉価Android。
 *    CDP の Emulation.setCPUThrottlingRate でCPUを絞って測る（確認ポイント C-8・D-9）。
 * ⚠️ 見立てで直さない。**測ってから決める。**
 *
 * 見るもの:
 *   ・1日ぶんを入れ終えるまでの秒数（目安は1分以内）
 *   ・タップ数（〇✕の2択なら、理想は「まちがえた数」ぶんだけ）
 *   ・1タップあたりの反応（描き直しに何ms かかるか）
 */
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const RATE = Number(process.argv[2] || 6);

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const srv = http.createServer((q, r) => {
  if (q.url === "/favicon.ico") { r.writeHead(204); return r.end(); }
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html");
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const base = "http://127.0.0.1:" + srv.address().port;

const b = await launchBrowser(await getChromium());
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on("dialog", d => d.accept());

// ★CPUを絞る（実機に近づける）
const cdp = await p.context().newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
console.log("CPU を " + RATE + "倍しぼって測ります（実機は廉価Android）");

await p.goto(base + "/index.html", { waitUntil: "networkidle" });
await p.click('.tab[data-page="setei"]');
await p.fill("#q-pass", process.env.KANKEN_PASS || "");
if (process.env.KANKEN_PASS) {
  await p.click('button:has-text("よみこむ")');
  await p.waitForFunction(() => window.BOOK_UNITS !== null, { timeout: 60000 });
}
await p.click('.tab[data-page="kyou"]');
await p.click('button:has-text("はじめる")');

// 1日ぶんを作る（本の問題があればそれも混ぜる）
await p.evaluate(() => {
  if (window.BOOK_UNITS) {
    window.planToday = () => ({ unit: "dr_25", from: 1, to: 10, n: 10, day: 1, parts: 1, part: 1,
                                mat: "dr", label: "同じ部首の漢字①", pages: "25" });
  }
});
await p.click('.tab[data-page="kiroku"]');
await p.waitForTimeout(300);

const n = await p.locator("#mark-box .mark").count();
if (!n) { console.log("採点する字がありません。"); await b.close(); srv.close(); process.exit(0); }

// ★「まちがえた数」ぶんだけタップする想定。だいたい2〜3割が✕とみて、3割で測る
const taps = Math.max(1, Math.round(n * 0.3));
console.log("並んでいる字: " + n + " ／ ✕にする数: " + taps + "（3割の想定）");

const t0 = Date.now();
const each = [];
for (let i = 0; i < taps; i++) {
  const a = Date.now();
  await p.locator("#mark-box .mark").nth(i).click();
  await p.waitForFunction(
    (i) => document.querySelectorAll("#mark-box .mark.x").length === i + 1, i, { timeout: 30000 });
  each.push(Date.now() - a);
}
const tapMs = Date.now() - t0;

const s0 = Date.now();
await p.click('button:has-text("この字を記録する")');
await p.waitForTimeout(100);
const saveMs = Date.now() - s0;

each.sort((a, b) => a - b);
console.log("");
console.log("=== 実測 ===");
console.log("  タップ " + taps + " 回 … 合計 " + tapMs + "ms");
console.log("  1タップあたり … 中央値 " + each[Math.floor(each.length / 2)] + "ms ／ 最大 " + each[each.length - 1] + "ms");
console.log("  保存（まとめて1回） … " + saveMs + "ms");
console.log("  ★1日ぶん合計 … " + ((tapMs + saveMs) / 1000).toFixed(1) + " 秒" +
            ((tapMs + saveMs) < 60000 ? "（目安の1分以内）" : "（★1分を超えている）"));
console.log("");
console.log("  ※ 人が紙を見て判断する時間は含みません。**画面の操作にかかる時間**だけです。");
await b.close(); srv.close();
