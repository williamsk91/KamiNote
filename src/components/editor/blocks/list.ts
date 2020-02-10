import { chainCommands } from "prosemirror-commands";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { Node, NodeType } from "prosemirror-model";
import { EditorState, TextSelection } from "prosemirror-state";
import { canSplit } from "prosemirror-transform";
import { css } from "styled-components";

import { schema } from "../schema";
import { taskListStyle } from "./taskList";
import { IBlock, IDispatch } from "./utils";

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

  let typesAfter = undefined;
  if ($from.parent.type === state.schema.nodes.numberList) {
    typesAfter = [
      {
        // if number list -> set order to undefined
        type: state.schema.nodes.numberList,
        attrs: {
          order: undefined,
          "data-level": $from.parent.attrs["data-level"]
        }
      }
    ];
  }

  tr.split($from.pos, 1, typesAfter).scrollIntoView();

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
      /**
       * Special order attr for number list
       */
      const attrs = node.attrs;
      if (node.type === state.schema.nodes.numberList) {
        if (node.attrs["data-level"] < adjustedLevel(node)) {
          // add order when indenting
          attrs.order = 1;
        } else {
          // remove order when outdenting
          attrs.order = undefined;
        }
      }

      dispatched = true;
      tr.setNodeMarkup(pos, undefined, {
        ...attrs,
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

const removeList = (listTypes: NodeType[]) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { from, to } = state.selection;
  let dispatched = false;

  const tr = state.tr;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (listTypes.includes(node.type) && node.textContent.length === 0) {
      dispatched = true;
      tr.setNodeMarkup(pos, state.schema.nodes.paragraph);
    }
  });

  if (dispatch) dispatch(tr);
  return dispatched;
};

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
  ),
  Backspace: removeList([
    schema.nodes.taskList,
    schema.nodes.numberList,
    schema.nodes.bulletList
  ])
};

// ------------------------- Style -------------------------
const MAX_INDENT = 8;

const BULLET_TYPES = ["disc", "circle", "square"];
const NUMBER_TYPES = ["decimal", "lower-alpha", "lower-roman"];

/**
 * Styles list depending on level.
 *    - indentation
 *    - list-style-type
 */
const listLevelStyle = Array.from(Array(MAX_INDENT + 1).keys()).reduce(
  (acc, index) => {
    return css`
      ${acc}
      
      ul,
      ol,
      div.taskList {
        &[data-level="${index}"] {
          margin-left: ${`${24 * index}px`};
        }
      }

      ul[data-level="${index}"] > li:before{
        content: ${`counter( yo, ${
          BULLET_TYPES[index % BULLET_TYPES.length]
        })`};
      }

      ol[data-level="${index}"]{
        --counter-name: ${`counter-${index}`};
      }

      /** Applies a counter's value to the list item's :before element */
      ol[data-level="${index}"] > li:before {
        content: ${`counter( var(--counter-name), ${
          NUMBER_TYPES[index % NUMBER_TYPES.length]
        } )". "`};
      }

      /** Increase a counter's value by 1 :after each list item */
      ol[data-level="${index}"] > li:after {
        content: "";
        counter-increment: var(--counter-name);
      }
    `;
  },
  css``
);

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

  ul {
    list-style-type: none;
    li:before {
      position: absolute;
      right: 100%;
      text-align: right;
      user-select: none;
      padding-right: 9px;
    }
    li {
      position: relative;
    }
  }

  ol {
    list-style-type: none;
    li:before {
      position: absolute;
      right: 100%;
      text-align: right;
      user-select: none;
      padding-right: 9px;
    }
    li {
      position: relative;
    }
  }

  ${taskListStyle}

  ${listLevelStyle}
  ol[data-list-reset="true"] {
    counter-reset: ${`var(--counter-name) var(--start-at, 1)`};
  }
`;
