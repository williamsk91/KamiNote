import { Schema } from "prosemirror-model";

import {
  ColorPallete,
  HighlightPallete,
  colorPallete,
  highlightPallete
} from "./blocks/color";

// ------------------------- Schema -------------------------

export const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: {
      group: "block",
      content: "inline*",
      parseDOM: [{ tag: "p" }],
      toDOM: () => ["p", 0]
    },
    hr: {
      group: "block",
      selectable: false,
      parseDOM: [{ tag: "hr" }],
      toDOM: () => ["hr"]
    },
    heading: {
      group: "block",
      content: "inline*",
      attrs: { level: { default: 1 } },
      defining: true,
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } }
      ],
      toDOM: node => ["h" + node.attrs.level, 0]
    },
    codeBlock: {
      group: "block",
      content: "inline*",
      marks: "",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: () => ["pre", ["code", 0]]
    },
    taskList: {
      // also check `taskListView`
      group: "block",
      content: "inline*",
      attrs: {
        "data-level": { default: 0 },
        "data-checked": { default: false }
      },
      defining: true,
      parseDOM: [
        {
          tag: "div.taskList",
          getAttrs: (node: any) => ({
            "data-level": getListDataLevel(node),
            "data-checked": node.getAttribute("data-checked")
          })
        }
      ],
      toDOM: node => [
        "div.taskList",
        {
          "data-level": node.attrs["data-level"],
          "data-checked": node.attrs["data-checked"]
        }
      ]
    },
    numberList: {
      group: "block",
      content: "inline*",
      attrs: { order: { default: 1 }, "data-level": { default: 0 } },
      defining: true,
      parseDOM: [
        {
          tag: "ol",
          getAttrs: (node: any) => ({
            "data-level": getListDataLevel(node),
            order: node.hasAttribute("start") ? +node.getAttribute("start") : 1
          })
        }
      ],
      toDOM: node => {
        const start = node.attrs.order !== 1 && {
          start: node.attrs.order
        };
        return [
          "ol",
          {
            "data-level": node.attrs["data-level"],
            ...start
          },
          ["li", 0]
        ];
      }
    },
    bulletList: {
      group: "block",
      content: "inline*",
      attrs: {
        "data-level": { default: 0 }
      },
      defining: true,
      parseDOM: [
        {
          tag: "ul",
          getAttrs: (node: any) => ({
            "data-level": getListDataLevel(node)
          })
        }
      ],
      toDOM: node => [
        "ul",
        {
          "data-level": node.attrs["data-level"]
        },
        ["li", 0]
      ]
    },
    blockquote: {
      group: "block",
      content: "inline*",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM: () => ["blockquote", 0]
    },
    text: {
      group: "inline"
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
      excludes: "_",
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code"]
    },
    color: {
      attrs: { color: {} },
      parseDOM: [
        {
          tag: "span.color",
          getAttrs: (node: any) => {
            const nodeColor = node.getAttribute("color");
            if (!(nodeColor in colorPallete)) return false;

            return {
              color: colorPallete[nodeColor as ColorPallete]
            };
          }
        }
      ],
      toDOM: node => ["span.color", { style: `color: ${node.attrs.color}` }]
    },
    higlight: {
      attrs: { color: {} },
      parseDOM: [
        {
          tag: "span.highlight",
          getAttrs: (node: any) => {
            const nodeColor = node.getAttribute("color");
            if (!(nodeColor in colorPallete)) return false;

            return {
              color: highlightPallete[nodeColor as HighlightPallete]
            };
          }
        }
      ],
      toDOM: node => [
        "span.higlight",
        { style: `background-color: ${node.attrs.color}` }
      ]
    },
    link: {
      attrs: { href: { default: "" } },
      parseDOM: [
        {
          tag: "a",
          getAttrs: (node: any) => ({
            href: node.href
          })
        }
      ],
      toDOM: node => [
        "a",
        { href: node.attrs.href, rel: "noopener noreferrer nofollow" },
        0
      ],
      inclusive: false
    }
  }
});

// ------------------------- Helper functions -------------------------

/**
 * get list data-level attribute.
 *
 * range is [0,8]
 */
const getListDataLevel = (node: any) => {
  if (node.getAttribute("data-level") >= 8) return 8;
  if (node.getAttribute("data-level") <= 0) return 0;
  return node.getAttribute("data-level");
};
