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
  <Router>
    <ThemeProvider theme={theme}>
      <div style={{ padding: "18px" }}>{storyFn()}</div>
    </ThemeProvider>
  </Router>
));

configure(require.context("../src", true, /.stories.tsx?$/), module);
