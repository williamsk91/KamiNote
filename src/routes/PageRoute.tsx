import React, { FC, useState } from "react";
import { Editor } from "components/editor/Editor";
import { useParams } from "react-router";
import { LoadingScreen } from "components/data/LoadingScreen";
import { ErrorScreen } from "components/data/ErrorScreen";
import { debounce } from "components/editor/utils/debounce";
import { SaveStatus, SaveState } from "components/SaveState";
import { Sidebar } from "components/Sidebar";
import {
  useGetPageQuery,
  GetPageQuery,
  useSaveContentMutation,
  useCreatePageMutation,
  useSavePageTitleMutation
} from "graphql/generatedGraphql";
import { Layout, Icon } from "antd";
import { Sider, Header, Content, Navbar } from "components/Layout";
import { PageTitle } from "components/PageTitle";

export const PageRoute = () => {
  const { id } = useParams<{ id: string }>();
  const { loading, data } = useGetPageQuery({
    variables: { id }
  });

  const [saveStatus, setSaveStatus] = useState(SaveStatus.Saved);

  const [savePageTitle] = useSavePageTitleMutation({});
  const saveTitle = debounce((pageId: string, title: string) => {
    savePageTitle({
      variables: {
        pageId,
        title
      }
    });
  }, 1000);

  const [saveContent] = useSaveContentMutation({
    onCompleted: () => {
      setSaveStatus(SaveStatus.Saved);
    },
    onError: () => {
      setSaveStatus(SaveStatus.ErrorSaving);
    }
  });

  const save = debounce((pageId: string, content: string) => {
    saveContent({
      variables: {
        pageId,
        content
      }
    });
  }, 1000);

  const [createPage] = useCreatePageMutation({});

  if (loading) return <LoadingScreen />;

  if (data?.getPage) {
    const { id, path, title, content } = data.getPage;

    return (
      <Page
        title={title}
        onTitleChange={newTitle => saveTitle(id, newTitle)}
        path={path}
        saveStatus={saveStatus}
        content={content}
        onChange={newContent => {
          setSaveStatus(SaveStatus.Saving);
          save(id, newContent);
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

interface IProp {
  title: string;
  onTitleChange: (title: string) => void;

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
  const {
    title,
    onTitleChange,
    content,
    saveStatus,
    onChange,
    userPages,
    onAddPage
  } = props;

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Sider
        collapsible
        trigger={null}
        collapsedWidth={0}
        collapsed={collapsed}
      >
        <Sidebar pages={userPages} onAddPage={onAddPage} />
      </Sider>
      <Layout>
        <Header>
          <Navbar>
            <Icon
              type={collapsed ? "menu-unfold" : "menu-fold"}
              onClick={() => setCollapsed(!collapsed)}
            />
            <SaveState saveStatus={saveStatus} />
          </Navbar>
        </Header>
        <Content>
          <PageTitle title={title} onChange={onTitleChange} />
          <Editor initState={content} onChange={onChange} />
        </Content>
      </Layout>
    </Layout>
  );
};
