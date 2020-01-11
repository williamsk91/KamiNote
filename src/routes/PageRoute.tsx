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
  useSavePageTitleMutation,
  GetPageDocument
} from "graphql/generatedGraphql";
import { Layout, Icon } from "antd";
import { Sider, Header, Content, Navbar } from "components/Layout";
import { PageTitleBlock } from "components/PageTitle";
import { apolloClient } from "graphql/client";

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

    updatePageContentCache(pageId, content);
  }, 1000);

  const [createPage] = useCreatePageMutation({});

  if (loading) return <LoadingScreen />;

  if (data?.getPage) {
    const { id, path, title, content } = data.getPage;

    return (
      <Page
        title={title}
        onTitleChange={newTitle => {
          saveTitle(id, newTitle);
          updateSidebarTitleCache(id, newTitle);
        }}
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

/**
 * Updates Sidebar page title when title is updated.
 *
 * This is done using Apollo cache operations
 */
const updateSidebarTitleCache = (pageId: string, title: string) => {
  const cache = apolloClient.readQuery({
    query: GetPageDocument,
    variables: { id: pageId }
  });

  const pageTitleIndex = (cache.getUserPages as GetPageQuery["getUserPages"]).findIndex(
    pageTitle => pageTitle.id === pageId
  );
  cache.getUserPages[pageTitleIndex].title = title;
  apolloClient.writeQuery({
    query: GetPageDocument,
    variables: { id: pageId },
    data: cache
  });
};

/**
 * Updates page content cache when saving to server
 */
const updatePageContentCache = (pageId: string, content: string) => {
  const cache = apolloClient.readQuery({
    query: GetPageDocument,
    variables: { id: pageId }
  });

  cache.getPage.content = content;
  apolloClient.writeQuery({
    query: GetPageDocument,
    variables: { id: pageId },
    data: cache
  });
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
          <PageTitleBlock title={title} onChange={onTitleChange} />
          <Editor initState={content} onChange={onChange} />
        </Content>
      </Layout>
    </Layout>
  );
};
