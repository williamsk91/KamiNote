import { css } from "styled-components";

import { Decoration, DecorationSet } from "prosemirror-view";
import { Transaction, EditorState } from "prosemirror-state";

import { ITextSuggestion, IInlineSuggestion, ITextPos } from "./types";

// ------------------------- Creation -------------------------

const decoClass = "suggestionClass";

export const suggestionDeco = (
  from: number,
  to: number,
  spec: IInlineSuggestion
) => {
  return Decoration.inline(
    from,
    to,
    {
      class: decoClass
    },
    spec
  );
};

// ------------------------- Styles -------------------------

export const suggestionPluginStyles = css`
  .${decoClass} {
    text-decoration: solid underline red;

    :hover {
      background: pink;
    }
  }
`;

// ------------------------- Helper Functions -------------------------

/**
 * Remove decos from `decoSet` and add new decos using `textSuggestion`
 * and `ignoreList`.
 *
 * `state` and `tr` is required to add decos on the correct positions.
 */
export const updateDecoSet = (
  decoSet: DecorationSet,
  textSuggestion: ITextSuggestion,
  ignoreList: string[],
  state: EditorState,
  tr: Transaction
) => {
  const { key } = textSuggestion;
  const { from, to } = key;

  // outdated decos
  const outdatedDeco = decoSet.find(from, to);

  // all inline suggestions
  const inlineSuggestions: IInlineSuggestion[] = phraseToPos(
    state,
    textSuggestion
  );

  // remove `phrase` in `ignoreList`
  const validInlineSuggestions = inlineSuggestions.filter(
    ({ phrase }) => !ignoreList.includes(phrase)
  );

  // new decos
  const newDecos = validInlineSuggestions.map(({ pos, phrase, candidates }) =>
    suggestionDeco(pos.from, pos.to, { phrase, candidates, pos })
  );

  return decoSet.remove(outdatedDeco).add(tr.doc, newDecos);
};

/**
 * Get IInlineSuggestion[] (to be passed to inline decoration) from
 * ITextSuggestion[] where key is the pos phrase
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
