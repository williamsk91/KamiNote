import { keymap } from "prosemirror-keymap";
import { toggleMark, chainCommands } from "prosemirror-commands";

import { schema } from "../schema";
import {
  splitListItem,
  liftListItem,
  sinkListItem
} from "prosemirror-schema-list";
import { toggleTaskItem } from "./commands";

const markKeymap = keymap({
  "Mod-b": toggleMark(schema.marks.bold),
  "Mod-i": toggleMark(schema.marks.italic)
});

const taskListKeymap = keymap({
  Enter: splitListItem(schema.nodes.taskItem),
  "Mod-Enter": toggleTaskItem,
  "Shift-Tab": liftListItem(schema.nodes.taskItem),
  Tab: sinkListItem(schema.nodes.taskItem)
});

const listKeymap = keymap({
  Enter: splitListItem(schema.nodes.listItem),
  "Shift-Tab": liftListItem(schema.nodes.listItem),
  // () => true is used to stop 'Tab' keydown on unestable list to cause editor to lose focus
  Tab: chainCommands(sinkListItem(schema.nodes.listItem), () => true)
});

export const setKeymap = [markKeymap, taskListKeymap, listKeymap];
