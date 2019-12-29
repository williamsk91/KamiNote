import React, { FC, useState } from "react";
import { Editor } from "components/editor/Editor";
import { useParams } from "react-router";
import { LoadingScreen } from "components/data/LoadingScreen";
import { ErrorScreen } from "components/data/ErrorScreen";
import { usePageQuery, usePageMutation } from "graphql/page";
import { debounce } from "components/editor/utils/debounce";
import { Navbar, SaveStatus } from "components/Navbar";

export const PageRoute = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, data } = usePageQuery(id);

  const [saveStatus, setSaveStatus] = useState(SaveStatus.Saved);
  const [saveContent] = usePageMutation({
    onCompleted: () => {
      setSaveStatus(SaveStatus.Saved);
    },
    onError: () => {
      setSaveStatus(SaveStatus.ErrorSaving);
    }
  });

  const save = (pageId: string, content: string) => {
    saveContent({
      variables: {
        pageId,
        content
      }
    });
  };

  if (loading) return <LoadingScreen />;

  if (data) {
    const { id, path, content } = data.getPage;

    return (
      <Page
        path={path}
        saveStatus={saveStatus}
        content={content}
        onChange={newContent => {
          setSaveStatus(SaveStatus.Saving);
          saveToServer(save, id, newContent);
        }}
      />
    );
  }

  return <ErrorScreen />;
};

/**
 * debounce saves
 */
const saveToServer = debounce(
  (
    save: (pageId: string, content: string) => void,
    id: string,
    content: string
  ) => {
    save(id, content);
  },
  1000
);

interface IProp {
  path: string[];
  saveStatus: SaveStatus;
  content: string;
  onChange: (content: string) => void;
}

const Page: FC<IProp> = props => {
  const { path, content, saveStatus, onChange } = props;

  return (
    <>
      <Navbar path={path} saveStatus={saveStatus} />
      <Editor initState={content} onChange={onChange} />
    </>
  );
};
