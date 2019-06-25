import React from "react";
import ContentEditable from "react-contenteditable";

export enum ListType {
  Bullet = "bullet",
  Number = "number"
}

interface IData {
  listType: ListType;
  list: string[];
}

export interface IList {
  data: IData;
  onChange: (newData: IData) => void;
}

export const List: React.FC<IList> = props => {
  const { data, onChange } = props;
  const { listType, list } = data;

  const listElements = list.map((text, i) => (
    <li key={i}>
      <ContentEditable
        html={text}
        onChange={(e: React.FormEvent<HTMLDivElement>) => {
          const newList = [...list];
          newList[i] = e.currentTarget.innerHTML;
          onChange({ listType, list: newList });
        }}
      />
    </li>
  ));

  return <ul>{listElements}</ul>;
};
