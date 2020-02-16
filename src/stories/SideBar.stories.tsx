import React from "react";

import { Sidebar } from "components/Sidebar";

export default { title: "Page|Sidebar", component: Sidebar };

export const sidebar = () => (
  <Sidebar
    pages={[
      { title: "page 1", id: "id 1" },
      { title: "page 2", id: "id 2" },
      { title: "page 3", id: "id 3" }
    ]}
    onAddPage={() => null}
    onDeletePage={() => null}
    closeSidebar={() => null}
  />
);
