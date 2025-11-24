import type { ReactNode } from "react";

import Home from "../../pages/Home";
import Dashboard from "../../pages/Dashboard";
import Apps from "../../pages/Apps";
import Explore from "../../pages/Explore";
import Login from "../../pages/Login"
import Automations from "../../pages/Automations";

interface Router {
  path: string;
  element: ReactNode;
  label: string;
  navbar: boolean;
  security: "public" | "startup" | "admin";
};

const ROUTES: Router[] = [
  {
    path: "/",
    element: <Home />,
    label: "Home",
    navbar: true,
    security: "public",
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    label: "Dashboard",
    navbar: true,
    security: "public",
  },
  {
    path: "/apps",
    element: <Apps />,
    label: "Apps",
    navbar: true,
    security: "public",
  },
  {
    path: "/explore",
    element: <Explore />,
    label: "Explore",
    navbar: true,
    security: "public",
  },
  {
    path: "/login",
    element: <Login />,
    label: "Login",
    navbar: true,
    security: "public",
  },
  {
    path: "/automations",
    element: <Automations />,
    label: "Automations",
    navbar: true,
    security: "public",
  },
];

export default ROUTES;
