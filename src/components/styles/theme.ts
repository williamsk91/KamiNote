import { Color } from "./colors";

export interface ITheme {
  name: Theme;
  accent: Color;
  background: {
    lighter: Color;
    default: Color;
    darker: Color;
  };
  sidePadding: string;
}

export enum Theme {
  light
}

/** light theme is also the dafault theme */
const lightTheme: ITheme = {
  // styles
  name: Theme.light,
  accent: "turqoise",
  background: {
    lighter: "clouds",
    default: "silver",
    darker: "concrete"
  },
  // structure
  sidePadding: "84px"
};

export const theme = lightTheme;
