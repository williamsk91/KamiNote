import React, { FC, useState } from "react";
import { Editor } from "components/editor/Editor";
import { useParams } from "react-router";
import { LoadingScreen } from "components/data/LoadingScreen";
import { ErrorScreen } from "components/data/ErrorScreen";
import { debounce } from "components/editor/utils/debounce";
import { Navbar, SaveStatus } from "components/Navbar";
import { Layout } from "antd";
import { Sidebar } from "components/Sidebar";
import {
  useGetPageQuery,
  GetPageQuery,
  useSaveContentMutation,
  useCreatePageMutation
} from "graphql/generatedGraphql";

const { Sider, Header, Content } = Layout;

export const PageRoute = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, data } = useGetPageQuery({
    variables: { id }
  });

  const [saveStatus, setSaveStatus] = useState(SaveStatus.Saved);
  const [saveContent] = useSaveContentMutation({
    onCompleted: () => {
      setSaveStatus(SaveStatus.Saved);
    },
    onError: () => {
      setSaveStatus(SaveStatus.ErrorSaving);
    }
  });
  const [createPage] = useCreatePageMutation({});

  const save = (pageId: string, content: string) => {
    saveContent({
      variables: {
        pageId,
        content
      }
    });
  };

  if (loading) return <LoadingScreen />;

  if (data?.getPage) {
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
        userPages={data.getUserPages}
        onAddPage={() => {
          createPage({
            variables: {
              path: []
            }
          });
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

  /**
   * Sidebar
   */
  userPages: GetPageQuery["getUserPages"];
  onAddPage: () => void;
}

const Page: FC<IProp> = props => {
  const { path, content, saveStatus, onChange, userPages, onAddPage } = props;

  return (
    <Layout style={{ background: "white" }}>
      <Sider>
        <Sidebar pages={userPages} onAddPage={onAddPage} />
      </Sider>
      <Layout>
        <Header>
          <Navbar path={path} saveStatus={saveStatus} />
        </Header>
        <Content>
          <Editor initState={content} onChange={onChange} />
        </Content>
      </Layout>
    </Layout>
  );
};
