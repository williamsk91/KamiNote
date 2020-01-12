import styled from "styled-components";

import { colors } from "components/styles/colors";

export const IconButton = styled.button<{ active?: boolean }>`
  width: 24px;
  height: 24px;

  padding: 3px;
  box-sizing: border-box;

  border: none;
  border-radius: 6px;

  background: ${p => (p.active ? colors.clouds : "none")};
  outline: none;

  :hover {
    background: ${colors.clouds};
    cursor: pointer;
  }

  :active {
    opacity: 0.5;
    transition: 0.1s;
  }

  transition: 0.3s;
`;
