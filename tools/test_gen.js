// 問題の自動生成（kanken-gen.js）のテスト
//   使い方: node tools/test_gen.js
//
// ★件数を決め打ちしない。その場のマスタから数えて、つじつまだけを見る（確認ポイント C-8b）。

const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
// const は eval ごとにスコープが分かれるので、1つの文字列にまとめて間接eval する
const SRC = fs.readFileSync(path.join(dir, 'kanken-kanji.js'), 'utf8')
  + ';\n' + fs.readFileSync(path.join(dir, 'kanken-gen.js'), 'utf8')
  + ';\nglobalThis.__X = {KANJI_MASTER, MASTER_BY_K, GENERATORS, canGenerate, genBushu, genKaki,'
  + ' genYomi, seededRandom, buildSheet, pickKanji, KAKI_INDEX, FIELD_ASK, kunWords};';
(0, eval)(SRC);
const X = globalThis.__X;
const { KANJI_MASTER, MASTER_BY_K, GENERATORS, canGenerate, genBushu, genKaki, genYomi,
        seededRandom, buildSheet, pickKanji } = X;

const rnd = seededRandom('test');
let ng = 0;
const bad = (msg) => { console.log('  NG ' + msg); ng++; };

console.log('=== 形式ごとに、何字ぶん問題が作れるか ===');
['kakusu', 'bushu', 'onkun', 'kaki', 'yomi'].forEach(f => {
  const n = KANJI_MASTER.filter(r => canGenerate(f, r.k, rnd)).length;
  const n4 = KANJI_MASTER.filter(r => r.grade === 4 && canGenerate(f, r.k, rnd)).length;
  console.log('  ' + f.padEnd(7) + ' 全体 ' + String(n).padStart(3) + '/642   4年配当 ' + String(n4).padStart(3) + '/202');
});

const sheet = buildSheet({ kstats: {}, total: 20, dayKey: '2026-09-09' });
console.log('\n=== その日の1枚（20問・下段=' + sheet.lowerField + '） ===');
sheet.items.forEach(q => {
  console.log('  ' + String(q.no).padStart(2) + '. ' + q.field.padEnd(6) + ' ' + JSON.stringify(q.q)
    + (q.hint ? '（' + q.hint + '）' : '') + ' → ' + q.a
    + (q.choices ? '  [' + q.choices.join(' ') + ']' : ''));
});

console.log('\n=== 検証 ===');

// 1. 部首：正解が同じ部首か／ダミーが違う部首か
KANJI_MASTER.forEach(r => {
  const q = genBushu(r.k, rnd); if (!q) return;
  if (MASTER_BY_K[q.a].radNo !== r.radNo) bad('部首 正解が同部首でない ' + r.k);
  q.choices.filter(c => c !== q.a).forEach(c => {
    if (MASTER_BY_K[c].radNo === r.radNo) bad('部首 ダミーが同部首 ' + r.k + '/' + c);
  });
});

// 2. 書き取り：答えが「その字＋ひらがな」で、送りがなが読みの末尾と一致するか
KANJI_MASTER.forEach(r => {
  const q = genKaki(r.k, rnd); if (!q) return;
  if (q.a[0] !== r.k) bad('書取 語が字で始まらない ' + r.k + ' ' + q.a);
  const tail = q.a.slice(1);
  if (!/^[ぁ-ゖ]*$/.test(tail)) bad('書取 送りがなが仮名でない ' + q.a);
  if (tail && q.q.slice(-tail.length) !== tail) bad('書取 送りがな不一致 ' + q.a + ' / ' + q.q);
});

// 3. ★書き取りの答えが1つに定まるか（読み＋音読みヒントで一意）
//    実際に「する→刷る」「わ→輪」「まと→的」が読みだけでは定まらなかった
const seen = {};
KANJI_MASTER.forEach(r => {
  const q = genKaki(r.k, rnd); if (!q) return;
  if (r.on.length > 0 && !q.hint) bad('書取 音読みヒントが無い ' + r.k);
  const key = q.q + '|' + (r.on[0] || '');
  (seen[key] = seen[key] || new Set()).add(q.a);
  const cands = Object.keys(X.KAKI_INDEX[key] || {});
  if (cands.length !== 1) bad('書取 答えが定まらない ' + key + ' → ' + cands.join('/'));
});
Object.keys(seen).forEach(k => {
  if (seen[k].size > 1) bad('書取 「' + k + '」に答えが複数: ' + [...seen[k]].join('/'));
});
console.log('  書き取りの手がかり: ' + Object.keys(seen).length + ' 通り（すべて答えが1つ）');

