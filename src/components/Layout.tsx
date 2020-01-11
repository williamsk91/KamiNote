import styled from "styled-components";

import { Layout as AntdLayout } from "antd";

export const Layout = styled(AntdLayout)`
  background: white;
  height: 100%;
`;

export const Sider = styled(AntdLayout.Sider).attrs({
  theme: "light"
})`
  height: 100vh;
  border-right: 1px solid lightgrey;
`;

export const Header = styled(AntdLayout.Header)`
  background: white;
`;

export const Navbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Content = styled(AntdLayout.Content)`
  background: white;
`;
