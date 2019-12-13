import React from "react";
import styled from "styled-components";

import { colors } from "components/styles/colors";
import { toggleMark } from "prosemirror-commands";

import { Tooltip } from "../plugins/tooltip";

import { insertLink } from "../blocks/link";

/**
 * Displays a toolbar
 */
export const inlineToolbar: Tooltip = view => {
  // empty
  if (view.state.selection.empty) return null;

  const { schema } = view.state;

  return () => (
    <Container>
      <ActionButton
        onClick={() => toggleMark(schema.marks.bold)(view.state, view.dispatch)}
      >
        B
      </ActionButton>
      <ActionButton
        onClick={() =>
          toggleMark(schema.marks.italic)(view.state, view.dispatch)
        }
      >
        I
      </ActionButton>
      <ActionButton
        onClick={() =>
          toggleMark(schema.marks.strike)(view.state, view.dispatch)
        }
      >
        S
      </ActionButton>
      <ActionButton
        onClick={() => toggleMark(schema.marks.code)(view.state, view.dispatch)}
      >
        C
      </ActionButton>
      <ActionButton
        onClick={() => insertLink(schema.marks.link)(view.state, view.dispatch)}
      >
        L
      </ActionButton>
    </Container>
  );
};

const Container = styled.div`
  padding: 0 1.5px;

  background: white;
  border: 1px solid silver;
  border-radius: 6px;
`;

/**
 * buttons that call commands
 */
const ActionButton = styled.button<{ active?: boolean }>`
  width: 24px;
  height: 24px;

  padding: 6px;
  margin: 3px 1.5px;
  box-sizing: border-box;

  border: none;
  border-radius: 6px;

  background: ${p => (p.active ? colors.clouds : "none")};
  outline: none;

  :hover {
    background: ${colors.clouds};
    cursor: pointer;
  }
`;
