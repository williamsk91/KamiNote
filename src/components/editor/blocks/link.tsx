import React, { FC, useState } from "react";
import styled from "styled-components";

import { ITooltip } from "../plugins/tooltip";

import { IBlock } from "./utils";
import { Node } from "prosemirror-model";
import { colors } from "components/styles/colors";

export const link: IBlock = {
  name: "link"
};

/**
 * Tooltip for `link`.
 */
export const LinkTooltip: FC<ITooltip> = props => {
  const [editing, setEditing] = useState(false);

  const { tr, selection, schema } = props.view.state;
  const { $from, $to } = selection.ranges[0];

  // Check selection wraps a single link
  const fromMarks = $from.marks();
  const toMarks = $to.marks();

  const linkMark = schema.marks.link.isInSet(fromMarks);
  const linkInBothPos = linkMark && linkMark.isInSet(toMarks);
  if (!linkInBothPos) return null;

  /**
   * removes link from selection.
   * note: unlink from linktext_LINKTEXTANDBOLD_restoflinktext
   *        while cursor is in linktext will only unlink linktext.
   *        If selection is from linktext to restoflinktext then
   *        all three sections will be unlinked.
   *
   * turn to a command?
   */
  const unlink = () => {
    const from = $from.pos - $from.textOffset;

    const toNode = props.view.state.doc.nodeAt($to.pos) as Node;
    const to = $to.pos - $to.textOffset + toNode.nodeSize;

    const trans = tr.removeMark(from, to, schema.marks.link);
    props.view.dispatch(trans);
  };

  const body = editing ? (
    <URLInput contentEditable>{linkMark.attrs.href}</URLInput>
  ) : (
    <>
      <LinkActions onClick={() => window.open(linkMark.attrs.href, "_blank")}>
        Open
      </LinkActions>
      <Spacer>|</Spacer>
      <LinkActions onClick={() => setEditing(true)}>Edit</LinkActions>
      <Spacer>|</Spacer>
      <LinkActions onClick={() => unlink()}>Unlink</LinkActions>
    </>
  );

  return <Container {...props}>{body}</Container>;
};

const Container = styled.div<ITooltip>`
  position: absolute;
  left: ${p => p.left};
  bottom: ${p => p.bottom};

  padding: 3px;
  margin-bottom: 6px;

  background: white;
  border: 1px solid silver;
  border-radius: 6px;
  transform: translateX(-50%);
`;

const LinkActions = styled.button`
  padding: 6px 12px;

  background: none;
  border: none;
  border-radius: 3px;

  :hover {
    background-color: ${colors.clouds};
    cursor: pointer;
  }
`;

const Spacer = styled.span`
  margin: 0 3px;
`;

const URLInput = styled.div`
  min-width: 84px;
  padding: 6px;
`;
