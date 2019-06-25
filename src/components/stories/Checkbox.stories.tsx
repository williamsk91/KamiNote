import React, { useState, useRef, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Checkbox } from "components/primitiveBlocks/Checkbox";

const CheckboxStory = () => {
  const [text, settext] = useState(
    "The quick brown fox jumps over the lazy dog"
  );
  const [checked, setchecked] = useState(false);

  const data1 = {
    checked,
    text
  };
  const data2 = {
    checked,
    text
  };

  return (
    <>
      <Checkbox
        data={data1}
        onChange={({ checked, text }) => {
          setchecked(checked);
          settext(text);
        }}
      />
      <Checkbox
        data={data2}
        onChange={({ checked, text }) => {
          setchecked(checked);
          settext(text);
        }}
      />
    </>
  );
};

storiesOf("Primitive Blocks | Checkbox", module).add("default", () => (
  <CheckboxStory />
));
