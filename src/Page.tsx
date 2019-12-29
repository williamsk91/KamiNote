import React from "react";
import { Editor } from "components/editor/Editor";
import { useParams } from "react-router";
import { LoadingScreen } from "components/data/LoadingScreen";
import { ErrorScreen } from "components/data/ErrorScreen";
import { usePageQuery, usePageMutation } from "graphql/page";
import { debounce } from "components/editor/utils/debounce";

export const Page = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, data } = usePageQuery(id);
  const [saveContent] = usePageMutation();

  const save = (pageId: string, content: string) =>
    saveContent({
      variables: {
        pageId,
        content
      }
    });
  if (loading) return <LoadingScreen />;

  if (data) {
    const { id, content } = data.getPage;

    return (
      <Editor
        initState={content}
        onChange={content => {
          saveToServer(save, id, content);
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
