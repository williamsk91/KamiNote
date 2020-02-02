import "antd/dist/antd.css";
import "prosemirror-view/style/prosemirror.css";

import React from "react";
import { Route, Switch } from "react-router";

import { IndexRoute } from "routes/IndexRoute";
import { loginPath } from "routes/loginPath";
import { LoginRoute } from "routes/LoginRoute";
import { pagePath } from "routes/pagePath";
import { PageRoute } from "routes/PageRoute";

const App: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={IndexRoute} />
      <Route path={pagePath} component={PageRoute} />
      <Route path={loginPath} component={LoginRoute} />
    </Switch>
  );
};

export default App;
