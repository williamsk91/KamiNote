import React, { FC } from "react";
import { Menu, Icon } from "antd";

import { useHistory } from "react-router-dom";
import { pageUrl } from "routes/pagePath";
import styled from "styled-components";

interface IProp {
  pages: {
    title: string;
    id: string;
  }[];
  onAddPage: () => void;
}

export const Sidebar: FC<IProp> = props => {
  const { pages, onAddPage } = props;
  const history = useHistory();

  return (
    <Menu mode="inline" selectable={false}>
      {pages.map(p => (
        <Item key={p.id} id={p.id} onClick={() => history.push(pageUrl(p.id))}>
          <span>{p.title ? p.title : "Untitled"}</span>
          <Icon type="plus-square" onClick={onAddPage} />
        </Item>
      ))}
    </Menu>
  );
};

const Item = styled(Menu.Item)`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;
