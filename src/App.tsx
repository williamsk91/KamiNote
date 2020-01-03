import React from "react";
import { Switch, Route } from "react-router";

import { PageRoute } from "routes/PageRoute";
import { LoginRoute } from "routes/LoginRoute";

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/page/:id" component={PageRoute} />
      <Route path="/login" component={LoginRoute} />
    </Switch>
  );
};

export default App;
