import React from "react";
import { Editor } from "components/editor/Editor";
import { debounce } from "components/editor/utils/debounce";
import { EditorState } from "prosemirror-state";
import { useParams } from "react-router";

export const Page = () => {
  const { id } = useParams<{ id: string }>();

  const initState = load(id);

  return (
    <Editor
      initState={initState ? initState : undefined}
      onChange={state => {
        saveToServer(id, state);
      }}
    />
  );
};

/**
 * save locally
 */
const saveToServer = debounce((id: string, state: EditorState) => {
  save(id, JSON.stringify(state.toJSON()));
}, 1000);

const save = (id: string, state: string) => {
  window.localStorage.setItem(`kaminote-${id}`, state);
};

const load = (id: string) => {
  return window.localStorage.getItem(`kaminote-${id}`);
};
