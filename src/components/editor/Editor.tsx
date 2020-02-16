import React, { FC, useEffect, useRef } from "react";
import applyDevTools from "prosemirror-dev-tools";
import { dropCursor } from "prosemirror-dropcursor";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import styled from "styled-components";

import { blockQuote, codeBlock, heading, hr } from "./blocks/base";
import { color, highlight } from "./blocks/color";
import { link } from "./blocks/link";
import { list } from "./blocks/list";
import { marks } from "./blocks/marks";
import { taskList } from "./blocks/taskList";
import { buildBlockPlugins, buildViews } from "./blocks/utils";
import { placeholderPlugin } from "./plugins/placeholder";
import { schema } from "./schema";
import { editorStyles } from "./styles";

export interface IEditor {
  initState: string;
  onChange: (content: string) => void;
}

export const Editor: FC<IEditor> = props => {
  const { initState, onChange } = props;

  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<null | EditorView>(null);

  const dispatchTransaction = (tr: Transaction) => {
    if (viewRef.current) {
      const newState = viewRef.current.state.apply(tr);

      viewRef.current.updateState(newState);
      tr.docChanged && onChange(JSON.stringify(newState.toJSON()));
    }
  };

  useEffect(() => {
    let state: EditorState;
    try {
      state = EditorState.fromJSON(stateConfig, JSON.parse(initState));
    } catch (err) {
      state = EditorState.create(stateConfig);
    }

    if (ref.current) {
      viewRef.current?.destroy();

      viewRef.current = new EditorView(ref.current, {
        state,
        nodeViews: buildViews([taskList]),
        dispatchTransaction
      });

      if (process.env.NODE_ENV === "development") {
        applyDevTools(viewRef.current);
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <EditorContainer id="editor" ref={ref} />
    </Container>
  );
};

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
      link,
      color,
      highlight
    ]),

    // tooltipPlugin([linkTooltip, inlineToolbar]),

    placeholderPlugin()
  ]
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
  box-sizing: content-box;
  padding-top: 24px;

  @media screen and (max-width: 720px) {
    padding: 12px;
  }
`;

const EditorContainer = styled.div`
  & :focus {
    outline: none;
  }

  ${editorStyles};
`;
