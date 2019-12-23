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
export const tooltipPlugin = (tooltips: Tooltip[]) =>
  new Plugin({
    view: view => tooltip(view, tooltips)
  });

const tooltip = (view: EditorView, tooltips: Tooltip[]) => {
  /**
   * This is a tooltip node rendered inside the editor.
   * This is only used to get the position to render the actual tooltip
   * that is rendered as sibling of the editor
   */
  const tooltip = document.createElement("div");
  view.dom.parentNode &&
    view.dom.parentNode.parentNode &&
    view.dom.parentNode.parentNode.appendChild(tooltip);

  const render = (view: EditorView) => {
    const anchorCoords = view.coordsAtPos(view.state.selection.anchor);

    const parentNode = tooltip.parentElement;
    let box = parentNode
      ? parentNode.getBoundingClientRect()
      : { left: 0, top: 0 };

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

      /**
       * Don't show any tooltip on title
       */
      if (
        lastState &&
        lastState.selection.$from.parent.type === lastState.schema.nodes.title
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
