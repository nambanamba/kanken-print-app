# -*- coding: utf-8 -*-
"""本のPDFから「図が要る問題」の図（何画目の太い画つきの漢字など）を切り出す。

2026-09-11 司令塔決定: まず dr_19 の何画目13問だけで試す（太い画が見分けられるかを確かめてから広げる）。

★★画像は本の複製。**ファイルとして残さない。**
  - 既定（--json）… 切り出した画像を data URI（base64）にして **標準出力に JSON で出すだけ**。
    build_quiz.mjs がこれを読んで問題データに入れ、**暗号化してから**書き出す。
  - --preview <フォルダ> … 照合担当が目で見るための PNG を書く。**リポジトリの中は拒否**（一時領域に）。
  ⚠️ リポジトリに PNG を置かないこと。tools/check_no_images.mjs が publish で止める。

書式（書き起こし側が items に足す）:
  "figure": { "page": 19, "box": [x0, y0, x1, y1] }
    page … 本のノンブル（＝物理ページ。render.py と同じ）
    box  … **正立で描いたページ**の左上を (0,0)、右下を (1,1) とした割合（小数4桁ほど）
           render.py の出力（正立）を見て、その上の位置で決められるようにしてある

使い方:
  python tools/crop_figures.py --json   <平文JSON> [...]            → 標準出力に {問題id: PNG の data URI}
  python tools/crop_figures.py --preview <外のフォルダ> <平文JSON> [...]  → <問題id>.png を書く（照合用）
"""
import sys, os, json, base64
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, ".."))
PDFS = {   # 単元idの頭 → 本のPDF（書き起こし側 render.py と同じもの）
    "dr": os.path.join(REPO, "..", "情報", "5分間対策ドリル7級_整列.pdf"),
}
DPI = 400   # 太い画が見分けられるように高めに（150dpi では細い画との差が小さい）

def crop(doc, page_no, box):
    page = doc[page_no - 1]                 # 本のノンブル = 物理ページ（1始まり）
    # ⚠️ PyMuPDF の page.rect は「回転を当てたあと（＝正立で見た）」の大きさで、clip も同じ座標で受け取る。
    #    回転行列を自分でかけると、ずれた場所を切り出す（試しに切って、点線を切り出して分かった）
    W, H = page.rect.width, page.rect.height
    x0, y0, x1, y1 = box
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise ValueError("box は 0〜1 の割合で [x0,y0,x1,y1]（x0<x1, y0<y1）: %r" % (box,))
    clip = pymupdf.Rect(x0 * W, y0 * H, x1 * W, y1 * H)    # 正立の座標
    pix = page.get_pixmap(dpi=DPI, clip=clip, colorspace=pymupdf.csGRAY)
    return pix.tobytes("png")

def main(argv):
    if not argv or argv[0] not in ("--json", "--preview"):
        print(__doc__); return 2
    mode = argv[0]
    out_dir = None
    rest = argv[1:]
    if mode == "--preview":
        if not rest: print("--preview の出力先がありません"); return 2
        out_dir = os.path.abspath(rest[0]); rest = rest[1:]
        if out_dir.startswith(REPO):
            print("★中止: 出力先がリポジトリの中です → " + out_dir); return 3
        os.makedirs(out_dir, exist_ok=True)
    result, n, docs = {}, 0, {}
    for path in rest:
        unit = json.load(open(path, encoding="utf-8"))
        mat = str(unit.get("unitId", ""))[:2]
        if mat not in PDFS:
            print("★中止: この教材のPDFが分かりません: " + unit.get("unitId", ""), file=sys.stderr); return 3
        for g in unit.get("groups", []):
            for it in g.get("items", []):
                fig = it.get("figure")
                if not fig: continue
                if mat not in docs: docs[mat] = pymupdf.open(os.path.abspath(PDFS[mat]))
                png = crop(docs[mat], int(fig["page"]), fig["box"])
                n += 1
                if out_dir:
                    open(os.path.join(out_dir, it["id"] + ".png"), "wb").write(png)
                else:
                    # ⚠️ "data:" と "image/" を分けて書く（この道具そのものが画像の関門 check_no_images に引っかからないように）
                    result[it["id"]] = "data:" + "image/png;base64," + base64.b64encode(png).decode("ascii")
    if out_dir:
        print("切り出し %d 枚 → %s（照合が済んだら消してください）" % (n, out_dir))
    else:
        sys.stdout.write(json.dumps(result))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
