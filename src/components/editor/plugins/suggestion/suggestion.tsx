import React, { FC } from "react";
import ReactDOM from "react-dom";
import { css } from "styled-components";

import { Plugin, PluginKey, EditorState, Transaction } from "prosemirror-state";
import { DecorationSet, Decoration, EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";

import { ISuggestionTooltip, SuggestionMenu } from "./menu";
import { debounce } from "./debounce";

export interface ISuggestion {
  phrase: string;
  candidates: string[];
}

interface IBlockSuggestion {
  key: string;
  suggestions: ISuggestion[];
}

/**
 * Pos is used to decorate inline
 */
export interface IInlineSuggestion extends ISuggestion {
  pos: ITextPos;
}

export interface ITextPos {
  from: number;
  to: number;
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
    localView.dispatch(
      localView.state.tr.setMeta(suggestionKey, { suggestion: e.data })
    );
  };

  /**
   * Asks server for suggestions.
   */
  const sendToSocket = (key: number, text: string) => {
    socket.send(
      JSON.stringify({
        key: key.toString(),
        text
      })
    );
  };

  // ------------------------- Plugin State helpers  -------------------------

  const debouncedSendRequest = debounce(sendRequest, 500);

  /**
   * Refer to `sendValidNode` for more info
   */
  const nodeCheck = sendValidNode(sendToSocket, ignoreNodeType);

  // ------------------------- Plugin instance -------------------------

  return new Plugin<ISuggestionPluginState>({
    key: suggestionKey,
    state: {
      init: (_, instance) => {
        /**
         * send all immediate blocks of starting doc
         */
        socket.onopen = () => {
          instance.doc.descendants(nodeCheck);
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
          const blockSuggestions: IBlockSuggestion = JSON.parse(
            suggestionMeta.suggestion
          );

          /**
           * remove all decos from this block
           */
          const from = +blockSuggestions.key;
          const node = tr.doc.nodeAt(from);
          const nodeSize = node ? node.nodeSize : 0;
          const to = from + nodeSize;
          const currBlockDeco = updatedDecoSet.find(from, to);

          updatedDecoSet = updatedDecoSet.remove(currBlockDeco);

          /**
           * Add new decos onto the block
           *
           * TODO: could be improved by only changing
           * the edited text as opposed to whole node
           */
          const inlineSuggestions = phraseToPos(newState, blockSuggestions);

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
          debouncedSendRequest(tr, nodeCheck);
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
  blockSuggestions: IBlockSuggestion
): IInlineSuggestion[] => {
  const inlineSuggestions: IInlineSuggestion[] = [];
  blockSuggestions.suggestions.map(({ phrase, candidates }) => {
    const blockStartPos = +blockSuggestions.key;

    const blockNode = state.doc.nodeAt(blockStartPos);
    if (blockNode) {
      const text = blockNode.textContent;

      const phrasePositions = findSubtextPos(blockStartPos + 1, text, phrase);
      phrasePositions.map(pos => {
        inlineSuggestions.push({ pos, phrase, candidates });
      });
    }
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
 * Helper for `node.descendants` in state initialisation
 * and `node.nodesBetween` in `sendRequest`.
 */
const sendValidNode = (
  sendToSocket: (key: number, text: string) => void,
  ignoreNodeType: NodeType[]
) => (node: Node, pos: number) => {
  if (ignoreNodeType.includes(node.type)) return false;

  sendToSocket(pos, node.textContent);

  // to not iterate deeper.
  return false;
};

/**
 * Send suggestion requests on affected nodes
 */
const sendRequest = (
  tr: Transaction,
  nodeCheck: (node: Node, pos: number) => boolean
) => {
  /**
   * the pos range affected by this transaction
   */
  let from = tr.doc.content.size,
    to = 0;
  tr.mapping.maps.map(stepMap => {
    stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      from = Math.min(from, newStart);
      to = Math.max(to, newEnd);
    });
  });

  /**
   * request suggestion on valid affected nodes.
   */
  tr.doc.nodesBetween(from, to, nodeCheck);
};
