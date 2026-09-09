// playwright の取得と、ブラウザの起動をまとめたもの。
//
// ★なぜこのファイルがあるか（2026-09-09・PC移行）
// 新しいPCでは `cdn.playwright.dev` に届かず、playwright 同梱の chromium を
// ダウンロードできません（接続タイムアウトを5分に延ばしても失敗）。
// ただし **入れる必要はありません。** このPCの Edge / Chrome をそのまま使えます。
//   chromium.launch({ channel: "msedge" })
//   chromium.launch({ channel: "chrome" })
// smoke-test.mjs と shot.mjs の両方で同じ対処が要るので、1か所にまとめました。
//
// 起動の順番は 同梱chromium → msedge → chrome。
// 同梱を先に試すのは、**旧PCや同梱を入れた環境でもそのまま動くようにする**ためです。
// 環境変数 KANKEN_BROWSER=msedge のように指定すれば、それだけを使います。

import path from "node:path";
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

// パスに日本語が入るので pathToFileURL でエンコードする（手で file:/// を組むと落ちる）
export async function getChromium() {
  let lastErr;
  for (const base of [null, execSync("npm root -g").toString().trim()]) {
    try {
      const spec = base ? pathToFileURL(path.join(base, "playwright", "index.js")).href : "playwright";
      const m = await import(spec);
      // playwright は CommonJS なので、名前つき取り出しに失敗することがある。default も見る
      const chromium = m.chromium || (m.default && m.default.chromium);
      if (chromium) return chromium;
    } catch (e) { lastErr = e; }
  }
  throw new Error("playwright が見つかりません: " + (lastErr && lastErr.message));
}

// 起動できたブラウザを返す。どれで起動したかは呼び出し側が browser._kankenChannel で見られる。
export async function launchBrowser(chromium, opts = {}) {
  const only = process.env.KANKEN_BROWSER;
  const channels = only ? [only] : [null, "msedge", "chrome"];
  const tried = [];
  for (const channel of channels) {
    try {
      const b = await chromium.launch(channel ? { ...opts, channel } : opts);
      b._kankenChannel = channel || "bundled chromium";
      return b;
    } catch (e) {
      tried.push((channel || "bundled chromium") + ": " + String(e.message).split("\n")[0]);
    }
  }
  throw new Error("ブラウザを起動できませんでした。試したもの:\n  " + tried.join("\n  "));
}
