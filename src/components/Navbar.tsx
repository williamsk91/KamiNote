import React, { FC } from "react";
import { Icon } from "antd";
import styled from "styled-components";

import { SaveState, SaveStatus } from "./SaveState";

interface IProp {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  saveStatus: SaveStatus;
}

export const Navbar: FC<IProp> = props => {
  const { collapsed, setCollapsed, saveStatus } = props;
  return (
    <Container>
      <Icon
        type={collapsed ? "menu-unfold" : "menu-fold"}
        onClick={() => setCollapsed(!collapsed)}
      />
      <SaveState saveStatus={saveStatus} />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;

  padding: 6px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;
