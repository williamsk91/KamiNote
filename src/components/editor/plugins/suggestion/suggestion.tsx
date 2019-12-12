import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import { StepMap } from "prosemirror-transform";
import { Node } from "prosemirror-model";

import { SuggestionMenu } from "./SuggestionMenu";
import { debounce } from "./debounce";
import { updateDecoSet } from "./inlineDeco";
import { suggestionTooltip } from "./tooltip";

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
    if (text.trim() !== "") {
      socket.send(
        JSON.stringify({
          key: JSON.stringify(key),
          text
        })
      );
    }
  };

  // ------------------------- Plugin State helpers  -------------------------

  // affected range by the debounced transactions
  let trFrom: number = Infinity;
  let trTo: number = 0;
  const debouncedSendRequest = debounce((tr: Transaction) => {
    // Get words around the changed text
    const { inclusiveFrom, inclusiveTo, textContent } = getInclusiveText(
      tr,
      trFrom,
      trTo
    );

    // ensure `from` starts at a text position
    const fromTextNode = findTextNode(localView.state.doc, inclusiveFrom);

    sendToSocket({ from: fromTextNode, to: inclusiveTo }, textContent);

    trFrom = Infinity;
    trTo = 0;
  }, 1000);

  // ------------------------- Plugin instance -------------------------

  return new Plugin<ISuggestionPluginState>({
    key: suggestionKey,
    state: {
      /**
       * Sends all text of starting doc.
       * Initialise state with empty decorationSet and ignoreList
       * from localStorage.
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
      apply: (tr, { decoSet, ignoreList }, _, newState) => {
        const suggestionMeta = tr.getMeta(suggestionKey);

        // ------------------------- 1. Update deco pos -------------------------
        let updatedDecoSet = decoSet.map(tr.mapping, tr.doc);

        // deco from changed text should be removed as it becomes outdated
        if (tr.docChanged) {
          const { from, to } = transactionRange(tr);

          const outdatedDeco = updatedDecoSet.find(from, to);
          updatedDecoSet = updatedDecoSet.remove(outdatedDeco);
        }

        // ------------------------- 2. New suggestion request -------------------------
        if (!suggestionMeta) {
          if (tr.docChanged) {
            // updating range
            const { from, to } = transactionRange(tr);
            trFrom = Math.min(trFrom, from);
            trTo = Math.max(trTo, to);

            debouncedSendRequest(tr);
          }

          return { decoSet: updatedDecoSet, ignoreList };
        }

        // ------------------------- 3. Update suggestion from server -------------------------
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
          const invalidDeco = decoSet.find(
            undefined,
            undefined,
            spec => spec.phrase === ignoreWord
          );
          updatedDecoSet = updatedDecoSet.remove(invalidDeco);

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

// ------------------------- Transaction -------------------------

/**
 * get the range (i.e. from and to) of a transaction
 */
export const transactionRange = (tr: Transaction) =>
  tr.mapping.maps.reduce(
    (acc, stepMap) => {
      const { from, to } = stepMapRange(stepMap);
      const minFrom = Math.min(from, acc.from);
      const maxTo = Math.max(to, acc.to);
      return { from: minFrom, to: maxTo };
    },
    { from: Infinity, to: 0 }
  );

/**
 * Get the range of the stepMap
 */
const stepMapRange = (stepMap: StepMap) => {
  let from = Infinity;
  let to = 0;
  stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
    from = Math.min(from, newStart);
    to = Math.max(to, newEnd);
  });
  return { from, to };
};

// ------------------------- Inclusive Text -------------------------

/**
 * Test if char is a word boundary char or not.
 */
const notWordChar = (char?: string): boolean =>
  char ? RegExp(/\W/).test(char) : true;

/**
 * Grow pos to the left
 */
const leftWordBoundary = (tr: Transaction, pos: number): number => {
  const prevChar = tr.doc.textBetween(pos - 1, pos);
  if (notWordChar(prevChar)) return pos;
  return leftWordBoundary(tr, pos - 1);
};

/**
 * Grow pos to the right
 */
const rightWordBoundary = (tr: Transaction, pos: number): number => {
  const nextChar = tr.doc.textBetween(pos, pos + 1);
  if (notWordChar(nextChar)) return pos;
  return rightWordBoundary(tr, pos + 1);
};

/**
 * Get word(s) that wraps the range (`from` - `to`).
 */
const getInclusiveText = (tr: Transaction, from: number, to: number) => {
  const inclusiveFrom = leftWordBoundary(tr, from);
  const inclusiveTo = rightWordBoundary(tr, to);
  const textContent = tr.doc.textBetween(inclusiveFrom, inclusiveTo, " ");

  return { inclusiveFrom, inclusiveTo, textContent };
};

/**
 * Find the first pos that meets 2 conditions
 *    1. pos > given pos
 *    2. pos is a textNode
 */
const findTextNode = (doc: Node, pos: number): number => {
  // -1 is needed as `nodeAt` looks at node
  // directly after the given pos
  const node = doc.nodeAt(pos - 1);
  if (node && node.isText) return pos;
  return findTextNode(doc, pos + 1);
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
