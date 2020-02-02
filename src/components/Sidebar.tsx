import React, { FC } from "react";
import { FiPlusSquare, FiTrash2 } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import { Icon, Popconfirm, Tree, Typography } from "antd";
import styled from "styled-components";

import { pageUrl } from "routes/pagePath";

import { IconButton } from "./IconButton";
import { Header } from "./Layout";
import { colors } from "./styles/colors";

interface IProp {
  pages: {
    title: string;
    id: string;
  }[];
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;

  closeSidebar: () => void;
}

export const Sidebar: FC<IProp> = props => {
  const { pages, onAddPage, onDeletePage, closeSidebar } = props;
  const history = useHistory();

  return (
    <Container>
      <SidebarHeader>
        <SidebarNavbar>
          <CloseSidebar onClick={closeSidebar} />
        </SidebarNavbar>
      </SidebarHeader>
      <SectionTitle>Pages</SectionTitle>
      <Tree>
        {pages.map(p => (
          <Tree.TreeNode
            selectable={false}
            key={p.id}
            title={
              <TreeNodeContainer>
                <NodeText
                  onClick={() => {
                    history.push(pageUrl(p.id));
                  }}
                >
                  {p.title ? p.title : "Untitled"}
                </NodeText>
                <NodeIcons>
                  <IconButton onClick={onAddPage}>
                    <FiPlusSquare />
                  </IconButton>
                  <Popconfirm
                    title="Delete page forever?"
                    onConfirm={() => onDeletePage(p.id)}
                    placement="right"
                  >
                    <IconButton>
                      <FiTrash2 />
                    </IconButton>
                  </Popconfirm>
                </NodeIcons>
              </TreeNodeContainer>
            }
          />
        ))}
      </Tree>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;

  background: ${p => p.theme.background.secondary};
`;

const SidebarHeader = styled(Header)`
  background: ${p => p.theme.background.secondary};
`;

const SidebarNavbar = styled.div`
  height: 100%;

  padding: 6px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CloseSidebar = styled(Icon).attrs(() => ({
  type: "menu-fold"
}))`
  font-size: 24px;
`;

const SectionTitle = styled(Typography.Text)`
  text-transform: uppercase;
  padding-left: 5px;
  margin-left: 24px;

  color: ${p => p.theme.text.disabled};
`;

const TreeNodeContainer = styled.div`
  position: relative;
`;

const NodeText = styled.div`
  display: block;
  width: 158px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NodeIcons = styled.div`
  position: absolute;
  right: 0px;
  top: 0px;

  background: ${colors.white};
  opacity: 0.9;
  display: none;

  ${TreeNodeContainer}:hover & {
    display: block;
  }
`;
