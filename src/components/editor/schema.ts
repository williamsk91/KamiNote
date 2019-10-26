import { Schema } from "prosemirror-model";

export const schema = new Schema({
  nodes: {
    text: {},
    paragraph: { content: "text*", toDOM: () => ["p", 0] },
    doc: { content: "paragraph+" }
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
