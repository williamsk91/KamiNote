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
    taskList: {
      group: "block",
      content: "taskItem",
      attrs: { "data-level": { default: 0 } },
      parseDOM: [
        {
          tag: "ul.taskList",
          getAttrs: (node: any) => ({
            // get data-level to [0,8]
            "data-level":
              node.getAttribute("data-level") >= 8
                ? 8
                : node.getAttribute("data-level") <= 0
                ? 0
                : node.getAttribute("data-level")
          })
        }
      ],
      toDOM: node => [
        "ul",
        { style: `margin-left:${24 * node.attrs["data-level"]}px;` },
        0
      ]
    },
    taskItem: {
      content: "paragraph",
      attrs: {
        "data-checked": { default: false }
      },
      defining: true,
      parseDOM: [
        {
          tag: "div.taskItem",
          getAttrs: (node: any) => ({
            "data-checked":
              node.getAttribute("data-checked") === "true" ? true : false
          })
        }
      ],
      // also check `taskItemView`
      toDOM: node => [
        "div.taskItem",
        { "data-checked": node.attrs["data-checked"] }
      ]
    },
    numberList: {
      group: "block",
      content: "listItem",
      attrs: { order: { default: 1 }, "data-level": { default: 0 } },
      parseDOM: [
        {
          tag: "ol",
          getAttrs: (node: any) => ({
            order: node.hasAttribute("start") ? +node.getAttribute("start") : 1,
            // get data-level to [0,8]
            "data-level":
              node.getAttribute("data-level") >= 8
                ? 8
                : node.getAttribute("data-level") <= 0
                ? 0
                : node.getAttribute("data-level")
          })
        }
      ],
      toDOM: node =>
        node.attrs.order === 1
          ? [
              "ol",
              { style: `margin-left:${24 * node.attrs["data-level"]}px;` },
              0
            ]
          : [
              "ol",
              {
                start: node.attrs.order,
                style: `margin-left:${24 * node.attrs["data-level"]}px;`
              },
              0
            ]
    },
    bulletList: {
      group: "block",
      content: "listItem",
      attrs: {
        "data-level": { default: 0 }
      },
      parseDOM: [
        {
          tag: "ul",
          getAttrs: (node: any) => ({
            // get data-level to [0,8]
            "data-level":
              node.getAttribute("data-level") >= 8
                ? 8
                : node.getAttribute("data-level") <= 0
                ? 0
                : node.getAttribute("data-level")
          })
        }
      ],
      toDOM: node => [
        "ul",
        { style: `margin-left:${24 * node.attrs["data-level"]}px;` },
        0
      ]
    },
    listItem: {
      content: "paragraph",
      defining: true,
      parseDOM: [
        {
          tag: "li"
        }
      ],
      toDOM: () => ["li", 0]
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
