import React, { FC } from "react";
import ReactDOM from "react-dom";
import { Plugin, EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";

export interface ITooltip {
  view: EditorView;
}

export type Tooltip = (view: EditorView) => FC | null;

/**
 * Render **one** React component when there is a selection.
 *  `view` is passed to the React component.
 *
 * The React component is chosen from the array passed. The first one that
 *  returns a react component and not a null gets rendered.
 *
 * The component is rendered as a child of node with nodeId.
 */
export const tooltipPlugin = (
  nodeId: string,
  editorId: string,
  tooltips: Tooltip[]
) =>
  new Plugin({
    view: () => tooltip(nodeId, editorId, tooltips)
  });

const tooltip = (nodeId: string, editorId: string, tooltips: Tooltip[]) => {
  /**
   * This requires a div tag outside of the editor.
   *  By rendering it outside of the editor, the selection
   *  made inside the tooltip won't be intervened by the editor.
   *
   * For example, if tooltip is rendered inside the editor,
   *  rendering an `input` element will not be focusable.
   */
  const tooltip = document.getElementById(nodeId) as HTMLDivElement;

  const render = (view: EditorView) => {
    const anchorCoords = view.coordsAtPos(view.state.selection.anchor);

    const editor = document.getElementById(editorId);
    let box = editor ? editor.getBoundingClientRect() : { left: 0, top: 0 };

    const left = anchorCoords.left - box.left;
    const top = anchorCoords.bottom - box.top;

    const Component = getComponent(tooltips, view);

    return (
      <Container left={left} top={top}>
        {Component && <Component />}
      </Container>
    );
  };

  return {
    update(view: EditorView, lastState: EditorState | null) {
      const state = view.state;

      /**
       * Don't do anything if:
       *  document is the same AND
       *  selection is the same
       */
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

/**
 * Get the first tooltip component that does not return null
 */
const getComponent = (tooltips: Tooltip[], view: EditorView): FC | null => {
  for (let i = 0; i < tooltips.length; i++) {
    const candidate = tooltips[i](view);
    if (candidate) return candidate;
  }
  return null;
};

const Container = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${p => `${p.left}px`};
  top: ${p => `${p.top}px`};
`;
