import React, { FC } from "react";
import ReactDOM from "react-dom";
import { Plugin, EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface IViewPortCoords {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

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
   * the viewport coordinates of the anchor and
   *  head of a text selection.
   */
  anchor: IViewPortCoords;
  head: IViewPortCoords;
}

/**
 * PM plugins that renders react component with ITooltip props.
 * the component is rendered as a child of node with nodeId
 */
export const tooltipPlugin = (nodeId: string, ReactNode: FC<ITooltip>) =>
  new Plugin({
    view: () => tooltip(nodeId, ReactNode)
  });

const tooltip = (nodeId: string, ReactNode: FC<ITooltip>) => {
  const tooltip = document.createElement("div");

  /**
   * This requires a div tag outside of the editor.
   *  By rendering it outside of the editor, the selection
   *  made inside the tooltip won't be intervened by the editor.
   *
   * For example, if tooltip is rendered inside the editor,
   *  rendering an `input` element will not be focusable.
   */
  const tooltipParent = document.getElementById(nodeId);

  // editorView.dom.parentNode && editorView.dom.parentNode.appendChild(tooltip);
  tooltipParent && tooltipParent.appendChild(tooltip);

  const render = (view: EditorView) => {
    const { anchor, head, empty } = view.state.selection;

    // These are in screen coordinates
    const anchorCoor = view.coordsAtPos(anchor);
    const headCoor = view.coordsAtPos(head);

    return (
      <ReactNode
        empty={empty}
        anchor={anchorCoor}
        head={headCoor}
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

export const buildTooltipPlugin = (
  nodeId: string,
  ReactNodes: FC<ITooltip>[]
) => ReactNodes.map(c => tooltipPlugin(nodeId, c));
