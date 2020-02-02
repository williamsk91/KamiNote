import React from "react";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";

import { ErrorScreen } from "components/data/ErrorScreen";
import { LoadingScreen } from "components/data/LoadingScreen";
import { useGetUserPagesQuery } from "graphql/generatedGraphql";

import { loginPath } from "./loginPath";
import { pageUrl } from "./pagePath";

export const IndexRoute = () => {
  const history = useHistory();

  const { loading, data } = useGetUserPagesQuery();

  // check if user is signed in
  const JWTRefereshToken = Cookies.get("refresh-token");
  if (!JWTRefereshToken) history.push(loginPath);

  if (loading) return <LoadingScreen />;

  if (data) {
    history.push(pageUrl(data.getUserPages[0].id));
  }

  return <ErrorScreen />;
};
