// # 代码编辑器的语法检查和错误提示相关的功能
/**
 * @description 基于 CodeMirror 的编辑器中处理音乐谱的错误消息
 * @description 并将其转换为适合进行语法检查和可视化提示的格式
 */
import { Diagnostic } from "@codemirror/lint";
import { EditorState, Text } from "@codemirror/state";

const RE_DIAGNOSTICS = /Music Line:(\d+):(\d+): (.*)/;

export interface ErrorMessage {
  lineNumber: number;
  column: number;
  message: string;
  node: HTMLElement;
}

export function parseMessage(message: string): ErrorMessage | null {
  const match = message.match(RE_DIAGNOSTICS);
  if (match == null) {
    console.warn("Cannot parse error message: " + message);
    return null;
  }
  const node = document.createElement("div");
  node.innerHTML = match[3];

  return {
    lineNumber: parseInt(match[1]),
    column: parseInt(match[2]),
    message: node.textContent || "",
    node: node,
  };
}

/**
 * @description 根据解析后的错误消息数据和编辑器文本创建 Diagnostic 对象。
 * @param {ErrorMessage} data
 * @param {Text} body
 * @returns {Diagnostic}
 */
export function makeDiagnosticBody(data: ErrorMessage, body: Text): Diagnostic {
  const line = body.line(data.lineNumber);
  return {
    from: line.from + data.column - 1,
    to: line.from + data.column,
    severity: "error",
    message: data.message,
    renderMessage: () => data.node,
  };
}

function notNull<T>(v: T | null): v is T {
  return v != null;
}

/**
 * @description 返回一个用于语法检查和错误提示的数据结构。
 * @param warnings
 * @param state
 * @returns
 */
export function makeDiagnostics(
  warnings: string[],
  state: EditorState
): Diagnostic[] {
  return warnings
    .map(parseMessage)
    .filter(notNull)
    .map((data) => makeDiagnosticBody(data, state.doc));
}
