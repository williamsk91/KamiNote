import React, { FC, useState } from "react";
import styled from "styled-components";

interface IProp {
  title: string;
  onChange: (title: string) => void;
}

export const PageTitle: FC<IProp> = props => {
  const { title, onChange } = props;

  const [localTitle, setLocalTitle] = useState(title);

  return (
    <Container>
      <Input
        value={localTitle}
        onChange={e => {
          setLocalTitle(e.target.value);
          onChange(e.target.value);
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  max-width: 720px;
  box-sizing: content-box;
  margin: auto;
  padding: 0 96px;

  @media screen and (max-width: 720px) {
    padding: 0 12px;
  }
`;

const Input = styled.input.attrs({
  type: "text",
  placeholder: "Untitled"
})`
  font-size: 40px;
  font-weight: 700;

  border: none;
  outline: none;
`;
