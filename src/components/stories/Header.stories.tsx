import React, { useState, useRef, useEffect } from "react";
import { storiesOf } from "@storybook/react";
import { Header, HeaderType } from "components/primitiveBlocks/Header";

const HeaderStory = () => {
  const [text, settext] = useState(
    "The quick brown fox jumps over the lazy dog"
  );

  const data1 = {
    headerType: HeaderType.H1,
    text
  };
  const data2 = {
    headerType: HeaderType.H2,
    text
  };
  const data3 = {
    headerType: HeaderType.H3,
    text
  };

  return (
    <>
      <Header
        data={data1}
        onChange={({ text }) => {
          settext(text);
        }}
      />
      <Header
        data={data2}
        onChange={({ text }) => {
          settext(text);
        }}
      />
      <Header
        data={data3}
        onChange={({ text }) => {
          settext(text);
        }}
      />
    </>
  );
};

storiesOf("Primitive Blocks | Header", module).add("default", () => (
  <HeaderStory />
));
