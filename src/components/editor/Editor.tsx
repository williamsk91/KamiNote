import React, { useEffect } from "react";
import styled from "styled-components";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { undo, redo, history } from "prosemirror-history";

import applyDevTools from "prosemirror-dev-tools";

import { schema } from "./schema";
import { editorStyles } from "./styles";
import { buildViews, buildInputRulesAndKeymaps } from "./blocks/utils";
import { taskList } from "./blocks/taskList";
import { list } from "./blocks/list";
import { marks } from "./blocks/marks";
import { placeholderPlugin } from "./plugins/placeholder";
import { heading, hr, blockQuote, codeBlock } from "./blocks/base";

export const Editor = () => {
  let view: EditorView | null;
  useEffect(() => {
    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(
        document.querySelector("#content") as Node
      ),
      plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        ...buildInputRulesAndKeymaps([
          taskList,
          list,
          marks,
          heading,
          hr,
          blockQuote,
          codeBlock
        ]),
        placeholderPlugin()
      ]
    });

    view = new EditorView(document.querySelector("#editor") as Node, {
      state,
      nodeViews: buildViews([taskList])
    });

    applyDevTools(view);
  }, []);

  return (
    <>
      <Container onClick={() => view && view.focus()} id="editor" />
      <div id="content" style={{ display: "none" }}>
        <h1>H1</h1>
        <h2>H2</h2>
        <h3>H3</h3>
        <hr />
        <p>text</p>
        <p>
          <b>bold</b> && <i>italic</i> && <s>strike</s>
        </p>
        <p>
          <span data-color="yellow">yellow text</span>
        </p>
        <p>
          also <code>code</code>
        </p>
        <hr />
        <hr />
        <hr />
        <blockquote>Quote</blockquote>
        <pre>
          <code>codee</code>
          <code>export const foo = () => </code>
        </pre>
        <hr />
        <ul>item 1 </ul>
        <ul data-level={1}>item 1 </ul>
        <ul data-level={2}>item 1 </ul>
        <ol>item 1 </ol>
        <ol data-level={1}>item 1 </ol>
        <ol data-level={2}>item 1 </ol>
        <div className="taskList" data-checked={true}>
          checked
        </div>
        <div className="taskList" data-level={1} data-checked={false}>
          unchecked
        </div>
        <div className="taskList" data-level={2} data-checked={true}>
          checked
        </div>
        <hr />
      </div>
    </>
  );
};

const Container = styled.div`
  max-width: 720px;
  margin: auto;
  padding: 96px;

  & :focus {
    outline: none;
  }

  ${editorStyles};
`;
