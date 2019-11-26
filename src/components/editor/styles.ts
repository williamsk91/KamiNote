import { css } from "styled-components";

export const editorStyles = css`
  p {
    padding: 3px;
    margin: 0;
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
    margin: 10px;
    div.checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid rgb(55, 53, 47);
      border-radius: 5px;
      cursor: pointer;
    }
  }

  div.taskItem[data-checked="true"] > div.checkbox {
    background: rgb(55, 53, 47);
  }
`;

export const ulListType = (level: number) =>
  ["disc", "circle", "square"][level % 3];

export const olListType = (level: number) =>
  ["decimal", "lower-latin", "lower-roman"][level % 3];
