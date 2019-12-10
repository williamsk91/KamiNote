import React, { FC } from "react";
import ReactDOM from "react-dom";

import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { IInlineSuggestion } from "./types";
import { ISuggestionTooltip } from "./menu";

// ------------------------- Suggestion Menu -------------------------

/**
 * Wrapper that finds the positions for `ReactNode` to render.
 */
export const suggestionTooltip = (
  view: EditorView,
  key: PluginKey,
  ReactNode: FC<ISuggestionTooltip>
) => {
  const tooltip = document.createElement("div");
  view.dom.parentElement && view.dom.parentElement.appendChild(tooltip);

  const render = (view: EditorView, suggestion?: IInlineSuggestion) => {
    const { state, dispatch } = view;

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
      <ReactNode
        left={left}
        top={top}
        suggestion={suggestion}
        onSelect={(suggestion, pos) => {
          dispatch(state.tr.insertText(suggestion, pos.from, pos.to));
        }}
        onIgnore={phrase => {
          dispatch(state.tr.setMeta(key, { ignore: phrase }));
        }}
      />
    );
  };

  return {
    update(view: EditorView, lastState: EditorState) {
      const state = view.state;

      // Don't do anything if the document / selection didn't change
      if (
        lastState.doc.eq(state.doc) &&
        lastState.selection.eq(state.selection)
      ) {
        return;
      }

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
