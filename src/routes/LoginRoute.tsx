import React from "react";

export const LoginRoute = () => {
  return (
    <a href={`${process.env.REACT_APP_GRAPHQL_SERVER_URI}/auth/google`}>
      Login with Google{" "}
    </a>
  );
};
