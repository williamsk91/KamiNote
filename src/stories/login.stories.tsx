import React from "react";

import { Login } from "routes/LoginRoute";

export default { title: "Login", component: Login };

export const login = () => <Login useGoogle={() => null} />;
