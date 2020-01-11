import { gql } from 'graphql.macro';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Mutation = {
   __typename?: 'Mutation',
  createPage: Page,
  savePageTitle: Scalars['String'],
  saveContent: Scalars['String'],
  invalidateTokens: Scalars['Boolean'],
};


export type MutationCreatePageArgs = {
  path: Array<Scalars['String']>
};


export type MutationSavePageTitleArgs = {
  pageId: Scalars['String'],
  title: Scalars['String']
};


export type MutationSaveContentArgs = {
  pageId: Scalars['String'],
  content: Scalars['String']
};

export type Page = {
   __typename?: 'Page',
  id: Scalars['String'],
  title: Scalars['String'],
  path: Array<Scalars['String']>,
  content: Scalars['String'],
};

export type PageTitle = {
   __typename?: 'PageTitle',
  id: Scalars['String'],
  title: Scalars['String'],
};

export type Query = {
   __typename?: 'Query',
  getPage: Maybe<Page>,
  getUserPages: Array<Page>,
  me: Maybe<User>,
};


export type QueryGetPageArgs = {
  id: Scalars['String']
};

export type User = {
   __typename?: 'User',
  id: Scalars['String'],
  email: Scalars['String'],
  displayName: Maybe<Scalars['String']>,
};

export type CreatePageMutationVariables = {
  path: Array<Scalars['String']>
};


export type CreatePageMutation = (
  { __typename?: 'Mutation' }
  & { createPage: (
    { __typename?: 'Page' }
    & Pick<Page, 'id' | 'title' | 'path' | 'content'>
  ) }
);

export type GetPageQueryVariables = {
  id: Scalars['String']
};


export type GetPageQuery = (
  { __typename?: 'Query' }
  & { getPage: Maybe<(
    { __typename?: 'Page' }
    & Pick<Page, 'id' | 'title' | 'path' | 'content'>
  )>, getUserPages: Array<(
    { __typename?: 'Page' }
    & Pick<Page, 'id' | 'title'>
  )> }
);

export type SaveContentMutationVariables = {
  pageId: Scalars['String'],
  content: Scalars['String']
};


export type SaveContentMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'saveContent'>
);

export type SavePageTitleMutationVariables = {
  pageId: Scalars['String'],
  title: Scalars['String']
};


export type SavePageTitleMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'savePageTitle'>
);


export const CreatePageDocument = gql`
    mutation createPage($path: [String!]!) {
  createPage(path: $path) {
    id
    title
    path
    content
  }
}
    `;
export type CreatePageMutationFn = ApolloReactCommon.MutationFunction<CreatePageMutation, CreatePageMutationVariables>;

/**
 * __useCreatePageMutation__
 *
 * To run a mutation, you first call `useCreatePageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPageMutation, { data, loading, error }] = useCreatePageMutation({
 *   variables: {
 *      path: // value for 'path'
 *   },
 * });
 */
export function useCreatePageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreatePageMutation, CreatePageMutationVariables>) {
        return ApolloReactHooks.useMutation<CreatePageMutation, CreatePageMutationVariables>(CreatePageDocument, baseOptions);
      }
export type CreatePageMutationHookResult = ReturnType<typeof useCreatePageMutation>;
export type CreatePageMutationResult = ApolloReactCommon.MutationResult<CreatePageMutation>;
export type CreatePageMutationOptions = ApolloReactCommon.BaseMutationOptions<CreatePageMutation, CreatePageMutationVariables>;
export const GetPageDocument = gql`
    query GetPage($id: String!) {
  getPage(id: $id) {
    id
    title
    path
    content
  }
  getUserPages {
    id
    title
  }
}
    `;

/**
 * __useGetPageQuery__
 *
 * To run a query within a React component, call `useGetPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPageQuery` returns an object from Apollo Client that contains loading, error, and data properties 
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPageQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPageQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
        return ApolloReactHooks.useQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
      }
export function useGetPageLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPageQuery, GetPageQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<GetPageQuery, GetPageQueryVariables>(GetPageDocument, baseOptions);
        }
export type GetPageQueryHookResult = ReturnType<typeof useGetPageQuery>;
export type GetPageLazyQueryHookResult = ReturnType<typeof useGetPageLazyQuery>;
export type GetPageQueryResult = ApolloReactCommon.QueryResult<GetPageQuery, GetPageQueryVariables>;
export const SaveContentDocument = gql`
    mutation SaveContent($pageId: String!, $content: String!) {
  saveContent(pageId: $pageId, content: $content)
}
    `;
export type SaveContentMutationFn = ApolloReactCommon.MutationFunction<SaveContentMutation, SaveContentMutationVariables>;

/**
 * __useSaveContentMutation__
 *
 * To run a mutation, you first call `useSaveContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveContentMutation, { data, loading, error }] = useSaveContentMutation({
 *   variables: {
 *      pageId: // value for 'pageId'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useSaveContentMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveContentMutation, SaveContentMutationVariables>) {
        return ApolloReactHooks.useMutation<SaveContentMutation, SaveContentMutationVariables>(SaveContentDocument, baseOptions);
      }
export type SaveContentMutationHookResult = ReturnType<typeof useSaveContentMutation>;
export type SaveContentMutationResult = ApolloReactCommon.MutationResult<SaveContentMutation>;
export type SaveContentMutationOptions = ApolloReactCommon.BaseMutationOptions<SaveContentMutation, SaveContentMutationVariables>;
export const SavePageTitleDocument = gql`
    mutation SavePageTitle($pageId: String!, $title: String!) {
  savePageTitle(pageId: $pageId, title: $title)
}
    `;
export type SavePageTitleMutationFn = ApolloReactCommon.MutationFunction<SavePageTitleMutation, SavePageTitleMutationVariables>;

/**
 * __useSavePageTitleMutation__
 *
 * To run a mutation, you first call `useSavePageTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSavePageTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [savePageTitleMutation, { data, loading, error }] = useSavePageTitleMutation({
 *   variables: {
 *      pageId: // value for 'pageId'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useSavePageTitleMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SavePageTitleMutation, SavePageTitleMutationVariables>) {
        return ApolloReactHooks.useMutation<SavePageTitleMutation, SavePageTitleMutationVariables>(SavePageTitleDocument, baseOptions);
      }
export type SavePageTitleMutationHookResult = ReturnType<typeof useSavePageTitleMutation>;
export type SavePageTitleMutationResult = ApolloReactCommon.MutationResult<SavePageTitleMutation>;
export type SavePageTitleMutationOptions = ApolloReactCommon.BaseMutationOptions<SavePageTitleMutation, SavePageTitleMutationVariables>;