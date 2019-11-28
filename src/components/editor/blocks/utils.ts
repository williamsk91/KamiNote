import {
  InputRule,
  smartQuotes,
  ellipsis,
  inputRules
} from "prosemirror-inputrules";
import { EditorState, Transaction } from "prosemirror-state";
import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

export type IDispatch = (tr: Transaction) => void;

interface IKeymap {
  [key: string]: (state: EditorState, dispatch?: IDispatch) => boolean;
}

export interface IBlock {
  name: string;
  view?: any;
  inputRules?: InputRule[];
  keymaps?: IKeymap;
}

// ------------------------- View -------------------------

const buildView = (name: string, viewClass: any) => {
  const value = (
    node: Node,
    view: EditorView,
    getPos: boolean | (() => number)
  ) => new viewClass(node, view, getPos);
  return { [name]: value };
};

export const buildViews = (blocks: IBlock[]) => {
  return blocks.reduce(
    (acc, b) => (b.view ? { ...acc, ...buildView(b.name, b.view) } : acc),
    {}
  );
};
// ------------------------- Input Rules -------------------------

export const buildInputRules = (blocks: IBlock[]) => {
  const baseRules: InputRule[] = smartQuotes.concat(ellipsis);

  const blockRules: InputRule[] = blocks
    .filter(b => b.inputRules)
    .map(b => b.inputRules)
    .flat();

  return inputRules({ rules: [...baseRules, ...blockRules] });
};

// ------------------------- Keymaps -------------------------

export const buildKeymaps = (blocks: IBlock[]) => {
  const baseKeymaps = keymap(baseKeymap);
  const blockKeymaps = blocks
    .filter(b => b.keymaps)
    .map(b => keymap(b.keymaps as IKeymap));

  return [...blockKeymaps, baseKeymaps];
};

// ------------------------- Input Rules and Keymaps  -------------------------

export const buildInputRulesAndKeymaps = (blocks: IBlock[]) => [
  ...buildKeymaps(blocks),
  buildInputRules(blocks)
];
