import React, { FC, useState, useEffect } from "react";
import styled from "styled-components";

import { ITooltip } from "../tooltip";
import { IInlineSuggestion, ITextPos } from "./suggestion";

export interface ISuggestionTooltip extends ITooltip {
  suggestion?: IInlineSuggestion;
  onSelect: (suggestion: string, pos: ITextPos) => void;
  onIgnore: () => void;
}
export const SuggestionMenu: FC<ISuggestionTooltip> = props => {
  const { suggestion, onSelect, onIgnore, ...tooltipProps } = props;

  /**
   * Close the menu (i.e. render null).
   *
   * This is used to close the menu after selecting one
   * of the suggested phrase or ignoring the phrase.
   */
  const [close, setClose] = useState(!suggestion);

  useEffect(() => {
    setClose(!suggestion);
  }, [suggestion]);

  if (close) return null;

  const { candidates, pos } = suggestion as IInlineSuggestion;

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
          onIgnore();
          setClose(true);
        }}
      >
        Ignore list
      </ActionButton>
    </Container>
  );
};

const Container = styled.div<ITooltip>`
  position: absolute;
  left: ${p => `${p.anchor.left}px`};
  top: ${p => `${p.anchor.top}px`};
  transform: translateX(-200%);

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
