import "antd/dist/antd.css";

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { addDecorator, configure } from "@storybook/react";
import { addParameters } from "@storybook/react";
import { ThemeProvider } from "styled-components";

import { theme } from "../src/components/styles/theme";

addParameters({
  options: {
    showAddonPanel: false
  }
});
// add theme and padding
addDecorator((storyFn, opts) => (
  <ThemeProvider theme={theme}>
    <Router>
      <div style={{ padding: "18px" }}>{storyFn()}</div>
    </Router>
  </ThemeProvider>
));

configure(require.context("../src", true, /.stories.tsx?$/), module);
