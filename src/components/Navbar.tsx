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
      {collapsed ? (
        <OpenSidebar
          type="menu-unfold"
          onClick={() => setCollapsed(!collapsed)}
        />
      ) : (
        <div />
      )}
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

const OpenSidebar = styled(Icon).attrs(() => ({
  type: "menu-unfold"
}))`
  font-size: 24px;
`;
