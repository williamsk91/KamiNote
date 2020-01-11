import React from "react";

import { SaveStatus, SaveState } from "components/SaveState";

export default { title: "Page|Navbar", component: SaveState };

export const base = () => <SaveState saveStatus={SaveStatus.Saved} />;
