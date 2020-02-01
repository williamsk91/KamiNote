import { Layout as AntdLayout } from "antd";
import styled from "styled-components";

export const Layout = styled(AntdLayout)`
  background: white;
  height: 100%;
`;

export const Sider = styled(AntdLayout.Sider).attrs({
  theme: "light"
})`
  border-right: 1px solid lightgrey;
`;

export const Header = styled(AntdLayout.Header)`
  height: 45px;
  background: white;
`;

export const Content = styled(AntdLayout.Content)`
  background: white;
`;
