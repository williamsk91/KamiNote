import React, { useState } from "react";

import { PageTitleBlock } from "components/PageTitle";

export default { title: "Editor|PageTitle", component: PageTitleBlock };

const BaseStory = () => {
  const [title, setTitle] = useState("title");

  return (
    <PageTitleBlock title={title} onChange={newTitle => setTitle(newTitle)} />
  );
};

export const base = () => <BaseStory />;
