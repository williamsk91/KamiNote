/**
 * Text position
 */
export interface ITextPos {
  from: number;
  to: number;
}

/**
 * Misspelled word `phrase` and a
 * list of possible replacements `candidates`
 */
export interface ISuggestion {
  phrase: string;
  candidates: string[];
}

/**
 * Suggestions for text in the range `key`
 */
export interface ITextSuggestion {
  key: ITextPos;
  suggestions: ISuggestion[];
}
