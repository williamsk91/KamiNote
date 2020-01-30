import React, { FC } from "react";
import { FiPlusSquare, FiTrash2 } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import { Tree } from "antd";
import styled from "styled-components";

import { pageUrl } from "routes/pagePath";

import { IconButton } from "./IconButton";
import { colors } from "./styles/colors";

interface IProp {
  pages: {
    title: string;
    id: string;
  }[];
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
}

export const Sidebar: FC<IProp> = props => {
  const { pages, onAddPage, onDeletePage } = props;
  const history = useHistory();

  return (
    <Tree>
      {pages.map(p => (
        <Tree.TreeNode
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
                <IconButton onClick={() => onDeletePage(p.id)}>
                  <FiTrash2 />
                </IconButton>
              </NodeIcons>
            </TreeNodeContainer>
          }
        />
      ))}
    </Tree>
  );
};

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
