import type { ReactNode } from "react";

/** @brief PAGES */
import Home from "../../pages/Home";

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
];

export default ROUTES;
