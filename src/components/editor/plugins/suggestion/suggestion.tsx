import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";

import { SuggestionMenu } from "./menu";
import { debounce } from "./debounce";
import { updateDecoSet, removeWordFromDecoSet } from "./inlineDeco";
import { suggestionTooltip } from "./suggestionTooltip";

interface ISuggestionPluginState {
  ignoreList: string[];
  decoSet: DecorationSet;
}

const suggestionKey = new PluginKey<ISuggestionPluginState>("suggestion");

/**
 * Adds suggestions to phrases that are possibly misspelled.
 *
 * `url` must be a websocket endpoint.
 * inline `suggestionDeco` is added onto these phrases.
 *
 * note: don't forget to add `suggestionPluginStyles` to
 *        highlight the phrases.
 */
export const suggestionPlugin = (url: string) => {
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
      /**
       * Also sends all text of starting doc.
       * Initialise state with empty decorationSet and empty ignoreList.
       */
      init: (_, instance) => {
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
       * apply does a couple of things
       *    1. updates decoration positions
       *
       *    if metadata is NOT included
       *        2. update affected range and debounce sending new suggestion request
       *
       *    if suggestion metadata is included
       *        3. update range's decoration
       *
       *    if ignore metadata is included
       *        4.a. removes `word` from all decorations
       *        4.b. add `word` to `ignoreList` to bew used in (3)
       */
      apply: (tr, value, _, newState) => {
        const { decoSet, ignoreList } = value;
        const suggestionMeta = tr.getMeta(suggestionKey);

        // ------------------------- 1. Update deco pos -------------------------
        let updatedDecoSet = decoSet.map(tr.mapping, tr.doc);

        // ------------------------- 2. New suggestion request -------------------------
        if (!suggestionMeta) {
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

          return { decoSet: updatedDecoSet, ignoreList };
        }

        // ------------------------- 3. Update deco -------------------------
        if (suggestionMeta.suggestion) {
          updatedDecoSet = updateDecoSet(
            updatedDecoSet,
            suggestionMeta.suggestion,
            ignoreList,
            newState,
            tr
          );
        }

        // ------------------------- 4. Remove ignored word -------------------------
        if (suggestionMeta.ignore) {
          const ignoreWord = suggestionMeta.ignore;

          /**
           * 4.a. removes decos with `spec.phrase` === `ignoreWord`
           */
          updatedDecoSet = removeWordFromDecoSet(updatedDecoSet, ignoreWord);

          /**
           * 4.b. Adds ignoreWord to the ignoreList.
           *      This list is used to prevent future addition of the phrase.
           */
          ignoreList.push(ignoreWord);
        }

        return { decoSet: updatedDecoSet, ignoreList };
      }
    },
    props: {
      decorations: state => suggestionKey.getState(state).decoSet
    },
    view: view => {
      localView = view;
      return suggestionTooltip(view, suggestionKey, SuggestionMenu);
    }
  });
};

// ------------------------- Helper function -------------------------

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
