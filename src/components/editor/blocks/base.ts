import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import { Fragment, NodeType } from "prosemirror-model";
import { TextSelection } from "prosemirror-state";

import { schema } from "../schema";
import { IBlock } from "./utils";

/**
 * A collection of *Input Rules* and *Keymaps* for the following
 *    - heading
 *    - horizontalRule
 *    - codeBlock
 *    - blockQuote
 *
 * Note: this is done in one file to minimize number of files.
 */

// -------------------- Input Rule --------------------

/**
 * Given a node type and a maximum level, creates an input rule that
 * turns up to that number of `#` characters followed by a space at
 * the start of a textblock into a heading whose level corresponds to
 * the number of `#` signs.
 *
 * i.e. #  -> nodeType with level: 1
 *      ## -> nodeType with level: 2 ...
 */
const headingRule = (nodeType: NodeType, maxLevel: number) =>
  textblockTypeInputRule(
    new RegExp("^(#{1," + maxLevel + "})\\s$"),
    nodeType,
    match => ({ level: match[1].length })
  );

/**
 * Insert hr before the current node.
 *
 * patterns: --- | *** | ___
 */
const hrRule = (nodeType: NodeType) =>
  new InputRule(/^\s*((---)|(\*\*\*)|(___))$/, (state, _match, start, end) => {
    const tr = state.tr.replaceWith(start, end, Fragment.empty);
    tr.insert(tr.selection.from - 1, nodeType.createChecked());
    tr.setSelection(TextSelection.create(tr.doc, start + 1));
    return tr;
  });

// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
const blockQuoteRule = (nodeType: NodeType) =>
  textblockTypeInputRule(/^\s*>\s$/, nodeType);

// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
const codeBlockRule = (nodeType: NodeType) =>
  textblockTypeInputRule(/^```$/, nodeType);

// -------------------- Keymaps --------------------

// -------------------- Export --------------------

export const heading: IBlock = {
  name: "heading",
  inputRules: [headingRule(schema.nodes.heading, 3)]
};

export const hr: IBlock = {
  name: "hr",
  inputRules: [hrRule(schema.nodes.hr)]
};

export const blockQuote: IBlock = {
  name: "blockquote",
  inputRules: [blockQuoteRule(schema.nodes.blockquote)]
};

export const codeBlock: IBlock = {
  name: "codeBlock",
  inputRules: [codeBlockRule(schema.nodes.codeBlock)]
};
