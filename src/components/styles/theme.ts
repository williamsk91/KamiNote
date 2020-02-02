import { colors } from "./colors";

export interface ITheme {
  name: Theme;
  text: {
    main: string;
    accent: string;
    disabled: string;
  };
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
  text: {
    main: "rgb(55, 53, 47)",
    accent: colors.turqoise,
    disabled: "#aaa"
  },
  background: {
    primary: colors.silver,
    secondary: colors.beige,
    action: colors.clouds
  }
};

export const theme = lightTheme;
