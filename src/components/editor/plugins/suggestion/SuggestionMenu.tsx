import React, { FC } from "react";
import styled from "styled-components";

import { ISuggestion, ITextPos } from "./types";
import { Decoration } from "prosemirror-view";

interface ISuggestionMenu {
  suggestion: Decoration<ISuggestion>;
  onSelect: (suggestion: string, pos: ITextPos) => void;
  onIgnore: (phrase: string) => void;
}

/**
 * Menu that displays selectable candidates for a misspelled word.
 * Also displays an ignore button.
 */
export const SuggestionMenu: FC<ISuggestionMenu> = props => {
  const { suggestion, onSelect, onIgnore } = props;
  const { phrase, candidates } = suggestion.spec;

  return (
    <Container>
      <div>
        <b>Suggestions</b>
      </div>
      {candidates.map((c, i) => (
        <ActionButton
          key={i}
          onClick={() => {
            onSelect(c, { from: suggestion.from, to: suggestion.to });
          }}
        >
          {c}
        </ActionButton>
      ))}
      <ActionButton>-</ActionButton>
      <ActionButton
        onClick={() => {
          onIgnore(phrase);
        }}
      >
        Ignore list
      </ActionButton>
    </Container>
  );
};

const Container = styled.div`
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
