import React from "react";

import { SaveState, SaveStatus } from "components/SaveState";

export default { title: "Page|Navbar", component: SaveState };

export const base = () => <SaveState saveStatus={SaveStatus.Saved} />;
