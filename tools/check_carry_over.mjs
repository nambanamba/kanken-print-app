/* ★公開中の版で作った記録を、新しい版（作業ツリーの index.html）で開いても、欠けたり変わったりしないかを確かめる。
 *
 *   node tools/check_carry_over.mjs                 … 前の版＝origin/master
 *   node tools/check_carry_over.mjs --base 8c9be8a  … 前の版を指定
 *
 * なぜあるか（2026-09-15 ユーザー「前のバージョンの正誤の履歴がちゃんと引き継がれるか、確認を」）:
 *   端末に保存された記録は、新しい版がそのまま読む（移行は作らない方針）。
 *   smoke-test は「新しい版が自分で書いた記録」しか見ないので、**前の版が本当に書いた形**を読めるかは確かめられない。
 *   → 前の版の index.html を git から取り出し、**その画面で実際に操作して**記録を作り、同じオリジンで新しい版を開いて前後を比べる。
 * 本の問題はダミー（公開リポジトリなので本の文面は使わない。合言葉も要らない）。出力は件数と一致の真偽だけ。
 */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getChromium, launchBrowser } from "./browser.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const bi = args.indexOf("--base");
const base = bi >= 0 ? args[bi + 1] : "origin/master";
const oldHtml = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kanken-co-")), "index.html");
fs.writeFileSync(oldHtml, execFileSync("git", ["show", base + ":index.html"], { cwd: ROOT }));
const baseId = execFileSync("git", ["rev-parse", "--short", base], { cwd: ROOT, encoding: "utf8" }).trim();
console.log(`前の版: ${base} (${baseId}) ／ 新しい版: 作業ツリーの index.html`);

