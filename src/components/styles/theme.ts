import { colors } from "./colors";

export interface ITheme {
  name: Theme;
  accent: string;
  background: {
    primary: string;
    secondary: string;
    action: string;
  };
}

export enum Theme {
  light
}

/** light theme is also the dafault theme */
const lightTheme: ITheme = {
  name: Theme.light,
  accent: colors.turqoise,
  background: {
    primary: colors.silver,
    secondary: colors.beige,
    action: colors.clouds
  }
};

export const theme = lightTheme;
