import React, { FC } from "react";
import styled from "styled-components";

export enum SaveStatus {
  Saved,
  Saving,
  ErrorSaving
}

interface IProp {
  saveStatus: SaveStatus;
}

export const SaveState: FC<IProp> = props => {
  const { saveStatus } = props;

  let state: string;
  switch (saveStatus) {
    case SaveStatus.Saved:
      state = "saved";
      break;

    case SaveStatus.Saving:
      state = "saving";
      break;

    case SaveStatus.ErrorSaving:
      state = "error";
      break;
  }

  return <Save>{state}</Save>;
};

const Save = styled.div`
  grid-area: saveState;
  justify-self: right;
`;
