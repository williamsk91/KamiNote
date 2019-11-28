import { Plugin, EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { css } from "styled-components";

export const tooltipPlugin = new Plugin({
  view: editorView => new SelectionSizeTooltip(editorView)
});

class SelectionSizeTooltip {
  tooltip: HTMLDivElement;

  constructor(view: EditorView) {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";

    view.dom.parentNode && view.dom.parentNode.appendChild(this.tooltip);

    this.update(view, null);
  }

  update(view: EditorView, lastState: EditorState | null) {
    let state = view.state;
    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    )
      return;

    // Hide the tooltip if the selection is empty
    if (state.selection.empty) {
      this.tooltip.style.display = "none";
      return;
    }

    // Otherwise, reposition it and update its content
    this.tooltip.style.display = "";
    let { from, to } = state.selection;

    // These are in screen coordinates
    let start = view.coordsAtPos(from),
      end = view.coordsAtPos(to);

    // The box in which the tooltip is positioned, to use as base
    let box = this.tooltip.offsetParent
      ? this.tooltip.offsetParent.getBoundingClientRect()
      : { bottom: 0, left: 0 };

    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    let left = Math.max((start.left + end.left) / 2, start.left + 3);
    this.tooltip.style.left = left - box.left + "px";
    this.tooltip.style.bottom = box.bottom - start.top + "px";
    this.tooltip.textContent = (to - from).toString();
    console.log("this.tooltip: ", this.tooltip);
  }

  destroy() {
    this.tooltip.remove();
  }
}

export const tooltipStyles = css`
  .tooltip {
    position: absolute;
    pointer-events: none;
    /* z-index: 20; */
    background: white;
    border: 1px solid silver;
    border-radius: 2px;
    padding: 2px 10px;
    margin-bottom: 7px;
    transform: translateX(-50%);
  }
  /* .tooltip:before {
    content: "";
    height: 0;
    width: 0;
    position: absolute;
    left: 50%;
    margin-left: -5px;
    bottom: -6px;
    border: 5px solid transparent;
    border-bottom-width: 0;
    border-top-color: silver;
  }
  .tooltip:after {
    content: "";
    height: 0;
    width: 0;
    position: absolute;
    left: 50%;
    margin-left: -5px;
    bottom: -4.5px;
    border: 5px solid transparent;
    border-bottom-width: 0;
    border-top-color: white;
  } */
`;
