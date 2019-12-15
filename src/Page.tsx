import React, { FC } from "react";
import { Editor } from "components/editor/Editor";
import { debounce } from "components/editor/utils/debounce";
import { EditorState } from "prosemirror-state";

interface IProp {}

export const Page: FC<IProp> = prop => {
  const initState = load();

  return (
    <Editor
      initState={initState ? initState : undefined}
      onChange={state => {
        saveToServer(state);
      }}
    />
  );
};

/**
 * save locally
 */
const saveToServer = debounce((state: EditorState) => {
  save(JSON.stringify(state.toJSON()));
}, 1000);

const save = (state: string) => {
  window.localStorage.setItem("state", state);
};

const load = () => {
  return window.localStorage.getItem("state");
};
