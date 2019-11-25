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
      content: "text*",
      attrs: { level: { default: 1 } },
      defining: true,
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } }
      ],
      toDOM: node => ["h" + node.attrs.level, 0]
    },
    code_block: {
      group: "block",
      content: "text*",
      marks: "",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: () => ["pre", ["code", 0]]
    },
    numberList: {
      group: "block",
      content: "listItem+",
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: "ol",
          getAttrs: (dom: any) => ({
            order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1
          })
        }
      ],
      toDOM: node =>
        node.attrs.order === 1
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
    taskItem: {
      // toDom -> taskItemView
      group: "block",
      content: "paragraph",
      attrs: {
        "data-level": { default: 0 },
        "data-checked": { default: false }
      },
      defining: true,
      parseDOM: [
        {
          tag: "div.taskItem",
          getAttrs: (node: any) => ({
            // get data-level to [0,8]
            "data-level":
              node.getAttribute("data-level") >= 8
                ? 8
                : node.getAttribute("data-level") <= 0
                ? 0
                : node.getAttribute("data-level"),
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
      toDOM: () => ["blockquote", 0]
    }
  },
  marks: {
    bold: {
      parseDOM: [{ tag: "b" }, { tag: "strong" }],
      toDOM: () => ["b"]
    },
    italic: {
      parseDOM: [{ tag: "i" }, { tag: "em" }],
      toDOM: () => ["i"]
    },
    strike: {
      parseDOM: [{ tag: "s" }, { tag: "del" }],
      toDOM: () => ["s"]
    },
    code: {
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code"]
    }
  }
});
