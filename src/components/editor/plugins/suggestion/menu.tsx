import React, { FC, useState, useEffect } from "react";
import styled from "styled-components";

import { IInlineSuggestion, ITextPos } from "./types";

export interface ISuggestionTooltip {
  /**
   * left and top offset in px for
   * absolute positioning the component
   * just under the text
   */
  left: number;
  top: number;

  suggestion?: IInlineSuggestion;
  onSelect: (suggestion: string, pos: ITextPos) => void;
  onIgnore: (phrase: string) => void;
}

export const SuggestionMenu: FC<ISuggestionTooltip> = props => {
  const { suggestion, onSelect, onIgnore, ...tooltipProps } = props;

  /**
   * Close the menu (i.e. render null).
   *
   * This is used to close the menu after selecting one
   * of the suggested phrase or ignoring the phrase.
   */
  const [close, setClose] = useState(false);

  useEffect(() => {
    setClose(false);
  }, [suggestion]);

  if (!suggestion || close) return null;

  const { phrase, candidates, pos } = suggestion as IInlineSuggestion;

  return (
    <Container {...tooltipProps}>
      <div>
        <b>Suggestions</b>
      </div>
      {candidates.map((c, i) => (
        <ActionButton
          key={i}
          onClick={() => {
            onSelect(c, pos);
            setClose(true);
          }}
        >
          {c}
        </ActionButton>
      ))}
      <ActionButton>-</ActionButton>
      <ActionButton
        onClick={() => {
          onIgnore(phrase);
          setClose(true);
        }}
      >
        Ignore list
      </ActionButton>
    </Container>
  );
};

const Container = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${p => `${p.left}px`};
  top: ${p => `${p.top}px`};

  display: flex;
  flex-direction: column;

  background: white;
  border: 1px solid silver;
`;

const ActionButton = styled.button`
  background: none;
  border: none;

  :hover {
    background: lightgrey;
  }
`;
