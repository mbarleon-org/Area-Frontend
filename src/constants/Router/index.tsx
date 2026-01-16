import type { ReactNode } from "react";

import Home from "../../pages/Home";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login"
import Register from "../../pages/Register"
import PasswordReset from "../../pages/PasswordReset";
import Automations from "../../pages/Automations";
import User from "../../pages/User";
import NotFound from "../../pages/NotFound";
import AdminPanel from "../../pages/AdminPanel";
import Guard from "../../components/Guard";

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
    path: "/login",
    element: <Login />,
    label: "Login",
    navbar: true,
    security: "public",
  },
  {
    path: "/register",
    element: <Register />,
    label: "Register",
    navbar: true,
    security: "public",
  },
  {
    path: "/password_reset",
    element: <PasswordReset />,
    label: "PasswordReset",
    navbar: false,
    security: "public",
  },
  {
    path: "/automations",
    element: <Automations />,
    label: "Automations",
    navbar: true,
    security: "public",
  },
  {
    path: "/user",
    element: <User />,
    label: "User",
    navbar: true,
    security: "public",
  },
  {
    path: "/admin",
    element: (
      <Guard>
        <AdminPanel />
      </Guard>
    ),
    label: "Admin",
    navbar: false,
    security: "admin",
  },
  {
    path: "*",
    element: <NotFound />,
    label: "NotFound",
    navbar: false,
    security: "public",
  },
];

export default ROUTES;
