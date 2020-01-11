import "antd/dist/antd.css";

import React from "react";
import { Route, Switch } from "react-router";

import { LoginRoute } from "routes/LoginRoute";
import { PageRoute } from "routes/PageRoute";

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/page/:id" component={PageRoute} />
      <Route path="/login" component={LoginRoute} />
    </Switch>
  );
};

export default App;
