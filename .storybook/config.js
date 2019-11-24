import React from "react";
import { configure, addDecorator } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import { theme } from "../src/components/styles/theme";

// add theme and padding
addDecorator((storyFn, opts) => {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "18px" }}>{storyFn()}</div>
    </ThemeProvider>
  );
});

configure(require.context("../src", true, /.stories.tsx?$/), module);
