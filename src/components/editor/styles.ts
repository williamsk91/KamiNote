import { css } from "styled-components";

import { colors } from "components/styles/colors";

import { listStyle } from "./blocks/list";
import { markStyles } from "./blocks/marks";
import { placeholderPluginStyles } from "./plugins/placeholder";

export const editorStyles = css`
  & ::selection {
    background: rgba(45, 170, 219, 0.3);
  }

  ${placeholderPluginStyles}

  font-size: 16px;
  color: ${p => p.theme.text.main};

  p {
    margin: 0;
    padding: 3px 2px;
  }

  h1 {
    font-size: 30px;
    font-weight: 600;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
  }

  code {
    padding: 0 3px;
    border-radius: 3px;

    color: ${colors.alizarin};
    background-color: ${colors.clouds};
  }

  pre {
    background-color: ${colors.clouds};
    padding: 20px;
    code {
      background-color: transparent;
    }
  }

  hr {
    height: 1px;
    margin: 12px 0;
    background-color: ${colors.silver};
    border: none;
  }

  blockquote {
    margin: 0;
    font-size: 24px;

    padding-left: 12px;
    border-left: 3px solid rgb(55, 53, 47);
  }

  ${listStyle}
  ${markStyles}
`;

export const ulListType = (level: number) =>
  ["disc", "circle", "square"][level % 3];

export const olListType = (level: number) =>
  ["decimal", "lower-latin", "lower-roman"][level % 3];
