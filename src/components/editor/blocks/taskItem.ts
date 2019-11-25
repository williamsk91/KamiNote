import { wrappingInputRule } from "prosemirror-inputrules";
import { splitListItem } from "prosemirror-schema-list";
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

const sinkTaskItem = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, $anchor } = state.selection;
  let parent = $from.node(-1);
  if (parent.type !== itemType) return false;
  if (dispatch) {
    // -2 comes from going up 2 levels taskItem - paragraph - text
    console.log("parent.attrs: ", parent.attrs);
    dispatch(
      state.tr
        .setNodeMarkup($anchor.pos - $anchor.parentOffset - 2, undefined, {
          ...parent.attrs,
          "data-level":
            +parent.attrs["data-level"] >= 8
              ? 8
              : +parent.attrs["data-level"] + 1
        })
        .scrollIntoView()
    );
  }
  return true;
};

const liftTaskItem = (itemType: NodeType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  let { $from, $anchor } = state.selection;
  let parent = $from.node(-1);
  if (parent.type !== itemType) return false;
  if (dispatch) {
    // -2 comes from going up 2 levels taskItem - paragraph - text
    console.log("parent.attrs: ", parent.attrs);
    dispatch(
      state.tr
        .setNodeMarkup($anchor.pos - $anchor.parentOffset - 2, undefined, {
          ...parent.attrs,
          "data-level":
            +parent.attrs["data-level"] <= 0
              ? 0
              : +parent.attrs["data-level"] - 1
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
    this.dom.setAttribute("data-level", node.attrs["data-level"]);
    this.dom.style.marginLeft = `${node.attrs["data-level"] * 24}px`;

    // icon
    // update this div with an icon
    this.icon = this.dom.appendChild(document.createElement("div"));
    this.icon.setAttribute("contenteditable", "false");
    this.icon.classList.add("checkbox");

    // toggle `data-checked` onClick
    this.icon.addEventListener("click", e => {
      e.preventDefault();
      console.log("node.attrs: ", node.attrs);
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

// -------------------- Input Rule --------------------

// Given a list node type, returns an input rule that turns a box
// ([ ] / []) at the start of a textblock into a task list.
const taskItemRule = (nodeType: any) =>
  wrappingInputRule(/^\s*((\[\])|(\[ \]))\s$/, nodeType);

// -------------------- Keymaps --------------------

const keymaps = {
  Enter: splitListItem(schema.nodes.taskItem),
  "Mod-Enter": toggleTaskItem(schema.nodes.taskItem),
  "Shift-Tab": liftTaskItem(schema.nodes.taskItem),
  Tab: sinkTaskItem(schema.nodes.taskItem)
};

// -------------------- Export --------------------

export const taskItem: IBlock = {
  name: "taskItem",
  view: TaskItemView,
  inputRules: [taskItemRule(schema.nodes.taskList)],
  keymaps
};
