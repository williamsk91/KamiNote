import React from "react";
import ReactDOM from "react-dom";
import { Node, NodeType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView, NodeView } from "prosemirror-view";
import styled, { css } from "styled-components";

import { Checkbox } from "../component/Checkbox";
import { schema } from "../schema";
import { IBlock, IDispatch } from "./utils";

// -------------------- Commands --------------------

/**
 * Toggle a `taskList`.
 *
 * If there is a selection, all the taskItem will be changed into
 * !checked of the source taskItem.
 * source taskItem is the taskItem where the selection starts.
 */
const toggleTaskList = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, from, to } = state.selection;

  const sourceTaskItem = $from.node();
  if (sourceTaskItem.type !== itemType) return false;
  // change all taskList under selection into !checked of source taskitem
  const newChecked = !sourceTaskItem.attrs["data-checked"];

  let dispatched = false;
  if (dispatch) {
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === itemType) {
        dispatched = true;
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          "data-checked": newChecked
        });
      }
    });

    dispatch(tr);
  }

  return dispatched;
};

// -------------------- View --------------------

const TaskListView = (
  node: Node,
  view: EditorView,
  getPos: () => number
): NodeView => {
  const dom = document.createElement("div");
  dom.classList.add("taskList");
  dom.setAttribute("data-level", node.attrs["data-level"]);
  dom.setAttribute("data-checked", node.attrs["data-checked"]);

  // react
  const reactComponent = (
    <StyledCheckbox
      checked={node.attrs["data-checked"]}
      onClick={() => {
        // update `data-checked`
        const tr = view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...node.attrs,
          "data-checked": !node.attrs["data-checked"]
        });

        view.dispatch(tr);
      }}
    />
  );

  ReactDOM.render(reactComponent, dom);

  // content
  const contentDOM = dom.appendChild(document.createElement("div"));

  return {
    dom,
    contentDOM,
    stopEvent() {
      return true;
    }
  };
};

// -------------------- Keymaps --------------------

const keymaps = {
  "Mod-Enter": toggleTaskList(schema.nodes.taskList)
};

// ------------------------- Style -------------------------

const StyledCheckbox = styled(Checkbox).attrs({
  className: "checkbox"
})`
  position: absolute;
  right: calc(100% - 21px);
  top: 0;
`;

export const taskListStyle = css`
  div.taskList {
    position: relative;

    &[data-checked="true"] {
      text-decoration: line-through;
      color: #aaa;
    }
  }
`;

// -------------------- Export --------------------

/**
 * also check list.ts for a general list
 */
export const taskList: IBlock = {
  name: "taskList",
  view: TaskListView,
  keymaps
};
