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
 *
 * -------------------- How it works --------------------
 *
 * suggestion plugin is composed of various components
 *    1. **suggestion list** - a list of misspelled words
 *         and possible intended words called candidates.
 *    2. **decoration set** - a set of inline decoration that
 *        adds a className to misspelled word.
 *    3. **tooltip** - a tooltip menu that allows user to fix
 *        misspelled word or ignore it.
 *
 * ### 1. suggestion list
 * The suggestion list is never stored. `SuggestionPlugin`
 *  simply sends `key` and `text` to websocket suggestion
 *  server with endpoint specified by the `url` argument.
 *
 * On initialisation, `suggestionPlugin` will get all the
 *  starting text and request a **suggestion list**.
 *
 * On every update, `suggestionPlugin` will only request **suggestion
 *  list** for the updated words. i.e. if your content changes from
 *  "Initial par" to "Initial paragraph", `suggestionPlugin` will
 *  request a suggestion list with `text` set to `"paragraph"`.
 *
 * ### 2. decoration set
 * The **decoration set** is a set on inline decoration for that
 *  particular document.
 *
 * It is updated whenever the server responds. The server will responds
 *  with the same `key` we sent. Therefore, we set `key` as identification
 *  of changed text.
 *
 * ### 3. tooltip
 * `suggestionTooltip` shows up whenever the selection is inside a misspelled word.
 *  It will render a `SuggestionMenu` React component that allows users to
 *  the replace misspelled word with one of the candidates. The menu also
 *  allows user to ignore the word globally. This ignored word is stored
 *  in window.localStorage.
 *
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

    // don't send empty text
    if (textContent.trim() !== "") {
      sendToSocket({ from: inclusiveFrom, to: inclusiveTo }, textContent);
    }

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
          const from = 1;
          const to = instance.doc.content.size;
          const textContent = instance.doc.textBetween(from, to, " ");
          sendToSocket({ from, to }, textContent);
        };
        return {
          ignoreList: getIgnoreList(),
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

        // deco from changed text should be removed as it becomes outdated
        if (tr.docChanged) {
          let from: number = Infinity;
          let to: number = 0;
          tr.mapping.maps.map(stepMap => {
            stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
              from = Math.min(from, newStart);
              to = Math.max(to, newEnd);
            });
          });

          const outdatedDeco = updatedDecoSet.find(from, to);
          updatedDecoSet = updatedDecoSet.remove(outdatedDeco);
        }

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
          setIgnoreList(ignoreList);
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
 * test if char is a word boundary or not.
 */
const testWordBoundary = (char?: string): boolean =>
  char ? !RegExp(/\W/).test(char) : false;

/**
 * Get word(s) that wraps the range (`from` - `to`).
 */
const getInclusiveText = (tr: Transaction, from: number, to: number) => {
  let inclusiveFrom: number = from;
  let inclusiveTo: number = to;

  // grow text to the left
  let prevChar = tr.doc.textBetween(inclusiveFrom - 1, inclusiveFrom);
  while (testWordBoundary(prevChar)) {
    inclusiveFrom--;
    prevChar = tr.doc.textBetween(inclusiveFrom - 1, inclusiveFrom);
  }

  // grow text to the right
  let nextChar = tr.doc.textBetween(inclusiveTo, inclusiveTo + 1);
  while (testWordBoundary(nextChar)) {
    inclusiveTo++;
    nextChar = tr.doc.textBetween(inclusiveTo, inclusiveTo + 1);
  }

  const textContent = tr.doc.textBetween(inclusiveFrom, inclusiveTo, " ");

  return { inclusiveFrom, inclusiveTo, textContent };
};

// ------------------------- ignore list -------------------------
const ignoreListLocalStorage = "ignore_spellings";

/** Read the word igore list from localstorage (or fail doing nothing) */
function getIgnoreList() {
  try {
    const ignoreList = window.localStorage.getItem(ignoreListLocalStorage);
    if (ignoreList) {
      return JSON.parse(ignoreList);
    }
  } catch (e) {
    return [];
  }
  return [];
}

/** Update or set the Ignore list in localstorage */
function setIgnoreList(list: string[]) {
  try {
    window.localStorage.setItem(ignoreListLocalStorage, JSON.stringify(list));
  } catch (e) {
    console.log(e);
  }
}
