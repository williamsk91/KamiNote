import React, { FC, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { IInlineSuggestion, ISuggestionMenu } from "./types";
import { getFirstDecoInCoord } from "./inlineDeco";

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

  const editorNode = view.dom.parentElement;
  editorNode && editorNode.appendChild(tooltip);

  const ReactContainer: FC<{ view: EditorView }> = props => {
    const [suggestion, setSuggestion] = useState<IInlineSuggestion | null>(
      null
    );
    const [fromContextMenu, setFromContextMenu] = useState(false);

    /**IInlineSuggestion
     * open suggestion menu on right click
     */
    const contextmenuCallback = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        const deco = getFirstDecoInCoord(view, key, { left: e.x, top: e.y });

        setSuggestion(deco ? deco.spec : null);
        setFromContextMenu(true);
      },
      [setSuggestion]
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

    // calculates absolute positions for `Container`
    // to be just under the phrase
    let left = 0;
    let top = 0;
    const phraseStart = view.coordsAtPos(suggestion.pos.from);

    let box = tooltip.offsetParent
      ? tooltip.offsetParent.getBoundingClientRect()
      : { left: 0, top: 0 };

    left = phraseStart.left - box.left;
    top = phraseStart.bottom - box.top;

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
