import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";

export class TaskItemView implements NodeView {
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
    this.icon.classList.add("checkbox");

    // toggle `data-checked` onClick
    this.icon.addEventListener("click", e => {
      e.preventDefault();
      console.log("node pre: ", node);
      console.log("node pre: ", node.attrs["data-checked"]);
      console.log("node aft: ", !node.attrs["data-checked"]);
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
