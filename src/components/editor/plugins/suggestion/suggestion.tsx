import React, { FC } from "react";
import ReactDOM from "react-dom";
import { css } from "styled-components";

import { Plugin, PluginKey, EditorState, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration, EditorView } from "prosemirror-view";
import { NodeType } from "prosemirror-model";

import { ISuggestionTooltip, SuggestionMenu } from "./menu";
import { debounce } from "./debounce";

export interface ITextPos {
  from: number;
  to: number;
}

export interface ISuggestion {
  phrase: string;
  candidates: string[];
}

/**
 * suggestions for the text in the range `from` - `to`
 */
interface ITextSuggestion {
  key: ITextPos;
  suggestions: ISuggestion[];
}

/**
 * `pos` of `phrase` from `ISuggestion` in doc.
 */
export interface IInlineSuggestion extends ISuggestion {
  pos: ITextPos;
}

interface ISuggestionPluginState {
  ignoreList: string[];
  decoSet: DecorationSet;
}

const suggestionKey = new PluginKey<ISuggestionPluginState>("suggestion");

// ------------------------- Inline Decoration -------------------------

const decoClass = "suggestionClass";

const suggestionDeco = (from: number, to: number, spec: IInlineSuggestion) => {
  return Decoration.inline(
    from,
    to,
    {
      class: decoClass
    },
    spec
  );
};

export const suggestionPluginStyles = css`
  .${decoClass} {
    text-decoration: solid underline red;

    :hover {
      background: pink;
    }
  }
`;

// ------------------------- Plugin -------------------------
/**
 * Suggestion plugin.
 */
export const suggestionPlugin = (url: string, ignoreNodeType: NodeType[]) => {
  /**
   * local view is set in plugin's view.
   * This allows plugin's state to call dispatch.
   */
  let localView: EditorView;

  // ------------------------- Socket -------------------------

  const socket = new WebSocket(url);

  /**
   * Create a transaction with suggestion metadata to
   * update inline decorations.
   */
  socket.onmessage = e => {
    const suggestions = JSON.parse(e.data);
    const key = JSON.parse(suggestions.key);

    localView.dispatch(
      localView.state.tr.setMeta(suggestionKey, {
        suggestion: { key, suggestions: suggestions.suggestions }
      })
    );
  };

  /**
   * Requests server for suggestions.
   */
  const sendToSocket = (key: { from: number; to: number }, text: string) => {
    socket.send(
      JSON.stringify({
        key: JSON.stringify(key),
        text
      })
    );
  };

  // ------------------------- Plugin State helpers  -------------------------

  // affected range by the debounced transactions
  let trFrom: number = Infinity;
  let trTo: number = 0;
  const debouncedSendRequest = debounce((tr: Transaction) => {
    const { inclusiveFrom, inclusiveTo, textContent } = getInclusiveText(
      tr,
      trFrom,
      trTo
    );

    sendToSocket({ from: inclusiveFrom, to: inclusiveTo }, textContent);

    trFrom = Infinity;
    trTo = 0;
  }, 1000);

  // ------------------------- Plugin instance -------------------------

  return new Plugin<ISuggestionPluginState>({
    key: suggestionKey,
    state: {
      init: (_, instance) => {
        /**
         * send all immediate blocks of starting doc
         */
        socket.onopen = () => {
          const { content, textContent } = instance.doc;
          sendToSocket({ from: 1, to: content.size }, textContent);
        };

        return {
          ignoreList: [],
          decoSet: DecorationSet.empty
        };
      },
      /**
       * Does a couple of things
       *    1. updates decoration positions
       *
       *    if suggestion metadata is included
       *        2. update that block's decoration
       *
       *    if ignore metadata is included
       *        3. removes this word from all decorations
       *
       *    if no metadata is NOT included
       *        4. find affected blocks and send new suggestion request
       */
      apply: (tr, value, _oldState, newState) => {
        // ------------------------- 1. Update deco pos -------------------------
        let updatedDecoSet = value.decoSet.map(tr.mapping, tr.doc);
        const ignoreList = value.ignoreList;

        const suggestionMeta = tr.getMeta(suggestionKey);

        if (suggestionMeta && suggestionMeta.suggestion) {
          // ------------------------- 2. Remove & Add deco -------------------------

          /**
           * Suggestion from the server
           */
          const { key } = suggestionMeta.suggestion as ITextSuggestion;

          /**
           * remove all decos from this range
           */
          const { from, to } = key;
          const currRangeDeco = updatedDecoSet.find(from, to);
          updatedDecoSet = updatedDecoSet.remove(currRangeDeco);

          /**
           * Add new decos onto the block
           */
          const inlineSuggestions: IInlineSuggestion[] = phraseToPos(
            newState,
            suggestionMeta.suggestion
          );

          const validInlineSuggestions = inlineSuggestions.filter(
            ({ phrase }) => !ignoreList.includes(phrase)
          );

          const newDecos: Decoration[] = [];
          validInlineSuggestions.map(({ pos, phrase, candidates }) => {
            newDecos.push(
              suggestionDeco(pos.from, pos.to, { phrase, candidates, pos })
            );
          });

          // add deco
          updatedDecoSet = updatedDecoSet.add(tr.doc, newDecos);
        } else if (suggestionMeta && suggestionMeta.ignore) {
          // ------------------------- 3. Removes ignored word from all decos -------------------------
          const ignoreWord = suggestionMeta.ignore;

          const currDecoToBeIgnored = updatedDecoSet.find(
            0,
            tr.doc.content.size,
            spec => spec.phrase === ignoreWord
          );

          updatedDecoSet = updatedDecoSet.remove(currDecoToBeIgnored);

          /**
           * Adds ignoreWord to the ignoreList.
           * This list is used to prevent future addition of the phrase.
           */
          ignoreList.push(ignoreWord);
        } else {
          // ------------------------- 4. New suggestion request -------------------------
          if (tr.docChanged) {
            // updating range
            tr.mapping.maps.map(stepMap => {
              stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                trFrom = Math.min(trFrom, newStart);
                trTo = Math.max(trTo, newEnd);
              });
            });

            debouncedSendRequest(tr);
          }
        }

        return { decoSet: updatedDecoSet, ignoreList };
      }
    },
    props: {
      decorations: state => suggestionKey.getState(state).decoSet
    },
    view: view => {
      localView = view;
      return suggestionTooltip(view, SuggestionMenu);
    }
  });
};

