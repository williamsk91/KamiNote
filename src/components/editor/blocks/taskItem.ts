import { EditorState } from "prosemirror-state";
import { NodeView, EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";

import { IBlock, IDispatch } from "./utils";
import { schema } from "../schema";

// -------------------- Commands --------------------

const toggleListCheckedAttr = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, $anchor } = state.selection;
  let parent = $from.node(-1);
  if (parent.type !== itemType) return false;
  if (dispatch) {
    // -2 comes from going up 2 levels taskItem - paragraph - text
    dispatch(
      state.tr
        .setNodeMarkup($anchor.pos - $anchor.parentOffset - 2, undefined, {
          ...parent.attrs,
          "data-checked": !parent.attrs["data-checked"]
        })
        .scrollIntoView()
    );
  }
  return true;
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
  "Mod-Enter": toggleListCheckedAttr(schema.nodes.taskItem)
};

// -------------------- Export --------------------

export const taskItem: IBlock = {
  name: "taskItem",
  view: TaskItemView,
  keymaps
};
