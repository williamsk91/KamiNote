import React, { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView, Decoration } from "prosemirror-view";

import { ISuggestion } from "./types";
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

  return {
    update: (view: EditorView, _lastState: EditorState) =>
      ReactDOM.render(
        <ReactContainer view={view} pluginKey={key} tooltip={tooltip} />,
        tooltip
      ),
    destroy: () => {
      ReactDOM.unmountComponentAtNode(tooltip);
      tooltip.remove();
    }
  };
};

interface IReactContainer {
  view: EditorView;
  pluginKey: PluginKey;
  tooltip: HTMLDivElement;
}

const ReactContainer: FC<IReactContainer> = props => {
  const { view, pluginKey, tooltip } = props;

  const [suggestion, setSuggestion] = useState<Decoration<ISuggestion> | null>(
    null
  );
  const [fromContextMenu, setFromContextMenu] = useState(false);

  /**
   * Open suggestion menu on right click
   */
  const contextmenuCallback = (e: MouseEvent) => {
    e.preventDefault();
    const deco: Decoration<ISuggestion> | null = getFirstDecoInCoord(
      view,
      pluginKey,
      {
        left: e.x,
        top: e.y
      }
    );

    setSuggestion(deco);
    setFromContextMenu(true);
  };

  useEffect(() => {
    document.addEventListener("contextmenu", contextmenuCallback);
    return () => {
      document.removeEventListener("contextmenu", contextmenuCallback);
    };
  }, []);

  /**
   * Close menu when selection changes.
   * Don't immediately close menu if context menu was just executed.
   */
  useEffect(() => {
    if (!fromContextMenu) {
      setSuggestion(null);
    }
    setFromContextMenu(false);
  }, [view.state.selection]);

  if (!suggestion) return null;

  const { state, dispatch } = view;
  const { left, top } = calcTooltipPosition(view, suggestion.from, tooltip);

  return (
    <Container left={left} top={top}>
      <SuggestionMenu
        suggestion={suggestion}
        onSelect={(suggestion, pos) => {
          dispatch(state.tr.insertText(suggestion, pos.from, pos.to));
          setSuggestion(null);
        }}
        onIgnore={phrase => {
          dispatch(state.tr.setMeta(pluginKey, { ignore: phrase }));
          setSuggestion(null);
        }}
      />
    </Container>
  );
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
