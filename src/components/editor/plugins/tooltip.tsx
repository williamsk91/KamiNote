import React, { FC } from "react";
import ReactDOM from "react-dom";
import { Plugin, EditorState } from "prosemirror-state";
import { EditorView, NodeView } from "prosemirror-view";

export interface ITooltip {
  /**
   * The current view
   */
  view: EditorView;

  /**
   * The following props are helper props that are
   * actually jsut derived from view prop itself.
   */

  /**
   * Whether selection is empty or not.
   * empty being no text.
   */
  empty: boolean;

  /**
   * left padding
   */
  left: string;

  /**
   * bottom padding
   */
  bottom: string;
}

/**
 * PM plugins that renders react component with ITooltip props.
 */
export const tooltipPlugin = (ReactNode: FC<ITooltip>) =>
  new Plugin({
    view: editorView => new SelectionSizeTooltip(editorView, ReactNode)
  });

class SelectionSizeTooltip {
  tooltip: HTMLDivElement;
  ReactNode: FC<ITooltip>;

  constructor(view: EditorView, ReactNode: FC<ITooltip>) {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";

    view.dom.parentNode && view.dom.parentNode.appendChild(this.tooltip);

    this.ReactNode = ReactNode;

    this.update(view, null);
  }

  render(view: EditorView) {
    const { from, to, empty } = view.state.selection;

    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // The box in which the tooltip is positioned, to use as base
    const box = this.tooltip.offsetParent
      ? this.tooltip.offsetParent.getBoundingClientRect()
      : { bottom: 0, left: 0 };

    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = Math.max((start.left + end.left) / 2, start.left + 3);

    const leftSpacing = `${left - box.left}px`;
    const bottomSpacing = `${box.bottom - start.top}px`;

    return (
      <this.ReactNode
        empty={empty}
        left={leftSpacing}
        bottom={bottomSpacing}
        view={view}
      />
    );
  }

  update(view: EditorView, lastState: EditorState | null) {
    const state = view.state;

    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    ) {
      return;
    }

    // render / update react
    const tooltipComponent = this.render(view);
    tooltipComponent && ReactDOM.render(tooltipComponent, this.tooltip);
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.tooltip);
    this.tooltip.remove();
  }
}
