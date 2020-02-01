import React, { FC } from "react";
import { FiCheckSquare, FiSquare } from "react-icons/fi";
import styled from "styled-components";

interface IProp {
  checked: boolean;
  onClick: () => void;
  className?: string;
}

export const Checkbox: FC<IProp> = props => {
  const { checked, onClick, className } = props;

  const iconProps = {
    onClick,
    size: "1.2em"
  };

  return (
    <Container className={className}>
      {checked ? <FiCheckSquare {...iconProps} /> : <FiSquare {...iconProps} />}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;

  cursor: pointer;
`;
