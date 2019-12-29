import React from "react";
import { Switch, Route } from "react-router";

import { PageRoute } from "Page";

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/page/:id" component={PageRoute} />
    </Switch>
  );
};

export default App;
