import { NodeSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import { EditorState, Transaction } from "prosemirror-state";

interface IKeymap {
  key: string;
  commands: (
    state: EditorState,
    dispatch: (tr: Transaction) => void
  ) => boolean;
}

export interface IBlock {
  schema: NodeSpec;
  view?: {
    name: string;
    class: any;
  };
  inputRule?: InputRule;
  keymaps?: IKeymap;
}
