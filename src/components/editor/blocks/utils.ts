import { baseKeymap } from "prosemirror-commands";
import {
  InputRule,
  ellipsis,
  inputRules,
  smartQuotes
} from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { Node } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export type IDispatch = (tr: Transaction) => void;

interface IKeymap {
  [key: string]: (state: EditorState, dispatch?: IDispatch) => boolean;
}

export interface IBlock {
  name: string;
  view?: any;
  inputRules?: InputRule[];
  keymaps?: IKeymap;
  plugins?: Plugin[];
}

// ------------------------- View -------------------------

const buildView = (name: string, nodeView: any) => {
  const value = (
    node: Node,
    view: EditorView,
    getPos: boolean | (() => number)
  ) => nodeView(node, view, getPos);
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
    .flatMap(b => b.inputRules as InputRule[]);

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

// ------------------------- Plugins -------------------------

export const buildPlugins = (blocks: IBlock[]) => {
  const blockPlugins = blocks
    .filter(b => b.plugins)
    .flatMap(b => b.plugins as Plugin[]);
  return blockPlugins;
};
// ------------------------- Input Rules and Keymaps  -------------------------

export const buildBlockPlugins = (blocks: IBlock[]) => [
  ...buildKeymaps(blocks),
  buildInputRules(blocks),
  ...buildPlugins(blocks)
];
