import { EditorState } from "prosemirror-state";
import { NodeView, EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";
import { css } from "styled-components";

import { IBlock, IDispatch } from "./utils";
import { schema } from "../schema";

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

class TaskListView implements NodeView {
  dom: HTMLDivElement;
  contentDOM: HTMLDivElement;
  icon: HTMLDivElement;

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.dom = document.createElement("div");
    this.dom.classList.add("taskList");
    this.dom.setAttribute("data-level", node.attrs["data-level"]);
    this.dom.setAttribute("data-checked", node.attrs["data-checked"]);

    // icon
    // update this div with an icon
    this.icon = this.dom.appendChild(document.createElement("div"));
    this.icon.setAttribute("contenteditable", "false");
    this.icon.classList.add("checkbox");

    // toggle `data-checked` onClick
    this.icon.addEventListener("click", e => {
      e.preventDefault();
      view.dispatch(
        view.state.tr.setNodeMarkup(getPos(), undefined, {
          ...node.attrs,
          "data-checked": !node.attrs["data-checked"]
        })
      );
    });

    // content
    this.contentDOM = this.dom.appendChild(document.createElement("div"));
  }

  stopEvent() {
    return true;
  }
}

// -------------------- Keymaps --------------------

const keymaps = {
  "Mod-Enter": toggleTaskList(schema.nodes.taskList)
};

// ------------------------- Style -------------------------

export const taskListStyle = css`
  div.taskList {
    position: relative;
    padding-left: 40px;

    div.checkbox {
      position: absolute;
      left: 18px;

      width: 15px;
      height: 15px;

      border: 2px solid rgb(55, 53, 47);
      border-radius: 5px;
      cursor: pointer;
    }

    &[data-checked="true"] {
      div.checkbox {
        background: rgb(55, 53, 47);
      }

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