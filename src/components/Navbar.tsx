import React, { FC } from "react";
import styled from "styled-components";

export enum SaveStatus {
  Saved,
  Saving,
  ErrorSaving
}

interface IProp {
  path: string[];
  saveStatus: SaveStatus;
}

export const Navbar: FC<IProp> = props => {
  const { path, saveStatus } = props;
  const pathString = path.join(" / ");

  let state: string;
  switch (saveStatus) {
    case SaveStatus.Saved:
      state = "saved";
      break;

    case SaveStatus.Saving:
      state = "saving...";
      break;

    case SaveStatus.ErrorSaving:
      state = "error";
      break;
  }

  return (
    <Container>
      <Path>{pathString}</Path>
      <Save>{state}</Save>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-areas: "path saveState";
`;

const Path = styled.div`
  grid-area: path;
`;

const Save = styled.div`
  grid-area: saveState;
  justify-self: right;
`;
