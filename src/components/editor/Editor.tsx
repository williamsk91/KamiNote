import React, { useEffect } from "react";
import styled from "styled-components";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { DOMParser } from "prosemirror-model";

import { schema } from "./schema";
import { markKeymap } from "./plugins/keymaps";
import { marksStyles } from "./styles";
import { tooltipToolbar } from "./plugins/tooltipToolbar";

export const Editor = () => {
  useEffect(() => {
    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(document.querySelector(
        "#content"
      ) as Node),
      plugins: [markKeymap, tooltipToolbar]
    });

    new EditorView(document.querySelector("#editor") as Node, {
      state
    });
  }, []);

  return (
    <>
      <Container id="editor" />
      <div id="content" style={{ display: "none" }}>
        <p>Starting content</p>
        <p>
          with <b>bold</b>, <i>italic</i>, <s>strike</s>
        </p>
        <p>
          <code>code</code>
        </p>
      </div>
      <div id="toolbar">yo</div>
    </>
  );
};

const Container = styled.div`
  padding: 45px;
  border: 1px solid grey;

  ${marksStyles};
`;