// 4. 読み：1字だけの問題は「訓読み」と明示し、訓読みが1つの字に限る
KANJI_MASTER.forEach(r => {
  const q = genYomi(r.k, rnd); if (!q) return;
  if (q.q.length === 1) {
    if (q.hint !== '訓読み') bad('読み 1字なのに訓読みと明示していない ' + q.q);
    if (MASTER_BY_K[q.q].kun.length !== 1) bad('読み 1字で訓読みが複数 ' + q.q);
  }
});

// 5. 紙の指示文が、出す形式すべてにあるか（無いと何をすればいいか分からない）
['yomi', 'kaki', 'kakusu', 'bushu', 'onkun'].forEach(f => {
  if (!X.FIELD_ASK[f]) bad('指示文が無い ' + f);
});

// 6. id の重複
const ids = new Set();
['kakusu', 'bushu', 'onkun', 'kaki', 'yomi'].forEach(f => {
  KANJI_MASTER.forEach(r => {
    const q = GENERATORS[f](r.k, rnd);
    if (q) { if (ids.has(q.id)) bad('id重複 ' + q.id); ids.add(q.id); }
  });
});
console.log('  問題id: ' + ids.size + ' 件（重複なし）');

// 7. 同じ日なら同じ問題（印刷しなおしの再現性）
const a = buildSheet({ kstats: {}, total: 20, dayKey: '2026-09-09' });
const b = buildSheet({ kstats: {}, total: 20, dayKey: '2026-09-09' });
if (JSON.stringify(a) !== JSON.stringify(b)) bad('同じ日なのに問題が変わる');

// 8. できている字を出さない（選り分け）
const ks = {}; KANJI_MASTER.slice(0, 100).forEach(r => { ks[r.k] = { kakusu: { o: 5, x: 0 } }; });
if (pickKanji('kakusu', ks, 10, rnd, null).filter(r => ks[r.k]).length) bad('できている字を出している');

// 9. ★1枚のなかで、同じ字を2回出していないか／ある問題の答えが別の問題に見えていないか
//    実際に「2. 札→ふだ」と「14. ふだ→札」が同じ紙に並んでいた（確認ポイント A-1）
const KJ = t => [...(t || '')].filter(c => c >= '一' && c <= '鿿');
let dup = 0, leak = 0, days = 40;
for (let d = 0; d < days; d++) {
  const day = '2026-10-' + String(d + 1).padStart(2, '0');
  const s = buildSheet({ kstats: {}, total: 20, dayKey: day });
  const tk = s.items.map(q => q.kanji);
  if (new Set(tk).size !== tk.length) {
    bad(day + ' 同じ字が2回出ている: ' + tk.filter((k, i) => tk.indexOf(k) !== i).join('')); dup++;
  }
  s.items.forEach((q, i) => {
    const ans = KJ(q.a); if (!ans.length) return;
    s.items.forEach((o, j) => {
      if (i === j) return;
      const vis = KJ((o.q || '') + (o.hint || '') + (o.choices ? o.choices.join('') : ''));
      const hit = ans.filter(c => vis.includes(c));
      if (hit.length) {
        bad(day + ' No.' + q.no + 'の答え「' + q.a + '」が No.' + o.no + '（' + o.q
          + (o.choices ? ' ' + o.choices.join('') : '') + '）に見えている'); leak++;
      }
    });
  });
}
console.log('  ' + days + '日ぶんを検査: 字の重複 ' + dup + ' 件 / 答えの露出 ' + leak + ' 件');

// 10. 番号が、紙に出す順（読み→画数→音訓→部首→書き取り）で連番か
const order = ['yomi', 'kakusu', 'onkun', 'bushu', 'kaki'];
let prev = -1;
sheet.items.forEach((q, i) => {
  if (q.no !== i + 1) bad('番号が連番でない No.' + q.no);
  const oi = order.indexOf(q.field);
  if (oi < prev) bad('紙の並び順になっていない ' + q.field);
  prev = oi;
});

console.log('\n' + (ng === 0 ? '★ 全チェック通過' : '★ 失敗 ' + ng + ' 件'));
process.exit(ng ? 1 : 0);
