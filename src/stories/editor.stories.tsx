import React from "react";
import { Editor } from "components/editor/Editor";
import { debounce } from "components/editor/utils/debounce";

export default { title: "Editor|Editor", component: Editor };

export const base = () => {
  const initState = load();

  return (
    <Editor
      initState={initState ? initState : ""}
      onChange={content => {
        saveToServer(content);
      }}
    />
  );
};

/**
 * Mocked server calls
 */
const saveToServer = debounce((content: string) => {
  save(content);
}, 1000);

const save = (state: string) => {
  window.localStorage.setItem("state", state);
};

const load = () => {
  return window.localStorage.getItem("state");
};
