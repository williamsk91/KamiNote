import styled from "styled-components";

interface Props {
  spacing: number;
}

export const Spacer = styled.div<Props>`
  margin-top: ${p => p.spacing}px;
  display: block;
`;
