import { wrappingInputRule } from "prosemirror-inputrules";
import { schema } from "../schema";
import { IBlock, IDispatch } from "./utils";
import { NodeType, Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { chainCommands } from "prosemirror-commands";
import { canSplit } from "prosemirror-transform";

// ------------------------- Commands -------------------------

const splitList = (listType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from } = state.selection;

  let list = $from.node(-2);
  if (!list || list.type != listType) return false;

  if ($from.parent.content.size == 0) {
    // In an empty block.
    // If level > 0 outdent
    // If level = 0 let removing to other commands
    const level = list.attrs["data-level"];
    if (level === 0) return false;

    if (dispatch) {
      const pos = $from.pos - 3;
      let tr = state.tr.setNodeMarkup(pos, undefined, {
        "data-level": decreaseLevelAttr(list)
      });
      dispatch(tr.scrollIntoView());
    }
    return true;
  }

  let tr = state.tr.deleteSelection();
  // Changed the depth into 3
  if (!canSplit(tr.doc, $from.pos, 3)) return false;
  if (dispatch) dispatch(tr.split($from.pos, 3).scrollIntoView());
  return true;
};

const adjustListLevel = (
  listTypes: NodeType[],
  adjustedLevel: (node: Node) => number
) => (state: EditorState, dispatch?: IDispatch) => {
  let { from, to } = state.selection;
  let dispatched = false;

  if (dispatch) {
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (listTypes.includes(node.type)) {
        dispatched = true;
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          "data-level": adjustedLevel(node)
        });
      }
    });
    dispatch(tr);
  }

  return dispatched;
};
const increaseLevelAttr = (node: Node) =>
  +node.attrs["data-level"] >= 8 ? 8 : +node.attrs["data-level"] + 1;

const indentList = (listTypes: NodeType[]) =>
  adjustListLevel(listTypes, increaseLevelAttr);

const decreaseLevelAttr = (node: Node) =>
  +node.attrs["data-level"] <= 0 ? 0 : +node.attrs["data-level"] - 1;

const outdentList = (listTypes: NodeType[]) =>
  adjustListLevel(listTypes, decreaseLevelAttr);

// -------------------- Input Rule --------------------

// Given a list node type, returns an input rule that turns a box
// ([ ] / []) at the start of a textblock into a task list.
const taskListRule = (nodeType: any) =>
  wrappingInputRule(/^\s*((\[\])|(\[ \]))\s$/, nodeType);

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
  Enter: chainCommands(
    splitList(schema.nodes.taskList),
    splitList(schema.nodes.numberList),
    splitList(schema.nodes.bulletList)
  ),
  Tab: chainCommands(
    indentList([
      schema.nodes.taskList,
      schema.nodes.numberList,
      schema.nodes.bulletList
    ])
  ),
  "Shift-Tab": chainCommands(
    outdentList([
      schema.nodes.taskList,
      schema.nodes.numberList,
      schema.nodes.bulletList
    ])
  )
};

// -------------------- Export --------------------

/**
 * list has 3 children
 *    1. taskList
 *    2. numberList
 *    3. bulletList
 */
export const list: IBlock = {
  name: "_list",
  inputRules: [
    taskListRule(schema.nodes.taskList),
    bulletListRule(schema.nodes.bulletList),
    numberListRule(schema.nodes.numberList)
  ],
  keymaps
};
