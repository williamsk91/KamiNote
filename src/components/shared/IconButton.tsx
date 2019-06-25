import React, { FC } from "react";
import styled from "styled-components";
import { IconContext } from "react-icons";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export const Button = styled.button`
  height: 24px;
  padding: 3px;
  border-radius: 3px;

  background: yellow;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* styles */
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: ${p => p.theme.background.default};
  }
`;

export const IconButton: FC<Props> = props => {
  const { children, ...buttonProps } = props;
  return (
    <IconContext.Provider value={{ size: "1.4em" }}>
      <Button {...buttonProps}>{props.children}</Button>
    </IconContext.Provider>
  );
};
