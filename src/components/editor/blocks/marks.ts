import { toggleMark } from "prosemirror-commands";
import { schema } from "../schema";
import { IBlock } from "./utils";

// -------------------- Keymaps --------------------

const keymaps = {
  "Mod-b": toggleMark(schema.marks.bold),
  "Mod-i": toggleMark(schema.marks.italic)
};

// -------------------- Export --------------------

export const marks: IBlock = {
  name: "_marks",
  keymaps
};
