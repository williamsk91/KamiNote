import React from "react";
import { Editor } from "components/editor/Editor";
import { debounce } from "components/editor/utils/debounce";
import { EditorState } from "prosemirror-state";

export default { title: "Editor|Editor", component: Editor };

export const base = () => {
  const initState = load();

  return (
    <Editor
      initState={initState ? initState : ""}
      onChange={state => {
        saveToServer(state);
      }}
    />
  );
};

/**
 * Mocked server calls
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
