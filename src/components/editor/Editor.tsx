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
import { taskItem } from "./blocks/taskItem";
import { list } from "./blocks/list";
import { marks } from "./blocks/marks";

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
        ...buildInputRulesAndKeymaps([taskItem, list, marks])
      ]
    });

    const view = new EditorView(document.querySelector("#editor") as Node, {
      state,
      nodeViews: buildViews([taskItem])
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
        </ul>
        <ul data-level={1}>
          <li>item 1</li>
        </ul>
        <ul data-level={2}>
          <li>item 1</li>
        </ul>
        <ol start={3}>
          <li>item 1</li>
        </ol>
        <ol data-level={1}>
          <li>item 1</li>
        </ol>
        <ol data-level={2}>
          <li>item 1</li>
        </ol>
        <hr />
        <ul className="taskList">
          <div className="taskItem" data-checked={true}>
            checked
          </div>
        </ul>
        <ul className="taskList" data-level={1}>
          <div className="taskItem" data-checked={false}>
            unchecked
          </div>
        </ul>
        <ul className="taskList" data-level={2}>
          <div className="taskItem" data-checked={true}>
            checked
          </div>
        </ul>
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
  ${editorStyles};
`;
