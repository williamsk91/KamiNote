import React from "react";
import { storiesOf } from "@storybook/react";
import { IoIosAdd } from "react-icons/io";

import { IconButton } from "../shared/IconButton";

storiesOf("Primitive Blocks | Icon Button", module).add("Plus button", () => (
  <IconButton>
    <IoIosAdd />
  </IconButton>
));
