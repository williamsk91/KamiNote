import styled from "styled-components";

import { colors } from "components/styles/colors";

export const IconButton = styled.button<{ active?: boolean }>`
  width: 24px;
  height: 24px;

  padding: 6px;
  margin: 3px 1.5px;
  box-sizing: border-box;

  border: none;
  border-radius: 6px;

  background: ${p => (p.active ? colors.clouds : "none")};
  outline: none;

  :hover {
    background: ${colors.clouds};
    cursor: pointer;
  }
`;