// ------------------------- Suggestion Menu -------------------------

/**
 * Wrapper that finds the positions for `ReactNode` to render.
 */
const suggestionTooltip = (
  view: EditorView,
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
          dispatch(state.tr.setMeta(suggestionKey, { ignore: phrase }));
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

      const decoSet = suggestionKey.getState(state).decoSet;

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

// ------------------------- Helper function -------------------------

/**
 * Get IInlineSuggestion[] (to be passed to inline decoration) from
 * IBlockSuggestion[] where key is the pos of block
 */
const phraseToPos = (
  state: EditorState,
  textSuggestions: ITextSuggestion
): IInlineSuggestion[] => {
  const inlineSuggestions: IInlineSuggestion[] = [];
  const { key, suggestions } = textSuggestions;
  const { from, to } = key;

  // blockSeparator (i.e. "||") and leafText (i.e. "|")
  // is added to align obtained text position with
  // editor's text position.
  const text = state.doc.textBetween(from, to, "||", "|");

  suggestions.map(({ phrase, candidates }) => {
    const phrasePositions = findSubtextPos(from, text, phrase);
    phrasePositions.map(pos => {
      inlineSuggestions.push({ pos, phrase, candidates });
    });
  });

  return inlineSuggestions;
};

/**
 * find the pos of subText (could be multiple) given the text and the
 *  text's starting pos
 */
const findSubtextPos = (
  textStartPos: number,
  text: string,
  subText: string
): ITextPos[] => {
  const re = new RegExp(`\\b${subText}\\b`, "g");

  let positions: ITextPos[] = [];

  let match = re.exec(text);
  while (match) {
    const from = textStartPos + match.index;
    positions.push({
      from,
      to: from + match[0].length
    });
    match = re.exec(text);
  }
  return positions;
};

/**
 * Get word(s) that wraps the range (`from` - `to`).
 * Word ends when there is space.
 */
const getInclusiveText = (tr: Transaction, from: number, to: number) => {
  let inclusiveFrom: number = from;
  let inclusiveTo: number = to;

  let prevChar = tr.doc.textBetween(inclusiveFrom - 1, inclusiveFrom);
  while (!(prevChar === " " || prevChar === "")) {
    inclusiveFrom--;
    prevChar = tr.doc.textBetween(inclusiveFrom - 1, inclusiveFrom);
  }

  let nextChar = tr.doc.textBetween(inclusiveTo, inclusiveTo + 1);
  while (!(nextChar === " " || nextChar === "")) {
    inclusiveTo++;
    nextChar = tr.doc.textBetween(inclusiveTo, inclusiveTo + 1);
  }

  const textContent = tr.doc.textBetween(inclusiveFrom, inclusiveTo);

  return { inclusiveFrom, inclusiveTo, textContent };
};
