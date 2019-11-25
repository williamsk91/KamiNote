import { wrappingInputRule } from "prosemirror-inputrules";
import {
  splitListItem,
  liftListItem,
  sinkListItem
} from "prosemirror-schema-list";
import { EditorState } from "prosemirror-state";
import { NodeView, EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";

import { IBlock, IDispatch } from "./utils";
import { schema } from "../schema";

// -------------------- Commands --------------------

const toggleTaskItem = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, $anchor } = state.selection;
  let parent = $from.node(-1);
  if (parent.type !== schema.nodes.taskItem) return false;
  if (dispatch) {
    // -2 comes from going up 2 levels taskItem - paragraph - text
    dispatch(
      state.tr
        .setNodeMarkup($anchor.pos - $anchor.parentOffset - 2, undefined, {
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

// -------------------- Input Rule --------------------

// Given a list node type, returns an input rule that turns a box
// ([ ] / []) at the start of a textblock into a task list.
const taskItemRule = (nodeType: any) =>
  wrappingInputRule(/^\s*((\[\])|(\[ \]))\s$/, nodeType);

// -------------------- Keymaps --------------------

const keymaps = {
  Enter: splitListItem(schema.nodes.taskItem),
  "Mod-Enter": toggleTaskItem(schema.nodes.taskItem),
  "Shift-Tab": liftListItem(schema.nodes.taskItem),
  Tab: sinkListItem(schema.nodes.taskItem)
};

// -------------------- Export --------------------

export const taskItem: IBlock = {
  name: "taskItem",
  view: TaskItemView,
  inputRules: [taskItemRule(schema.nodes.taskList)],
  keymaps
};
