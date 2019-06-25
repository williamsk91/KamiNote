import React, { useState, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { ListType, List } from "components/primitiveBlocks/List";

const ListStory = ({ listType }: { listType: ListType }) => {
  const [list, setList] = useState(["abc", "def"]);

  useEffect(() => {
    console.log("list effect: ", list);
  }, [list]);
  return (
    <>
      <List
        data={{
          listType,
          list
        }}
        onChange={({ list }) => {
          console.log("story list 1: ", list);
          setList(list);
        }}
      />
      <List
        data={{
          listType,
          list
        }}
        onChange={({ list }) => {
          console.log("story list 2: ", list);
          setList(list);
        }}
      />
    </>
  );
};

storiesOf("Primitive Blocks | List", module).add("Bullet", () => (
  <ListStory listType={ListType.Bullet} />
));
