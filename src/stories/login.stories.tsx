import React from "react";
import { Login } from "routes/LoginRoute";

export default { title: "User|Login" };

export const login = () => <Login useGoogle={() => null} />;
