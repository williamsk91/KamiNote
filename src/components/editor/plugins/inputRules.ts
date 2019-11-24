import {
  inputRules,
  wrappingInputRule,
  smartQuotes,
  emDash,
  ellipsis
} from "prosemirror-inputrules";
import { schema } from "../schema";

// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
export function numberListRule(nodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    match => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  );
}

// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
export function bulletListRule(nodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

// Given a list node type, returns an input rule that turns a box
// ([ ] / []) at the start of a textblock into a task list.
export const taskListRule = nodeType => {
  return wrappingInputRule(/^\s*((\[\])|(\[ \]))\s$/, nodeType);
};

export const buildInputRules = () => {
  let rules = smartQuotes.concat(ellipsis, emDash);
  rules.push(numberListRule(schema.nodes.numberList));
  rules.push(bulletListRule(schema.nodes.bulletList));
  rules.push(taskListRule(schema.nodes.taskList));
  return inputRules({ rules });
};
