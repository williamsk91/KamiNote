import { Layout as AntdLayout } from "antd";
import styled from "styled-components";

export const Layout = styled(AntdLayout)`
  background: white;
  height: 100%;
`;

export const Sider = styled(AntdLayout.Sider).attrs({
  theme: "light"
})``;

export const Header = styled(AntdLayout.Header)`
  height: 45px;
  padding: 0;

  background: white;
`;

export const Content = styled(AntdLayout.Content)`
  background: white;
`;
