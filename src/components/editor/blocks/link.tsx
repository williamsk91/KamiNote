import React, { FC, useState, useEffect } from "react";
import styled from "styled-components";

import { Node, MarkType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";

import { colors } from "components/styles/colors";
import { ITooltip } from "../plugins/tooltip";
import { IBlock, IDispatch } from "./utils";
import { schema } from "../schema";
import { InputRule } from "prosemirror-inputrules";

// -------------------- Commands --------------------

/**
 * insert link in the selection.
 *
 * the href will default to the selected text.
 */
export const insertLink = (markType: MarkType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  const { empty, from, to } = state.selection;

  // can't set a link on an empty selection
  if (empty) return false;

  if (dispatch) {
    const textSelected = state.doc.cut(from, to).textContent;
    const tr = state.tr.addMark(
      from,
      to,
      markType.create({ href: textSelected })
    );
    dispatch(tr);
  }

  return true;
};

/**
 * open href attrs of markType in new tab.
 */
const openHrefInNewTab = (markType: MarkType) => (
  state: EditorState,
  _dispatch?: IDispatch
) => {
  const { $from } = state.selection;

  const fromMarks = $from.marks();
  const linkMark = markType.isInSet(fromMarks);

  if (linkMark) {
    window.open(linkMark.attrs.href, "_blank", "noopener noreferrer nofollow");
    return true;
  }

  return false;
};

/**
 * Updates href attribute of a markType.
 *
 * This is done by first removing the link mark
 * and the adding it again.
 */
const updateHref = (markType: MarkType, href: string) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  const { $from, $to } = state.selection;

  // get the mark
  const fromMarks = $from.marks();
  const mark = markType.isInSet(fromMarks);
  if (!mark) return false;

  // get the text range
  const from = $from.pos - $from.textOffset;

  const toNode = state.doc.nodeAt($to.pos) as Node;
  const to = $to.pos - $to.textOffset + toNode.nodeSize;

  if (dispatch) {
    // remove mark
    const trans = state.tr.removeMark(from, to, markType);

    // add mark with new href
    trans.addMark(
      from,
      to,
      markType.create({
        ...((mark && mark.attrs) || {}),
        href
      })
    );

    dispatch(trans);
  }

  return true;
};

/**
 * removes markType from the whole text range.
 *
 * note: removeMarkText from aaa_bbb_ccc
 *        where aaa and ccc only have markType
 *              bbb have markType and another mark
 *
 *        while cursor is aaa remove markType from aaa.
 *        If selection is from aaa to ccc then markType
 *        will be removed from aaa_bbb_ccc.
 *
 */
const removeMarkText = (markType: MarkType) => (
  state: EditorState,
  dispatch?: IDispatch
) => {
  const { $from, $to } = state.selection;

  // get the mark
  const fromMarks = $from.marks();
  const mark = markType.isInSet(fromMarks);
  if (!mark) return false;

  // get the text range
  const from = $from.pos - $from.textOffset;

  const toNode = state.doc.nodeAt($to.pos) as Node;
  const to = $to.pos - $to.textOffset + toNode.nodeSize;

  if (dispatch) {
    const trans = state.tr.removeMark(from, to, markType);

    dispatch(trans);
  }

  return true;
};

// -------------------- Input Rule --------------------

/**
 * [name](link)
 */
const linkMDInputRule = new InputRule(
  /(?:^|[^!])\[(.*?)\]\((\S+)\)$/,
  (state, match, start, end) => {
    const { tr } = state;
    const attrs = { href: match[2] };

    tr.delete(start, end);

    const linkStart = start;
    // minus length of <link> and []()
    const linkEnd = end - match[2].length - 4;

    return tr
      .insert(linkStart, schema.text(match[1]))
      .addMark(linkStart, linkEnd, schema.marks.link.create(attrs));
  }
);

