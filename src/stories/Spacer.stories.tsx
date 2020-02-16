import React from "react";

import { Spacer } from "components/Spacer";

export default { title: "Spacer", component: Spacer };

export const base = () => (
  <div>
    <div>Spacer is used to</div>
    <Spacer spacing={36} />
    <div>vertically Spaced component</div>
  </div>
);
