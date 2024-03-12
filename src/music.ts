import abcjs from "abcjs";

const options: abcjs.AbcVisualParams = {
  responsive: "resize",
};

const controlOptions = {
  displayRestart: true,
  displayPlay: true,
  displayProgress: true,
  displayClock: true,
};

/**
 * @description 使用 ABCjs 渲染音乐谱，返回 TuneObject 对象。
 * @param {HTMLElement} target
 * @param {string} content
 * @returns {abcjs.TuneObject}
 */
export function processScore(target: HTMLElement, content: string): abcjs.TuneObject {
  return abcjs.renderAbc(target, content, options)[0];
}

/**
 * @description 如果浏览器支持音频，则创建实例，加载音频元素和视觉元素，并返回该控制器实例
 * @param {string} audioElement
 * @param {string} visualElement
 * @returns {abcjs.SynthObjectController | null}
 */

export function loadAudioController(audioElement: string, visualElement: string): abcjs.SynthObjectController | null {
  if (abcjs.synth.supportsAudio()) {
    const synthControl = new abcjs.synth.SynthController();
    synthControl.load(
      audioElement,
      new CursorControl(visualElement),
      controlOptions
    );
    synthControl.disable(true);
    return synthControl;
  } else {
    return null;
  }
}
/**
 * @description 将音频控制器设置为渲染后的音乐谱，并在设置完成后移除相应的样式类
 * @param {abcjs.SynthObjectController} synthControl
 * @param {abcjs.TuneObject} visualObj
 */
export function setAudio(synthControl: abcjs.SynthObjectController, visualObj: abcjs.TuneObject) {
  synthControl
    .setTune(visualObj, true)
    .then(() =>
      document.querySelector(".abcjs-inline-audio")?.classList.remove("disabled")
    );
}

/**
 * @description 控制光标的行为
 */
export class CursorControl {
  cursor: SVGLineElement | null
  /** 音乐谱的根元素的选择器  */
  rootSelector: string

  constructor(rootSelector: string) {
    this.cursor = null;
    this.rootSelector = rootSelector;
  }

  onStart() {
    // 在计时器启动时调用，创建并添加光标
    // 添加到包含音乐谱的 SVG 元素中
    const svg = document.querySelector(this.rootSelector + " svg");
    this.cursor = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.cursor.setAttribute("class", "abcjs-cursor");
    this.cursor.setAttributeNS(null, "x1", "0");
    this.cursor.setAttributeNS(null, "y1", "0");
    this.cursor.setAttributeNS(null, "x2", "0");
    this.cursor.setAttributeNS(null, "y2", "0");
    svg?.appendChild(this.cursor);
  }

  removeSelection() {
    /** 取消选择先前选择的音符 */
    const lastSelection = document.querySelectorAll(
      this.rootSelector + " .abcjs-highlight"
    );
    for (let k = 0; k < lastSelection.length; k++)
      lastSelection[k].classList.remove("abcjs-highlight");
  }

  /** 在每次到达音符或休止符时被调用，主要用于选择当前音符并移动光标  */
  onEvent(ev: abcjs.NoteTimingEvent) {
    /** 在每次到达音符或休止符时调用，选择当前音符并移动光标 */
    if (ev.measureStart && ev.left === null) return; // this was the second part of a tie across a measure line. Just ignore it.

    this.removeSelection();

    /** 选择当前选定的音符。  */
    if (ev.elements) {
      for (let i = 0; i < ev.elements.length; i++) {
        const note = ev.elements[i];
        for (let j = 0; j < note.length; j++) {
          note[j].classList.add("abcjs-highlight");
        }
      }
    }


    /** 将光标移动到当前音符的位置。 */
    if (this.cursor) {
      if (ev.left !== undefined && ev.top !== undefined && ev.height !== undefined) {
        this.cursor.setAttribute("x1", (ev.left - 2).toString());
        this.cursor.setAttribute("x2", (ev.left - 2).toString());
        this.cursor.setAttribute("y1", String(ev.top));
        this.cursor.setAttribute("y2", String(ev.top + ev.height));
      }
    }
  }

  /** 在播放结束时调用，取消选择和重置光标位置 */
  onFinished() {
    this.removeSelection();

    if (this.cursor) {
      this.cursor.setAttribute("x1", "0");
      this.cursor.setAttribute("x2", "0");
      this.cursor.setAttribute("y1", "0");
      this.cursor.setAttribute("y2", "0");
    }
  }
}
