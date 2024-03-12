import { EditorState } from "@codemirror/state";
import { processScore, setAudio } from "./music";
import { EditorView } from "codemirror";
import { setDiagnostics } from "@codemirror/lint";
import { makeDiagnostics } from "./diagnostics";
import { SynthObjectController } from "abcjs";

// /** 巴赫（Bach）的《G弦上的咏叹调》 */
// ! 生日快乐
// export const DEFAULT_SCORE = `
// X: 2
// T:Happy Birthday
// M:3/4
// L:1/4
// Q:1/4=90
// K:G
// V:1 clef=bass
// D,/2>D,/2| E, D, G,| F,2 D,/2>D,/2| E, D, A,| G,2 D,/2>D,/2|
// d, B, G,| F, E, c,/2>c,/2| B, G, A,| G,2|]
// `;
export const DEFAULT_SCORE = `X: 3
T:Happy Birthday to You
M:3/4
L:1/8
K:G
D>D | E2 D2 G2 | F4 D>D | E2 D2 A2 | G4 D>D | d2 B2 G2 | (F2 E2) c>c |
B2 G2 A2 | G6 |]
`


/**
 * @description 从 URL 查询参数中获取编码的乐谱字符串，进行解码（使用 window.atob）后返回
 * @description 如果解码失败或未提供编码的乐谱，则返回默认乐谱。
 * @returns {string}
 */
export function decodeScore(): string {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get("s");
  if (encoded != null) {
    try {
      return window.atob(encoded);
    } catch (e) {
      alert("URL not valid. Showing default score...");
    }
  }
  return DEFAULT_SCORE
}

/**
 * @description 将乐谱字符串进行编码（使用 window.btoa），并将编码结果添加到当前页面的 URL 查询参数中。返回更新后的 URL。
 * @param {string} content
 * @returns {string}
 */
export function encodeScore(content: string): string {
  const encoded = window.btoa(content);
  const url = new URL(document.location.href);
  url.searchParams.set("s", encoded);
  return url.toString();
}

/**
 * @description 更新乐谱，并在页面 URL 中更新查询参数以反映更改。
 * @description 调用 processScore 函数将乐谱渲染到指定的 HTML 元素（el）上。
 * @description  设置音频控制器（syncControl）的音乐，以便进行播放和同步。
 * @description 调用 setDiagnostics 函数，将编辑器状态中的诊断信息更新为与乐谱相关的警告信息。
 * @param score
 * @param el
 * @param syncControl
 * @param editor
 * @param state
 */
export function updateScore(score: string, el: HTMLElement, syncControl: SynthObjectController, editor: EditorView, state: EditorState,) {
  // * 更新 url
  const encoded = encodeScore(score);
  history.replaceState(null, "", encoded);
  const tune = processScore(el, score);
  // ? 断言，避免 typescript 类型错误
  const warnings = (tune as any).warnings || [];
  setAudio(syncControl, tune);

  editor.dispatch(
    setDiagnostics(
      state,
      Array.from(makeDiagnostics(warnings ?? [], state))
    )
  );
}
