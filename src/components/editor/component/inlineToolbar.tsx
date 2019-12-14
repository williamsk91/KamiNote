import React, { FC } from "react";
import styled from "styled-components";

import { FiCode } from "react-icons/fi";
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineStrikethrough,
  AiOutlineLink
} from "react-icons/ai";

import { toggleMark } from "prosemirror-commands";
import { EditorView } from "prosemirror-view";

import { Tooltip } from "../plugins/tooltip";
import { insertLink } from "../blocks/link";
import { IconButton } from "./IconButton";

/**
 * Displays a toolbar
 */
export const inlineToolbar: Tooltip = view => {
  // empty
  if (view.state.selection.empty) return null;

  return () => <InlineToolbar view={view} />;
};

const InlineToolbar: FC<{ view: EditorView }> = props => {
  const { view } = props;
  const { schema } = view.state;

  return (
    <Container>
      <IconButton
        onClick={() => toggleMark(schema.marks.bold)(view.state, view.dispatch)}
      >
        <AiOutlineBold />
      </IconButton>
      <IconButton
        onClick={() =>
          toggleMark(schema.marks.italic)(view.state, view.dispatch)
        }
      >
        <AiOutlineItalic />
      </IconButton>
      <IconButton
        onClick={() =>
          toggleMark(schema.marks.strike)(view.state, view.dispatch)
        }
      >
        <AiOutlineStrikethrough />
      </IconButton>
      <IconButton
        onClick={() => toggleMark(schema.marks.code)(view.state, view.dispatch)}
      >
        <FiCode />
      </IconButton>
      <IconButton
        onClick={() => insertLink(schema.marks.link)(view.state, view.dispatch)}
      >
        <AiOutlineLink />
      </IconButton>
    </Container>
  );
};

const Container = styled.div`
  padding: 0 1.5px;

  background: white;
  border: 1px solid silver;
  border-radius: 6px;
`;
