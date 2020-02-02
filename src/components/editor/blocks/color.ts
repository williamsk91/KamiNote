import { InputRule } from "prosemirror-inputrules";

import { IBlock } from "./utils";

// ------------------------- Pallete -------------------------

export const colorPallete = {
  red: "#EA2027",
  orange: "#e58e26",
  yellow: "#FFC312",
  green: "#009432",
  blue: "#0652DD",
  purple: "#5758BB",
  pink: "#D980FA"
};

export type ColorPallete = keyof typeof colorPallete;

export const highlightPallete = {
  red: "rgb(251, 228, 228)",
  orange: "rgb(250, 235, 221)",
  yellow: "rgb(251, 243, 219)",
  green: "rgb(221, 237, 234)",
  blue: "rgb(221, 235, 241);",
  purple: "rgb(234, 228, 242)",
  pink: "rgb(244, 223, 235)"
};

export type HighlightPallete = keyof typeof highlightPallete;

// -------------------- Commands --------------------

// -------------------- Input Rule --------------------

/**
 * {c:color}
 */
const colorInputRule = new InputRule(
  /{c:([^`]+)}$/,
  (state, match, start, end) => {
    const { tr } = state;
    const color = match[1];

    // check that color exists
    if (!(color === "clear") && !(color in colorPallete)) return null;

    tr.delete(start, end);

    // color the whole node
    const resolvedStart = state.doc.resolve(start);
    const nodeStart = start - resolvedStart.parentOffset;
    const nodeEnd =
      nodeStart + resolvedStart.parent.textContent.length - (color.length + 1);

    if (color === "clear") {
      return tr.removeMark(nodeStart, nodeEnd, state.schema.marks.color);
    }

    return tr.addMark(
      nodeStart,
      nodeEnd,
      state.schema.marks.color.create({
        color: colorPallete[color as ColorPallete]
      })
    );
  }
);

/**
 * {h:highlight}
 */
const highlightInputRule = new InputRule(
  /{h:([^`]+)}$/,
  (state, match, start, end) => {
    const { tr } = state;
    const color = match[1];

    // check that color exists
    if (!(color === "clear") && !(color in highlightPallete)) return null;

    tr.delete(start, end);

    // highlight the whole node
    const resolvedStart = state.doc.resolve(start);
    const nodeStart = start - resolvedStart.parentOffset;
    const nodeEnd =
      nodeStart + resolvedStart.parent.textContent.length - (color.length + 1);

    if (color === "clear") {
      return tr.removeMark(nodeStart, nodeEnd, state.schema.marks.highlight);
    }

    return tr.addMark(
      nodeStart,
      nodeEnd,
      state.schema.marks.highlight.create({
        color: highlightPallete[color as HighlightPallete]
      })
    );
  }
);

// ------------------------- Export -------------------------

export const color: IBlock = {
  name: "color",
  inputRules: [colorInputRule]
};

export const highlight: IBlock = {
  name: "highlight",
  inputRules: [highlightInputRule]
};
