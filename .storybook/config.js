import React from "react";
import { configure, addDecorator } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import { theme } from "../src/components/styles/theme";

// automatically import all files ending in *.stories.tsx
const req = require.context("../src", true, /.stories.tsx?$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

// add theme and padding
addDecorator((storyFn, opts) => {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: "18px" }}>{storyFn()}</div>
    </ThemeProvider>
  );
});

configure(loadStories, module);
