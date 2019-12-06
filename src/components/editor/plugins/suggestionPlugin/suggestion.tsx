import React, { FC } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { Plugin, PluginKey, EditorState } from "prosemirror-state";
import { DecorationSet, Decoration, EditorView } from "prosemirror-view";
import { ITooltip } from "../tooltip";
import { ISuggestionTooltip, SuggestionMenu } from "./menu";

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
interface IInlineSuggestion extends ISuggestion {
  pos: ITextPos;
}

interface ITextPos {
  from: number;
  to: number;
}

const suggestionKey = new PluginKey("suggestion");

interface ISuggestionPluginState {
  decoSet: DecorationSet;
}

// ------------------------- Inline Decoration -------------------------

const decoClass = "suggestionClass";

const suggestionDeco = (from: number, to: number, spec: ISuggestion) => {
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
export const suggestionPlugin = (url: string) => {
  /**
   * local view is set in plugin's view.
   * This allows plugin's state to call dispatch.
   *
   */
  let localView: EditorView;

  // ------------------------- Socket -------------------------

  const socket = new WebSocket(url);
  /**
   * Create a transaction with suggestionMetadata to
   * update inline decorations.
   *
   * Check state apply function
   */
  socket.onmessage = e => {
    localView.dispatch(
      localView.state.tr.setMeta(suggestionKey, { suggestion: e.data })
    );
  };

  /**
   *
   */
  const sendToSocket = (key: number, text: string) => {
    socket.send(
      JSON.stringify({
        key: key.toString(),
        text
      })
    );
  };

  // ------------------------- Plugin instance -------------------------

  return new Plugin<ISuggestionPluginState>({
    key: suggestionKey,
    state: {
      init: (_, instance) => {
        /**
         * send all immediate blocks of starting doc
         */
        socket.onopen = () => {
          instance.doc.descendants((node, pos) => {
            sendToSocket(pos, node.textContent);

            // to not iterate deeper.
            return false;
          });
        };

        return {
          decoSet: DecorationSet.empty
        };
      },
      /**
       * Does a couple of things
       *    1. updates decoration positions
       *
       *    if suggestionMetadata is included
       *        2.a. update that block's decoration
       *
       *    if suggestionMetadata is NOT included
       *        2.b. find affected blocks and send new suggestion request
       */
      apply: (tr, value, _oldState, newState) => {
        // ------------------------- 1. Update deco pos -------------------------
        let updatedDecoSet = value.decoSet.map(tr.mapping, tr.doc);

        const suggestionMeta = tr.getMeta(suggestionKey);

        if (suggestionMeta) {
          // ------------------------- 2.a Remove & Add deco -------------------------
          /**
           * Suggestion from the server
           */
          const blockSuggestions: IBlockSuggestion = JSON.parse(
            suggestionMeta.suggestion
          );

          /**
           * Remove all decos from this block
           */
          const from = +blockSuggestions.key;
          const nodeSize = tr.doc.nodeAt(from).nodeSize;
          const to = from + nodeSize;
          const currBlockDeco = updatedDecoSet.find(from, to);

          // remove old deco
          updatedDecoSet = updatedDecoSet.remove(currBlockDeco);

          /**
           * Add new decos onto the block
           *
           * TODO: could be improved by only changing
           * the edited text as opposed to whole node
           */
          const inlineSuggestions = phraseToPos(newState, blockSuggestions);
          const newDecos: Decoration[] = [];
          inlineSuggestions.map(({ pos: { from, to }, phrase, candidates }) => {
            newDecos.push(suggestionDeco(from, to, { phrase, candidates }));
          });

          // add deco
          updatedDecoSet = updatedDecoSet.add(tr.doc, newDecos);
        } else {
          // ------------------------- New suggestion request -------------------------

          /**
           * the max ranges affected by this transaction
           *
           * this is to find all affected nodes
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
           * send affected nodes
           */
          tr.doc.nodesBetween(from, to, (node, pos) => {
            sendToSocket(pos, node.textContent);

            // to not iterate deeper.
            return false;
          });
        }

        return { decoSet: updatedDecoSet };
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

const suggestionTooltip = (
  view: EditorView,
  ReactNode: FC<ISuggestionTooltip>
) => {
  const tooltip = document.createElement("div");
  view.dom.parentElement && view.dom.parentElement.appendChild(tooltip);

  const render = (view: EditorView, suggestion?: ISuggestion) => {
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
        suggestion={suggestion}
      />
    );
  };

  return {
    update(view: EditorView, lastState: EditorState) {
      const state = view.state;

      // Don't do anything if the document/selection didn't change
      if (
        lastState.doc.eq(state.doc) &&
        lastState.selection.eq(state.selection)
      ) {
        return;
      }

      /**
       * Check that selection is in one of the misspelled phrase
       */
      const { anchor } = state.selection;

      const stateDecos = suggestionKey.getState(state).decoSet;
      const decos = stateDecos && stateDecos.find(anchor, anchor);

      /**
       * Get the current inline decoration selected.
       * Should only be one
       */
      const selectedDeco = decos[0] ? decos[0].spec : null;

      // render / update react
      const tooltipComponent = render(view, selectedDeco);
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
 * range of pos that is affected by the transaction
 */
// const rangeFromTransform = (tr: Transaction) => {
//   let from: number = tr.doc.nodeSize;
//   let to: number = 0;

//   tr.steps.map(step => {
//     console.log("step: ", step);
//     console.log("step.getMap(): ", step.getMap());

//     from = Math.min(step.from, from);
//     to = Math.max(step.to, to);
//   });

//   return { from, to };
// };
