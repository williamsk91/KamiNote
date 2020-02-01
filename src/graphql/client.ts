import ApolloClient from "apollo-boost";

const errorMessages = {
  notSignedIn: "user is not signed in"
};

export const apolloClient = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_SERVER_URI,
  credentials: "include",
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        if (message === errorMessages.notSignedIn) {
          window.location.href = `/login`;
        }
      });
    }

    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
});
