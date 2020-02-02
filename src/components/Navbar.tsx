import React, { FC } from "react";
import { Icon } from "antd";
import styled from "styled-components";

interface IProp {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Navbar: FC<IProp> = props => {
  const { collapsed, setCollapsed } = props;
  return (
    <Container>
      {collapsed && (
        <OpenSidebar
          type="menu-unfold"
          onClick={() => setCollapsed(!collapsed)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;

  padding: 6px;

  display: flex;
  align-items: center;
`;

const OpenSidebar = styled(Icon).attrs(() => ({
  type: "menu-unfold"
}))`
  font-size: 24px;
`;
