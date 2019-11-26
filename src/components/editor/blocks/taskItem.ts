import { EditorState } from "prosemirror-state";
import { NodeView, EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";

import { IBlock, IDispatch } from "./utils";
import { schema } from "../schema";

// -------------------- Commands --------------------

/**
 * Toggle a `taskItem`.
 *
 * If there is a selection, all the taskItem will be changed into
 * !checked of the source taskItem.
 * source taskItem is the taskItem where the selection starts.
 */
const toggleTaskItem = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, from, to } = state.selection;

  const sourceTaskItem = $from.node();
  console.log("sourceTaskItem: ", sourceTaskItem);
  if (sourceTaskItem.type !== itemType) return false;
  // change all taskItem under selection into !checked of source taskitem
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

class TaskItemView implements NodeView {
  dom: HTMLDivElement;
  contentDOM: HTMLDivElement;
  icon: HTMLDivElement;

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.dom = document.createElement("div");
    this.dom.classList.add("taskItem");
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
  "Mod-Enter": toggleTaskItem(schema.nodes.taskItem)
};

// -------------------- Export --------------------

export const taskItem: IBlock = {
  name: "taskItem",
  view: TaskItemView,
  keymaps
};
