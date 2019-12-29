import React, { useEffect, useRef, FC } from "react";
import styled from "styled-components";

import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { undo, redo, history } from "prosemirror-history";
import { dropCursor } from "prosemirror-dropcursor";

import applyDevTools from "prosemirror-dev-tools";

import { schema } from "./schema";
import { editorStyles } from "./styles";
import { buildViews, buildBlockPlugins } from "./blocks/utils";
import { taskList } from "./blocks/taskList";
import { list } from "./blocks/list";
import { marks } from "./blocks/marks";
import { placeholderPlugin } from "./plugins/placeholder";
import { heading, hr, blockQuote, codeBlock } from "./blocks/base";
import { link, linkTooltip } from "./blocks/link";
import { tooltipPlugin } from "./plugins/tooltip";
import { inlineToolbar } from "./component/inlineToolbar";

export interface IEditor {
  /** Json string */
  initState: string;

  /**
   * Callback every time state changes
   */
  onChange: (content: string) => void;
}

const stateConfig = {
  schema,
  plugins: [
    history(),
    keymap({ "Mod-z": undo, "Mod-y": redo }),
    dropCursor(),

    ...buildBlockPlugins([
      taskList,
      list,
      marks,
      heading,
      hr,
      blockQuote,
      codeBlock,
      link
    ]),

    tooltipPlugin([linkTooltip, inlineToolbar]),

    placeholderPlugin()
  ]
};

export const Editor: FC<IEditor> = props => {
  const { initState, onChange } = props;

  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<null | EditorView>(null);

  let state: EditorState;
  /**
   * check for invalid initState
   */
  try {
    state = EditorState.fromJSON(stateConfig, JSON.parse(initState));
  } catch (err) {
    state = EditorState.create(stateConfig);
  }

  const dispatchTransaction = (tr: Transaction) => {
    state = state.apply(tr);
    viewRef.current?.updateState(state);

    tr.docChanged && onChange(JSON.stringify(state.toJSON()));
  };

  /**
   * Initialises editor
   */
  useEffect(() => {
    if (ref.current) {
      viewRef.current = new EditorView(ref.current, {
        state,
        nodeViews: buildViews([taskList]),
        dispatchTransaction
      });

      if (process.env.NODE_ENV === "development") {
        applyDevTools(viewRef.current);
      }
    }
  }, []);

  return (
    <Container>
      <EditorContainer id="editor" ref={ref} />
    </Container>
  );
};

/**
 * This is styled as opposed to the `EditorContainer`
 * to allows plugins like `tooltip` to position itself correctly.
 */
const Container = styled.div`
  position: relative;

  max-width: 720px;
  margin: auto;
  padding: 96px;

  @media screen and (max-width: 600px) {
    padding: 12px;
  }
`;

const EditorContainer = styled.div`
  & :focus {
    outline: none;
  }

  ${editorStyles};
`;
