import React from "react";
import { configure, addDecorator } from "@storybook/react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router } from "react-router-dom";
import "antd/dist/antd.css";

import { theme } from "../src/components/styles/theme";
import { addParameters } from "@storybook/react";

addParameters({
  options: {
    showAddonPanel: false,
    showStoriesPanel: false
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
