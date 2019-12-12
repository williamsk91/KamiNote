import React, { FC } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { IInlineSuggestion, ISuggestionMenu } from "./types";

// ------------------------- Suggestion Menu -------------------------

/**
 * Wrapper that finds the positions for `ReactNode` to render.
 *
 * Also passes in information about the misspelled phrase.
 */
export const suggestionTooltip = (
  view: EditorView,
  key: PluginKey,
  ReactNode: FC<ISuggestionMenu>
) => {
  const tooltip = document.createElement("div");
  view.dom.parentElement && view.dom.parentElement.appendChild(tooltip);

  const render = (view: EditorView, suggestion?: IInlineSuggestion) => {
    const { state, dispatch } = view;

    // calculates absolute positions for `Container`
    // to be just under the phrase
    let left = 0;
    let top = 0;
    if (suggestion) {
      const phraseStart = view.coordsAtPos(suggestion.pos.from);

      let box = tooltip.offsetParent
        ? tooltip.offsetParent.getBoundingClientRect()
        : { left: 0, top: 0 };

      left = phraseStart.left - box.left;
      top = phraseStart.bottom - box.top;
    }

    return (
      <Container left={left} top={top}>
        <ReactNode
          suggestion={suggestion}
          onSelect={(suggestion, pos) => {
            dispatch(state.tr.insertText(suggestion, pos.from, pos.to));
          }}
          onIgnore={phrase => {
            dispatch(state.tr.setMeta(key, { ignore: phrase }));
          }}
        />
      </Container>
    );
  };

  return {
    update(view: EditorView, _lastState: EditorState) {
      const state = view.state;

      /**
       * get deco if selection is inside it
       */
      const { from, to } = state.selection;

      const decoSet = key.getState(state).decoSet;

      const decoInFrom = decoSet && decoSet.find(from, from);
      let singleDeco = decoInFrom[0] ? decoInFrom[0].spec : null;

      if (singleDeco && singleDeco.pos.to < to) {
        singleDeco = null;
      }

      // render / update react
      const tooltipComponent = render(view, singleDeco);
      tooltipComponent && ReactDOM.render(tooltipComponent, tooltip);
    },

    destroy() {
      ReactDOM.unmountComponentAtNode(tooltip);
      tooltip.remove();
    }
  };
};

/**
 * Positions the react component just under misspelled text.
 */
const Container = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${p => `${p.left}px`};
  top: ${p => `${p.top}px`};
`;
