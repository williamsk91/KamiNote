import { textblockTypeInputRule } from "prosemirror-inputrules";
import { schema } from "../schema";
import { IBlock, IDispatch } from "./utils";
import { NodeType, Node } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { chainCommands } from "prosemirror-commands";
import { canSplit } from "prosemirror-transform";
import { css } from "styled-components";
import { taskListStyle } from "./taskList";

// ------------------------- Commands -------------------------

const splitList = (listType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from } = state.selection;

  let list = $from.node();
  if (!list || list.type !== listType) return false;

  if ($from.parent.content.size === 0) {
    if (dispatch) {
      // In an empty block.
      // If level > 0 outdent
      // If level = 0 let removing to other commands
      const level = list.attrs["data-level"];
      const from = $from.pos - 1;
      let tr = state.tr;
      if (level === 0) {
        const to = from + 2;
        tr.replaceWith(from, to, schema.node(schema.nodes.paragraph));
        tr.setSelection(TextSelection.create(tr.doc, $from.pos));
      } else {
        tr.setNodeMarkup(from, undefined, {
          "data-level": decreaseLevelAttr(list)
        });
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  }

  let tr = state.tr.deleteSelection();
  if (!canSplit(tr.doc, $from.pos, 1)) return false;

  tr.split($from.pos, 1).scrollIntoView();

  if (dispatch) dispatch(tr);
  return true;
};

const adjustListLevel = (
  listTypes: NodeType[],
  adjustedLevel: (node: Node) => number
) => (state: EditorState, dispatch?: IDispatch) => {
  let { from, to } = state.selection;
  let dispatched = false;

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

  if (dispatch) dispatch(tr);
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
  textblockTypeInputRule(/^\s*((\[\])|(\[ \]))\s$/, nodeType);

// Given a list node type, returns an input rule that turns a number
// followed by a dot (1. ) at the start of a textblock into an ordered list.
const numberListRule = (nodeType: NodeType) =>
  textblockTypeInputRule(/^(\d+)\.\s$/, nodeType, match => ({
    order: +match[1]
  }));

// Given a list node type, returns an input rule that turns a bullet
// (dash -, plus +, or asterisk *) at the start of a textblock into a
// bullet list.
const bulletListRule = (nodeType: NodeType) =>
  textblockTypeInputRule(/^\s*([-+])\s$/, nodeType);

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

// ------------------------- Style -------------------------

const BULLET_TYPES = ["disc", "circle", "square"];
const NUMBER_TYPES = ["decimal", "lower-alpha", "lower-roman"];

/**
 * Styles list depending on level.
 *    - indentation
 *    - list-style-type
 */
const listLevelStyle = (indent: number) => css`
  ul,
  ol,
  div.taskList {
    &[data-level="${indent}"] {
      margin-left: ${`${24 * indent}px`};
    }
  }

  ul[data-level="${indent}"]{
    list-style-type: ${BULLET_TYPES[indent % BULLET_TYPES.length]}
  }

  ol[data-level="${indent}"]{
    list-style-type: ${NUMBER_TYPES[indent % NUMBER_TYPES.length]}
  }

  
`;

// -------------------- Export --------------------

/**
 * list has 3 children
 *    1. taskList
 *    2. numberList
 *    3. bulletList
 */
export const list: IBlock = {
  name: "list",
  inputRules: [
    taskListRule(schema.nodes.taskList),
    numberListRule(schema.nodes.numberList),
    bulletListRule(schema.nodes.bulletList)
  ],
  keymaps
};

export const listStyle = css`
  ul,
  ol,
  div.taskList {
    margin: 6px 0;
    padding: 0 0 0 24px;
  }

  ${taskListStyle}
  
  /* indentation */
  ${listLevelStyle(0)}
  ${listLevelStyle(1)}
  ${listLevelStyle(2)}
  ${listLevelStyle(3)}
  ${listLevelStyle(4)}
  ${listLevelStyle(5)}
  ${listLevelStyle(6)}
  ${listLevelStyle(7)}
  ${listLevelStyle(8)}

`;
