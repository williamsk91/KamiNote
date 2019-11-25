import { wrappingInputRule } from "prosemirror-inputrules";
import {
  splitListItem,
  liftListItem,
  sinkListItem
} from "prosemirror-schema-list";
import { chainCommands } from "prosemirror-commands";
import { schema } from "../schema";
import { IBlock } from "./utils";
import { NodeType } from "prosemirror-model";

// -------------------- Input Rule --------------------

// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
function numberListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    match => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order === +match[1]
  );
}

// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

// -------------------- Keymaps --------------------

const keymaps = {
  Enter: splitListItem(schema.nodes.listItem),
  "Shift-Tab": liftListItem(schema.nodes.listItem),
  // () => true is used to stop 'Tab' keydown on unestable list to cause editor to lose focus
  Tab: chainCommands(sinkListItem(schema.nodes.listItem), () => true)
};

// -------------------- Export --------------------

export const list: IBlock = {
  name: "_list",
  inputRules: [
    bulletListRule(schema.nodes.bulletList),
    numberListRule(schema.nodes.numberList)
  ],
  keymaps
};
