import { css } from "styled-components";
import { placeholderPluginStyles } from "./plugins/placeholder";

export const editorStyles = css`
  ${placeholderPluginStyles}

  font-size: 16px;

  p {
    margin: 0;
    padding: 3px;
  }

  code {
    padding: 0 3px;
    border-radius: 3px;

    color: #eb5757;
    background-color: rgba(135, 131, 120, 0.15);
  }

  pre {
    background-color: rgba(135, 131, 120, 0.15);
    padding: 20px;
    code {
      background-color: transparent;
    }
  }

  hr {
    height: 1px;
    background-color: rgb(228, 227, 226);
    border: none;
  }

  blockquote {
    margin: 0;
    height: 28px;
    font-size: 24px;

    padding-left: 12px;
    border-left: 3px solid rgb(55, 53, 47);
  }

  div.taskItem {
    display: flex;
    position: relative;
    padding-left: 3px;

    &[data-checked="true"] > div.checkbox {
      background: rgb(55, 53, 47);
    }

    div.checkbox {
      position: absolute;
      right: 100%;

      width: 15px;
      height: 15px;

      border: 2px solid rgb(55, 53, 47);
      border-radius: 5px;
      cursor: pointer;
    }
  }
`;

export const ulListType = (level: number) =>
  ["disc", "circle", "square"][level % 3];

export const olListType = (level: number) =>
  ["decimal", "lower-latin", "lower-roman"][level % 3];
