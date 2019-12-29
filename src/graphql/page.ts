import { loader } from "graphql.macro";
import { useQuery, useMutation } from "@apollo/react-hooks";

// ------------------------- query -------------------------
const GET_PAGE = loader("./fixtures/page-query.graphql");

interface IPage {
  id: string;
  title: string;
  path: string[];
  content: string;
}

interface getPageData {
  getPage: IPage;
}

// ------------------------- mutation -------------------------
const SAVE_CONTENT = loader("./fixtures/page-mutation.graphql");

interface SaveContentVariables {
  pageId: string;
  content: string;
}

// ------------------------- hooks -------------------------
export const usePageQuery = (id: string) =>
  useQuery<getPageData>(GET_PAGE, { variables: { id } });

export const usePageMutation = () =>
  useMutation<any, SaveContentVariables>(SAVE_CONTENT);
