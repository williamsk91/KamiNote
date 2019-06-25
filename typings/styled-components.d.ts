import "styled-components";
import { ITheme } from "../src/components/styles/theme";

declare module "styled-components" {
  export interface DefaultTheme extends ITheme {}
}
