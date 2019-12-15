import React, { FC, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { IInlineSuggestion } from "./types";
import { getFirstDecoInCoord } from "./inlineDeco";
import { SuggestionMenu } from "./SuggestionMenu";

// ------------------------- Suggestion Menu -------------------------

/**
 * Wrapper that finds the positions for `SuggestionMenu` to render.
 *
 * Also passes information about the misspelled phrase.
 */
export const suggestionTooltip = (view: EditorView, key: PluginKey) => {
  const tooltip = document.createElement("div");

  const editorNode = view.dom.parentElement;
  editorNode && editorNode.appendChild(tooltip);

  const ReactContainer: FC<{ view: EditorView }> = props => {
    const [suggestion, setSuggestion] = useState<IInlineSuggestion | null>(
      null
    );
    const [fromContextMenu, setFromContextMenu] = useState(false);

    /**
     * IInlineSuggestion
     * open suggestion menu on right click
     */
    const contextmenuCallback = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        const deco = getFirstDecoInCoord(view, key, { left: e.x, top: e.y });

        setSuggestion(deco ? deco.spec : null);
        setFromContextMenu(true);
      },
      [setSuggestion, view]
    );

    useEffect(() => {
      document.addEventListener("contextmenu", contextmenuCallback);
      return () => {
        document.removeEventListener("contextmenu", contextmenuCallback);
      };
    }, [contextmenuCallback]);

    /**
     * Close menu when selection changes.
     * Don't immediately close menu if context menu was just executed.
     */
    useEffect(() => {
      if (!fromContextMenu) {
        setSuggestion(null);
      }
      setFromContextMenu(false);
    }, [setSuggestion, view.state.selection]);

    if (!suggestion) return null;

    const { state, dispatch } = props.view;
    const { left, top } = calcTooltipPosition(
      view,
      suggestion.pos.from,
      tooltip
    );

    return (
      <Container left={left} top={top}>
        <SuggestionMenu
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
    update: (view: EditorView, _lastState: EditorState) =>
      ReactDOM.render(<ReactContainer view={view} />, tooltip),
    destroy: () => {
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

/**
 * Calculate tooltip position to be just under
 *  the pos.
 *
 * The returned values are left and top values in px
 *  for the container with absolute position relative
 *  to `tooltip`.
 */
const calcTooltipPosition = (
  view: EditorView,
  pos: number,
  tooltip: HTMLDivElement
) => {
  const phraseStart = view.coordsAtPos(pos);

  let box = tooltip.offsetParent
    ? tooltip.offsetParent.getBoundingClientRect()
    : { left: 0, top: 0 };

  const left = phraseStart.left - box.left;
  const top = phraseStart.bottom - box.top;
  return { left, top };
};
