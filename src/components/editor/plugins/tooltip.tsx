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
    view: editorView => tooltip(editorView, ReactNode)
  });

const tooltip = (editorView: EditorView, ReactNode: FC<ITooltip>) => {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";

  editorView.dom.parentNode && editorView.dom.parentNode.appendChild(tooltip);

  const render = (view: EditorView) => {
    const { from, to, empty } = view.state.selection;

    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // The box in which the tooltip is positioned, to use as base
    const box = tooltip.offsetParent
      ? tooltip.offsetParent.getBoundingClientRect()
      : { bottom: 0, left: 0 };

    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = Math.max((start.left + end.left) / 2, start.left + 3);

    const leftSpacing = `${left - box.left}px`;
    const bottomSpacing = `${box.bottom - start.top}px`;

    return (
      <ReactNode
        empty={empty}
        left={leftSpacing}
        bottom={bottomSpacing}
        view={view}
      />
    );
  };

  return {
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
      const tooltipComponent = render(view);
      tooltipComponent && ReactDOM.render(tooltipComponent, tooltip);
    },
    destroy() {
      ReactDOM.unmountComponentAtNode(tooltip);
      tooltip.remove();
    }
  };
};
