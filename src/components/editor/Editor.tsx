import React, { useEffect } from "react";
import styled from "styled-components";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser } from "prosemirror-model";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { undo, redo, history } from "prosemirror-history";

import applyDevTools from "prosemirror-dev-tools";

import { schema } from "./schema";
import { setKeymap } from "./plugins/keymaps";
import { markNodeStyles } from "./styles";
import { TaskItemView } from "./views/taskItem";
import { buildInputRules } from "./plugins/inputRules";

export const Editor = () => {
  useEffect(() => {
    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(
        document.querySelector("#content") as Node
      ),
      plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        ...setKeymap,
        keymap(baseKeymap),
        buildInputRules()
      ]
    });

    const view = new EditorView(document.querySelector("#editor") as Node, {
      state,
      nodeViews: {
        taskItem: (node, view, getPos) => new TaskItemView(node, view, getPos)
      }
    });

    applyDevTools(view);
  }, []);

  return (
    <>
      <Container id="editor" />
      <div id="content" style={{ display: "none" }}>
        <hr />
        <ul>
          <li>item 1</li>
          <ul>
            <li>item 1</li>
          </ul>
        </ul>
        <ol start={3}>
          <li>item 1</li>
          <ol>
            <li>item 2</li>
          </ol>
        </ol>
        <hr />
        <div className="taskList">
          <div className="taskItem" data-checked={false}>
            unchecked
            <div className="taskList">
              <div className="taskItem" data-checked={false}>
                nested 1
              </div>
              <div className="taskItem" data-checked={true}>
                nested 2
              </div>
            </div>
          </div>
        </div>
        <hr />
        <blockquote>Quote</blockquote>
        <pre>
          <code>codeeeee</code>
          <code>export const foo = () => </code>
        </pre>
        <p>Starting content</p>
        <p>
          with <b>bold</b>, <i>italic</i>, <s>strike</s>
        </p>
        <p>
          <span data-color="yellow">yellow text</span>
        </p>
        <p>
          <code>code</code>
        </p>
        <hr />
        <h1>H1</h1>
        <h2>H2</h2>
        <h3>H3</h3>
      </div>
    </>
  );
};

const Container = styled.div`
  padding: 45px;
  border: 1px solid grey;

  ${markNodeStyles};

  p {
    padding: 3px;
    margin: 0;
  }
`;