/**
 * https:// ...
 * http:// ...
 *
 * triggered with space
 *
 * regex modified slightly from https://mathiasbynens.be/demo/url-regex
 *  by @stephenhay
 */
const linkInputRule = new InputRule(
  /((?:https?|ftp)\:\/\/[^\s/$.?#].[^\s]*)\s$/,
  (state, match, start, end) => {
    const { tr } = state;
    const attrs = { href: match[1] };

    tr.delete(start, end);

    return tr
      .insert(start, schema.text(match[0]))
      .addMark(start, end, schema.marks.link.create(attrs));
  }
);

// -------------------- Keymaps --------------------

const keymaps = {
  "Mod-Enter": openHrefInNewTab(schema.marks.link)
};

// ------------------------- Export -------------------------

export const link: IBlock = {
  name: "link",
  keymaps,
  inputRules: [linkMDInputRule, linkInputRule]
};

// ------------------------- Tooltip Plugin -------------------------

/**
 * Tooltip for `link`.
 *
 * Shows [Open | Edit | Unlink] normally.
 * Shows [<href> | Cancel | Confirm] while editing.
 *
 */
export const LinkTooltip: FC<ITooltip> = props => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const { state, dispatch } = props.view;
  const { selection, schema } = state;
  const { $from, $to } = selection;
  /**
   * Reset to not editing on selection change.
   */
  useEffect(() => {
    setEditing(false);
  }, [selection]);

  const fromMarks = $from.marks();
  const toMarks = $to.marks();

  const linkMark = schema.marks.link.isInSet(fromMarks);

  /**
   * set starting href as current href
   */
  useEffect(() => {
    linkMark && setInputVal(linkMark.attrs.href);
  }, [linkMark]);

  /**
   * Only shows tooltip if the selection is explicitely
   *  inside one and only one link.
   */
  const linkInBothPos = linkMark && linkMark.isInSet(toMarks);
  if (!linkInBothPos) return null;

  const EditLinkBody = (
    <>
      <NewHrefInput
        value={inputVal}
        onChange={e => {
          setInputVal(e.currentTarget.value);
        }}
      />
      <Spacer>|</Spacer>
      <LinkActions
        onClick={() => {
          setInputVal(linkMark.attrs.href);
          setEditing(false);
        }}
      >
        Cancel
      </LinkActions>
      <Spacer>|</Spacer>
      <LinkActions
        onClick={() => {
          updateHref(schema.marks.link, inputVal)(state, dispatch);
          setEditing(false);
        }}
      >
        Confirm
      </LinkActions>
    </>
  );

  const ShowLinkBody = (
    <>
      <LinkActions onClick={() => window.open(linkMark.attrs.href, "_blank")}>
        Open
      </LinkActions>
      <Spacer>|</Spacer>
      <LinkActions onClick={() => setEditing(true)}>Edit</LinkActions>
      <Spacer>|</Spacer>
      <LinkActions
        onClick={() => removeMarkText(schema.marks.link)(state, dispatch)}
      >
        Unlink
      </LinkActions>
    </>
  );

  const body = editing ? EditLinkBody : ShowLinkBody;

  return <Container {...props}>{body}</Container>;
};

// ------------------------- Style -------------------------

const Container = styled.div<ITooltip>`
  position: absolute;
  left: ${p => `${p.anchor.left}px`};
  top: ${p => `${p.anchor.top}px`};
  transform: translate(-50%, -110%);

  padding: 3px;

  background: white;
  border: 1px solid silver;
  border-radius: 6px;
`;

const LinkActions = styled.button`
  padding: 6px 12px;
  box-sizing: border-box;

  background: none;
  border: none;
  border-radius: 3px;

  outline: none;
  :hover {
    background-color: ${colors.clouds};
    cursor: pointer;
  }
`;

const Spacer = styled.span`
  margin: 0 3px;
`;

const NewHrefInput = styled(LinkActions).attrs({
  as: "input"
})`
  min-width: 60px;

  :hover {
    cursor: text;
  }
`;
