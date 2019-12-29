import ApolloClient from "apollo-boost";

export const apolloClient = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_SERVER_URI
});
