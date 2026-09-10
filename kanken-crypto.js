/* =========================================================================
   本の問題データの暗号化／復号（2026-09-10）

   【なぜ要るか】
   このリポジトリは公開です（github.com/nambanamba/kanken-print-app ＋ GitHub Pages）。
   そこに市販の問題集2冊から書き起こした約1,300〜1,600問を平文で置くと、
   ROLE.md の方針「問題文・解答の文面をそのまま転記しない。それは複製」と正面からぶつかる。
   → **中身そのものに鍵をかける。**ユーザーの指示は「ログイン画面をつけてください」。

   ⚠️⚠️ **この仕組みの限界を、必ず理解してから使ってください。**
   **鍵はブラウザに渡ります。本気で解析する相手には勝てません。**
   復号後の平文は、その端末のメモリ上に存在します。
   **目的は「検索エンジンやクローラに問題文が拾われないこと」で、そこには十分効きます。**
   → **「暗号化してあるから何を入れてもよい」ではありません。**過大評価しないこと。

   【方式】外部ライブラリを使わない（CDN不可・オフラインでも動く）
     PBKDF2（SHA-256・20万回）で合言葉から鍵を作り、AES-GCM 256 で復号する。
     salt と iv は暗号文と一緒に置く（秘密ではない。同じ合言葉から同じ鍵を作るために要る）。

   【置いてよいもの・いけないもの】
     ✅ 暗号文（`kanken-quiz.enc.js`）… Base64だけ。リポジトリに入れてよい
     ❌ 平文JSON … **1バイトも入れない。**`司令塔\漢検書き起こし_*\` に置く
        （そこはどのリポジトリにも属していないので、構造上gitに入らない）
     ❌ 合言葉そのもの／そのハッシュ … **書かない。**総当たりで割れる形で置かない。
        **ユーザーから口頭で受け取る運用。**
   ========================================================================= */

var KANKEN_CRYPTO = (function () {
  var PBKDF2_ITER = 200000;      // ★下げないこと。総当たりの手間がそのまま下がる
  var KEY_BITS = 256;

  function b64ToBytes(b64) {
    var s = atob(b64), a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }
  function bytesToB64(bytes) {
    var s = "", a = new Uint8Array(bytes);
    for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
    return btoa(s);
  }

  /* 合言葉 → 鍵。★同じ salt なら同じ鍵になる（だから salt を暗号文と一緒に置く） */
  function deriveKey(passphrase, saltBytes) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITER, hash: "SHA-256" },
          base, { name: "AES-GCM", length: KEY_BITS }, true, ["encrypt", "decrypt"]);
      });
  }

  /* 鍵を localStorage に置いておく（お子さんが毎日入れ直すのは無理なので）。
     ⚠️ 置くのは **合言葉ではなく導出した鍵**。合言葉は保存しない。
        端末を覗かれたら鍵は読めるが、**合言葉そのものは漏れない**（他で使い回されても被害が広がらない）。 */
  function exportKey(key) {
    return crypto.subtle.exportKey("raw", key).then(bytesToB64);
  }
  function importKey(b64) {
    return crypto.subtle.importKey("raw", b64ToBytes(b64), { name: "AES-GCM" }, true,
                                   ["encrypt", "decrypt"]);
  }

  /* 復号。★合言葉が違えば AES-GCM の認証が失敗して例外になる。
     つまり「合言葉が合っているか」を別に持たなくても、復号できたこと自体が答え合わせになる。
     ⚠️ だから合言葉のハッシュをリポジトリに置く必要がない（置いてはいけない）。 */
  function decrypt(key, payload) {
    var iv = b64ToBytes(payload.iv), data = b64ToBytes(payload.data);
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data)
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }

  function encrypt(key, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var data = new TextEncoder().encode(JSON.stringify(obj));
    return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data)
      .then(function (buf) { return { iv: bytesToB64(iv), data: bytesToB64(buf) }; });
  }

  return {
    PBKDF2_ITER: PBKDF2_ITER,
    b64ToBytes: b64ToBytes, bytesToB64: bytesToB64,
    deriveKey: deriveKey, exportKey: exportKey, importKey: importKey,
    encrypt: encrypt, decrypt: decrypt,
    newSalt: function () { return crypto.getRandomValues(new Uint8Array(16)); }
  };
})();
