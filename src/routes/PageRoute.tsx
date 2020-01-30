import React, { FC, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Icon, Layout } from "antd";

import { ErrorScreen } from "components/data/ErrorScreen";
import { LoadingScreen } from "components/data/LoadingScreen";
import { Editor } from "components/editor/Editor";
import { debounce } from "components/editor/utils/debounce";
import { Content, Header, Navbar, Sider } from "components/Layout";
import { PageTitleBlock } from "components/PageTitle";
import { SaveState, SaveStatus } from "components/SaveState";
import { Sidebar } from "components/Sidebar";
import { apolloClient } from "graphql/client";
import {
  GetPageDocument,
  GetPageQuery,
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPageQuery,
  useSaveContentMutation,
  useSavePageTitleMutation
} from "graphql/generatedGraphql";

import { pageUrl } from "./pagePath";

export const PageRoute = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

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
      },
      update: (cache, _) => {
        const data: GetPageQuery | null = cache.readQuery({
          query: GetPageDocument,
          variables: { id: pageId }
        });
        if (data?.getPage) {
          data.getPage.content = content;
          cache.writeQuery({
            query: GetPageDocument,
            variables: { id: pageId },
            data
          });
        }
      }
    });
  }, 1000);

  const [createPage] = useCreatePageMutation({
    onCompleted: data => {
      history.push(pageUrl(data.createPage.id));
    }
  });
  const [deletePage] = useDeletePageMutation();

  if (loading) return <LoadingScreen />;

  if (data?.getPage) {
    const { id, path, title, content } = data.getPage;

    return (
      <Page
        id={id}
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
        onDeletePage={pageId => {
          deletePage({
            variables: { pageId },
            update: (cache, _) => {
              const data: GetPageQuery | null = cache.readQuery({
                query: GetPageDocument,
                variables: { id: pageId }
              });
              if (!data?.getUserPages) return;

              const removeIndex = data.getUserPages.findIndex(
                ({ id }) => id === pageId
              );
              data.getUserPages.splice(removeIndex, 1);
              cache.writeQuery({
                query: GetPageDocument,
                variables: { id: pageId },
                data
              });
            }
          });

          /**
           * Create an empty page if there are no pages left.
           *
           * note: length is 1 as `deletePage` optimistic response has not updated the
           * cache yet
           */
          if (data.getUserPages.length === 1) {
            createPage({
              variables: {
                path: []
              }
            });
            return;
          }

          /**
           * routing after deletion
           *    if deleted page is not current page, do nothing
           *    if deleted page is current page, route to previous
           *        page
           */
          if (pageId !== id) {
            return;
          } else {
            const removeIndex = data.getUserPages.findIndex(
              ({ id }) => id === pageId
            );
            const nextPageIndex = removeIndex === 0 ? 1 : removeIndex - 1;
            const nextPageId = data.getUserPages[nextPageIndex].id;
            history.push(pageUrl(nextPageId));
          }
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

interface IProp {
  id: string;
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
  onDeletePage: (pageId: string) => void;
}

const Page: FC<IProp> = props => {
  const {
    id,
    title,
    onTitleChange,
    content,
    saveStatus,
    onChange,
    userPages,
    onAddPage,
    onDeletePage
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
        <Sidebar
          pages={userPages}
          onAddPage={onAddPage}
          onDeletePage={onDeletePage}
        />
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
          <Editor key={id} initState={content} onChange={onChange} />
        </Content>
      </Layout>
    </Layout>
  );
};
