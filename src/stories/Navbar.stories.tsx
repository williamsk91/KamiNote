import React from "react";

import { Navbar, SaveStatus } from "components/Navbar";

export default { title: "Page|Navbar", component: Navbar };

export const base = () => (
  <Navbar
    path={["Ideas", "Kaminote", "Front-End"]}
    saveStatus={SaveStatus.Saved}
  />
);
