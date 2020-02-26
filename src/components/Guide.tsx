import React, { FC, useState } from "react";
import { Icon, Popover } from "antd";
import styled from "styled-components";

import { colors } from "./styles/colors";

/**
 * Floating icon for supports
 *
 * Current items:
 *      1. Markdown guide
 */
export const Guide: FC = props => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      content={
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Markdown Guide
        </a>
      }
      title="Helps & Guides"
      trigger="click"
      placement="topRight"
      visible={open}
      onVisibleChange={() => setOpen(o => !o)}
    >
      <StickyIcon type="question" />
    </Popover>
  );
};

const StickyIcon = styled(Icon)`
  position: absolute;
  bottom: 24px;
  right: 24px;

  font-size: 24px;

  border: 1px solid ${colors.clouds};
  border-radius: 50%;

  padding: 6px;
  box-sizing: border-box;

  color: ${colors.asbestos};

  box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 2px 4px;
`;
