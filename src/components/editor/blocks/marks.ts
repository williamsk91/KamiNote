import { toggleMark } from "prosemirror-commands";
import { schema } from "../schema";
import { IBlock, markInputRule } from "./utils";

// ------------------------- Input Rules -------------------------

/**
 * *bold*
 */
const boldInputRule = markInputRule(/\*([^\*]+)\*$/, schema.marks.bold);

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

// -------------------- Export --------------------

export const marks: IBlock = {
  name: "marks",
  keymaps,
  inputRules: [boldInputRule, italicInputRule, strikeInputRule, codeInputRule]
};
