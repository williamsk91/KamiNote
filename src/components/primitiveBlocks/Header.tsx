import React, { useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";

export enum HeaderType {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3"
}

interface IData {
  headerType: HeaderType;
  text: string;
}

export interface IHeader {
  data: IData;

  // onChange callback with the new data
  onChange: (newData: IData) => void;
}

export const Header: React.FC<IHeader> = props => {
  const { data, onChange } = props;
  const { headerType, text } = data;

  let fontSize;
  switch (headerType) {
    case HeaderType.H1: {
      fontSize = "32px";
      break;
    }
    case HeaderType.H2: {
      fontSize = "27px";
      break;
    }
    case HeaderType.H3: {
      fontSize = "22px";
      break;
    }
  }

  return (
    <ContentEditable
      style={{
        fontSize
      }}
      html={text}
      onChange={(e: React.FormEvent<HTMLDivElement>) =>
        onChange({ headerType, text: e.currentTarget.innerHTML })
      }
    />
  );
};
