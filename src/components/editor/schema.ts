import { Schema } from "prosemirror-model";

export const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    text: {},
    paragraph: {
      group: "block",
      content: "text*",
      parseDOM: [{ tag: "p" }],
      toDOM: () => ["p", 0]
    },
    horizontal_rule: {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM: () => ["hr"]
    },
    heading: {
      group: "block",
      attrs: { level: { default: 1 } },
      content: "text*",
      defining: true,
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } }
      ],
      toDOM(node) {
        return ["h" + node.attrs.level, 0];
      }
    },
    code_block: {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM() {
        return ["pre", ["code", 0]];
      }
    },
    numberList: {
      group: "block",
      content: "listItem+",
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: "ol",
          getAttrs: (dom: HTMLOListElement) => ({
            order: dom.hasAttribute("start")
              ? +(dom as any).getAttribute("start")
              : 1
          })
        }
      ],
      toDOM: node =>
        node.attrs.order == 1
          ? ["ol", 0]
          : ["ol", { start: node.attrs.order }, 0]
    },
    bulletList: {
      group: "block",
      content: "listItem+",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0]
    },
    listItem: {
      content: "paragraph (numberList | bulletList)*",
      parseDOM: [{ tag: "li" }],
      toDOM: () => ["li", 0],
      defining: true
    },

    taskList: {
      group: "block",
      content: "taskItem+",
      parseDOM: [
        {
          tag: "div.taskList"
        }
      ],
      toDOM: () => ["div", { class: "taskList" }, 0]
    },
    taskItem: {
      // toDom -> taskItemView
      content: "paragraph taskList*",
      attrs: { "data-checked": { default: false } },
      defining: true,
      parseDOM: [
        {
          tag: "div.taskItem",
          getAttrs: (node: any) => ({
            "data-checked":
              node.getAttribute("data-checked") === "true" ? true : false
          })
        }
      ]
    },
    blockquote: {
      group: "block",
      content: "text*",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => {
        return ["blockquote", 0];
      }
    }
  },
  marks: {
    bold: {
      toDOM: () => ["b"],
      parseDOM: [{ tag: "b" }, { tag: "strong" }]
    },
    italic: {
      toDOM: () => ["i"],
      parseDOM: [{ tag: "i" }, { tag: "em" }]
    },
    strike: {
      toDOM: () => ["s"],
      parseDOM: [{ tag: "s" }, { tag: "del" }]
    },
    code: {
      toDOM: () => ["code"],
      parseDOM: [{ tag: "code" }]
    }
  }
});
