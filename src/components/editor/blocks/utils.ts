import {
  InputRule,
  smartQuotes,
  ellipsis,
  inputRules
} from "prosemirror-inputrules";
import { EditorState, Transaction, Plugin } from "prosemirror-state";
import { Node, MarkType } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { schema } from "../schema";

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

/**
 * Helper to make mark input rules (wraps text).
 *
 * taken from: https://discuss.prosemirror.net/t/input-rules-for-wrapping-marks/537
 */
export const markInputRule = (
  regexp: RegExp,
  markType: MarkType,
  getAttrs?: { [key: string]: any }
) => {
  const newRegexp = new RegExp(regexp.source.replace(/\$$/, "") + "(.)" + "$");

  return new InputRule(newRegexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const textStart = start + match[0].indexOf(match[1]);
    const textEnd = textStart + match[1].length;
    const tr = state.tr;

    start = match[0].match(/^\s/) ? start + 1 : start;

    if (textEnd < end) tr.delete(textEnd, end);
    if (textStart > start) tr.delete(start, textStart);

    end = start + match[1].length;

    return tr
      .addMark(start, end, markType.create(attrs))
      .insert(end, schema.text(match[2]));
  });
};

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
    .flatMap(b => keymap(b.plugins as Plugin[]));

  return blockPlugins;
};
// ------------------------- Input Rules and Keymaps  -------------------------

export const buildBlockPlugins = (blocks: IBlock[]) => [
  ...buildKeymaps(blocks),
  buildInputRules(blocks),
  ...buildPlugins(blocks)
];
