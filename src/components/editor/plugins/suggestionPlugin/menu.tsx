import React, { FC } from "react";
import styled from "styled-components";

import { ITooltip } from "../tooltip";
import { ISuggestion } from "./suggestion";

export interface ISuggestionTooltip extends ITooltip {
  suggestion?: ISuggestion;
}
export const SuggestionMenu: FC<ISuggestionTooltip> = props => {
  const { suggestion } = props;

  if (!suggestion) return null;

  const { phrase, candidates } = suggestion;

  return (
    <Container {...props}>
      {candidates.map(c => (
        <ActionButton>{c}</ActionButton>
      ))}
      <ActionButton>Ignore list</ActionButton>
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
