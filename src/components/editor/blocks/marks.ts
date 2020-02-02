import { toggleMark } from "prosemirror-commands";
import { InputRule } from "prosemirror-inputrules";
import { MarkType } from "prosemirror-model";
import { css } from "styled-components";

import { schema } from "../schema";
import { IBlock } from "./utils";

/**
 * Common files for marks.
 *
 * note: create a separate file if the mark is complicated.
 *
 * marks in this file:
 *                      bold
 *                      italic
 *                      strike
 *                      code
 *
 * marks in another file (except for styles):
 *                      link
 *                      color
 *                      highlight
 */

// ------------------------- Input Rules -------------------------

/**
 * Helper to make mark input rules (wraps text).
 *
 * taken from: https://discuss.prosemirror.net/t/input-rules-for-wrapping-marks/537
 */
const markInputRule = (
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: { [key: string]: any }
) => {
  const newRegexp = new RegExp(`${regexp.source.replace(/\$$/, "")}(.)$`);

  return new InputRule(newRegexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const textStart = start + match[0].indexOf(match[1]);
    const textEnd = textStart + match[1].length;
    const tr = state.tr;

    start = match[0].match(/^\s/) ? start + 1 : start;

    if (textEnd < end) tr.delete(textEnd, end);
    if (textStart > start) tr.delete(start, textStart);

    end = start + match[1].length;

    return tr
      .addMark(start, end, markType.create(attrs))
      .insert(end, schema.text(match[2]));
  });
};

/**
 * *bold*
 */
const boldInputRule = markInputRule(/\*([^*]+)\*$/, schema.marks.bold);

/**
 * _italic_
 */
const italicInputRule = markInputRule(/_([^_]+)_$/, schema.marks.italic);

/**
 * --strike--
 */
const strikeInputRule = markInputRule(/--([^-]+)--$/, schema.marks.strike);

/**
 * `code`
 */
const codeInputRule = markInputRule(/`([^`]+)`$/, schema.marks.code);

// -------------------- Keymaps --------------------

const keymaps = {
  "Mod-b": toggleMark(schema.marks.bold),
  "Mod-i": toggleMark(schema.marks.italic)
};

// ------------------------- Style -------------------------

export const markStyles = css`
  a {
    color: ${p => p.theme.text.accent};
  }
`;

// -------------------- Export --------------------

export const marks: IBlock = {
  name: "marks",
  keymaps,
  inputRules: [boldInputRule, italicInputRule, strikeInputRule, codeInputRule]
};
