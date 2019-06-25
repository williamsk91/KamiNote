import React, { FC, useCallback } from "react";
import styled from "styled-components";
import { IoIosSquareOutline, IoIosCheckboxOutline } from "react-icons/io";
import ContentEditable from "react-contenteditable";

import { IconButton } from "components/shared/IconButton";

interface IData {
  checked: boolean;
  text: string;
}

export interface ICheckBox {
  data: IData;
  onChange: (newData: IData) => void;
}

export const Checkbox: FC<ICheckBox> = props => {
  const { data, onChange } = props;
  const { checked, text } = data;

  return (
    <Container checked={checked}>
      <IconButton onClick={() => onChange({ checked: !checked, text })}>
        {checked ? <IoIosCheckboxOutline /> : <IoIosSquareOutline />}
      </IconButton>
      <ContentEditable
        html={text}
        onChange={(e: React.FormEvent<HTMLDivElement>) => {
          onChange({ checked, text: e.currentTarget.innerHTML });
        }}
        style={{
          margin: "auto 0px"
        }}
      />
    </Container>
  );
};

const Container = styled.div<{ checked: boolean }>`
  display: flex;
  align-content: center;

  opacity: ${p => (p.checked ? 0.36 : 1)};
`;
