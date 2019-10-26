import { keymap } from "prosemirror-keymap";
import { toggleMark } from "prosemirror-commands";
import { schema } from "../schema";

export const markKeymap = keymap({
  "Mod-b": toggleMark(schema.marks.bold),
  "Mod-i": toggleMark(schema.marks.italic)
});
