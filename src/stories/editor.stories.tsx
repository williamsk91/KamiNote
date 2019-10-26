import React, { useState, useRef, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Editor } from "components/editor/Editor";

storiesOf("Editor", module).add("default", () => <Editor />);
