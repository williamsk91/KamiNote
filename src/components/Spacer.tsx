import styled from "styled-components";

interface Props {
  spacing: number;
}

/**
 * Spacer is a utility component to give vertical spacing between components.
 */
export const Spacer = styled.div<Props>`
  margin-top: ${p => p.spacing}px;
  display: block;
`;