const MIME = { ".html": "text/html", ".js": "text/javascript" };
const server = http.createServer((req, res) => {
  if (req.url === "/favicon.ico") { res.writeHead(204); return res.end(); }
  const mm = decodeURIComponent(req.url.split("?")[0]).match(/^\/v\/(old|new)\/(.*)$/);
  if (!mm) { res.writeHead(404); return res.end(); }
  const rel = mm[2] || "index.html";
  const f = rel === "index.html" ? (mm[1] === "old" ? oldHtml : path.join(ROOT, "index.html")) : path.join(ROOT, rel);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const url = v => `http://127.0.0.1:${server.address().port}/v/${v}/index.html`;

let fail = 0;
const ok = (name, cond, extra = "") => { console.log((cond ? "  OK   " : "  FAIL ") + name + (extra ? "  " + extra : "")); if (!cond) fail++; };

const browser = await launchBrowser(await getChromium());
const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", e => errs.push(String(e)));
page.on("dialog", d => d.accept());

/* ダミーの本（ids は毎回同じになるよう、字は KANJI_MASTER の先頭から順に使う）。前の版でも新しい版でも同じものを入れる */
async function openWithBook(ver, day) {
  await page.clock.setFixedTime(new Date(day + "T10:00:00+09:00"));
  await page.goto(url(ver), { waitUntil: "networkidle" });
  return page.evaluate(() => {
    const pool = KANJI_MASTER.map(r => r.k); let ki = 0;
    const KANA = ["ア", "イ", "ウ", "エ", "オ"];
    const unit = (uid, field, items) => ({ unitId: uid, mat: "dr", srcPages: [Number(uid.slice(3))],
      groups: [{ gno: 0, field, instruction: { text: "ダミーの指示（" + uid + "）", ruby: [] }, items }] });
    const paper = (uid, n, field, nAns) => unit(uid, field, Array.from({ length: n }, (_, i) => {
      const ks = Array.from({ length: nAns }, () => pool[ki++ % pool.length]);
      return { id: "q_co_" + uid + "_" + (i + 1), no: i + 1, text: "ダミーの文 " + (i + 1),
               answers: ks.map(k => ({ text: k, around: nAns > 1 ? "□" : null })), ruby: nAns > 1 ? ks.map(() => ({ yomi: "よみ" })) : [], kanji: ks };
    }));
    const app = (uid, n, field) => unit(uid, field, Array.from({ length: n }, (_, j) => {
      const i = j + 1, it = { id: "q_co_" + uid + "_" + i, no: i, ruby: [], text: "ダミー " + uid + "-" + i };
      if (field === "yomi") { it.answers = [{ text: "よみ" + i }]; it.kanji = [pool[ki++ % pool.length]]; }
      if (field === "kakusu") { it.text = pool[ki % pool.length]; it.answers = [{ text: String(3 + (i % 9)) }]; it.kanji = [pool[ki++ % pool.length]]; }
      if (field === "erabi") { const cs = [0, 1, 2].map(k => pool[ki + k]); ki += 3; it.choices = cs.map((c, k) => KANA[k] + " " + c); it.answers = [{ text: it.choices[i % 3] }]; it.kanji = [cs[i % 3]]; }
      return it;
    }));
    BOOK_UNITS = [paper("dr_08", 15, "kaki", 1), paper("dr_25", 8, "bushu", 3), app("dr_01", 8, "yomi"), app("dr_17", 8, "erabi"), app("dr_19", 8, "kakusu")];
    window.isVerifiedUnit = () => true;
    renderAll();
    return bookLoaded();
  });
}
async function renderTabs() {
  for (const t of ["kyou", "kiroku", "ouen", "kyou"]) { const s = `.tab[data-page="${t}"]`; if (await page.locator(s).count()) await page.click(s); }
}
const snap = () => page.evaluate(() => {
  const o = {}; Object.keys(localStorage).filter(k => k.indexOf("kanken7_") === 0).sort().forEach(k => { o[k] = localStorage.getItem(k); }); return o;
});
const restore = S => page.evaluate(S => {
  Object.keys(localStorage).filter(k => k.indexOf("kanken7_") === 0).forEach(k => localStorage.removeItem(k));
  Object.keys(S).forEach(k => localStorage.setItem(k, S[k]));
}, S);
// 画面のボタンで答える（smoke-test の answerCurrent と同じ操作）
const answerApp = okWanted => page.evaluate(okWanted => {
  if (typeof openApp === "function") openApp();
  const s = todayApp(); if (!s || s.pos >= s.ids.length) return null;
  const id = s.ids[s.pos], x = appIndex()[id], it = x.it, f = itemFieldOf(it, x.g), CH = appChoicesOf(it, f), box = () => document.getElementById("ap-box");
  if (f === "yomi") { box().querySelector('[data-act="show"]').click(); box().querySelector(okWanted ? '[data-act="yomi-o"]' : '[data-act="yomi-x"]').click(); }
  else if (f === "kakusu") { const w = parseInt(it.answers[0].text, 10); document.getElementById("ap-num").value = String(okWanted ? w : w + 1); box().querySelector('[data-act="num"]').click(); }
  else { const body = choiceBody(it.answers[0].text), btns = [...box().querySelectorAll('[data-act="pick"]')];
         (okWanted ? btns.find(b => choiceBody(CH[+b.dataset.ci]) === body) : btns.find(b => choiceBody(CH[+b.dataset.ci]) !== body)).click(); }
  const nx = box().querySelector('[data-act="next"]'); if (nx) nx.click();
  return f;
}, okWanted);
const markPaper = (nX, save) => page.evaluate(({ nX, save }) => {
  renderMarks();
  [...document.querySelectorAll("#mark-box .mark")].slice(0, nX).forEach(el => el.click());
  if (save) { const b = [...document.querySelectorAll("button")].find(el => /saveSheetResult/.test(el.getAttribute("onclick") || "")); if (b) b.click(); else saveSheetResult(); }
  return { x: document.querySelectorAll("#mark-box .mark.x").length, saved: !!(SESSION && SESSION.saved) };
}, { nX, save });
const J = (S, k) => { try { return JSON.parse(S[k]); } catch { return null; } };
const RECORD_KEYS = ["kanken7_items_v1", "kanken7_kstats_v1", "kanken7_weak_v1", "kanken7_log_v1", "kanken7_records_v1"];

// ---- 前の版で、画面を操作して記録を作る ----
await page.goto(url("old"), { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
ok("前の版: ダミーの本が入った", await openWithBook("old", "2026-09-13"));
await renderTabs();
const p13 = await markPaper(2, true);
const a13 = [await answerApp(true), await answerApp(false), await answerApp(true)];
await openWithBook("old", "2026-09-14");
await renderTabs();
const p14 = await markPaper(1, false);
const a14 = [await answerApp(false)];
const S1 = await snap();
const items1 = J(S1, "kanken7_items_v1") || {};
ok("前の版で記録が作れた（9/13 の紙を記録・9/14 の紙は✕1入れかけ・アプリで答えた）",
   p13.saved && p13.x === 2 && !p14.saved && p14.x === 1 && a13.every(Boolean) && a14.every(Boolean) && Object.keys(items1).length > 0 && Object.values(J(S1, "kanken7_app_v1").res || {}).length === 1,
   `問題ごと ${Object.keys(items1).length}件・✕ ${Object.values(items1).filter(r => r.last === "x").length}件`);

// ---- 同じ日に新しい版で開く ----
await openWithBook("new", "2026-09-14");
await renderTabs();
const S2 = await snap();
ok("★同じ日: 記録（問題ごと・字ごと・もうすこし・履歴・日割り）が1文字も変わらない", RECORD_KEYS.every(k => S2[k] === S1[k]), RECORD_KEYS.filter(k => S2[k] !== S1[k]).join(","));
const s1 = J(S1, "kanken7_session_v1"), s2 = J(S2, "kanken7_session_v1");
ok("★同じ日: 入れかけの紙（問題と✕）がそのまま", s1.ids.join() === s2.ids.join() && JSON.stringify(s1.results) === JSON.stringify(s2.results) && !s2.saved);
const ap1 = J(S1, "kanken7_app_v1"), ap2 = J(S2, "kanken7_app_v1");
ok("★同じ日: 答えたアプリの分は、並び・答え・位置がそのまま", ap1.ids.join() === ap2.ids.join() && JSON.stringify(ap1.res) === JSON.stringify(ap2.res) && ap1.pos === ap2.pos);

// ---- 次の日に新しい版で開く（前の版が保存した入れかけの紙が残るか） ----
await restore(S1);
await openWithBook("new", "2026-09-15");
await renderTabs();
const S3 = await snap();
ok("★次の日: 記録が1文字も変わらない", RECORD_KEYS.every(k => S3[k] === S1[k]), RECORD_KEYS.filter(k => S3[k] !== S1[k]).join(","));
const nx = await page.evaluate(() => ({ date: SESSION && SESSION.date, saved: SESSION && SESSION.saved,
  x: SESSION ? Object.values(SESSION.results || {}).filter(v => v === "x").length : -1,
  notice: /9月14日の紙/.test(document.getElementById("ky-info").textContent),
  retryPaper: bookItemsForRetry().length, retryApp: appAllItems().filter(x => isRetryItem(x.it.id)).length }));
ok("★次の日: 前の版が保存した入れかけの紙（9/14・✕1）が残り、「9月14日の紙」と出る", nx.date === "2026-09-14" && !nx.saved && nx.x === 1 && nx.notice, JSON.stringify(nx));
ok("★次の日: 前日までの✕が、紙にもアプリにも次に出る問題として拾われる", nx.retryPaper > 0 && nx.retryApp > 0, `紙 ${nx.retryPaper}・アプリ ${nx.retryApp}`);
ok("JSエラーが無い", errs.length === 0, errs.slice(0, 2).join(" | "));

await page.evaluate(() => localStorage.clear());
await browser.close(); server.close();
console.log(fail ? `\n★★ ${fail} 件。記録の引き継ぎに問題があります。` : "\n★ 記録の引き継ぎ: 全部OK");
process.exit(fail ? 1 : 0);
