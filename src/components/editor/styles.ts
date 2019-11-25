import { css } from "styled-components";
import { colors } from "components/styles/colors";

export const editorStyles = css`
  p {
    padding: 3px;
    margin: 0;
  }

  pre {
    background-color: ${colors.clouds};
  }

  code {
    padding: 0 3px;
    border-radius: 3px;

    color: red;
    background-color: ${colors.clouds};
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
