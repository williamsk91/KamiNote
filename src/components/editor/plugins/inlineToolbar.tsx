import { Plugin } from "prosemirror-state";
import React, { FC } from "react";

import { ITooltip, tooltip } from "./tooltip";
import styled from "styled-components";
import { colors } from "components/styles/colors";
import { toggleMark } from "prosemirror-commands";
import { insertLink } from "../blocks/link";

/**
 * Inline toolbar plugins that is extended from `tooltip` plugin.
 *
 * Displays a toolbar when there is a textSelection.
 *
 * similar to setting up `tooltip`, nodeId is the id of a node
 *  **outisde** of the editor.
 *
 */
export const inlineToolbar = (nodeId: string) =>
  new Plugin({
    view: () => tooltip(nodeId, InlineToolbar)
  });

export const InlineToolbar: FC<ITooltip> = props => {
  const { view, empty } = props;

  // empty
  if (empty) return null;

  const { schema } = view.state;

  return (
    <Container {...props}>
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

/**
 * Positions the toolbar on top of the head cursor.
 */
const Container = styled.div<ITooltip>`
  position: absolute;
  left: ${p => `${p.head.left}px`};
  top: ${p => `${p.head.top}px`};
  transform: translate(-50%, -110%);

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
