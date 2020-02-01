import React from "react";
import { AiOutlineRocket } from "react-icons/ai";

import { IconButton } from "components/IconButton";

export default { title: "IconButton", component: IconButton };

export const base = () => (
  <IconButton>
    <AiOutlineRocket />
  </IconButton>
);
