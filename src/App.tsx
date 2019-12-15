import React from "react";
import { Switch, Route } from "react-router";

import { Page } from "Page";

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/page/:id" component={Page} />
    </Switch>
  );
};

export default App;
