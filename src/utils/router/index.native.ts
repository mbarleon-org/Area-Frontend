import type { ReactNode, FC } from 'react';

type WithChildren = { children?: ReactNode };

const passthrough: FC<WithChildren> = ({ children }) => (children ?? null);

export const BrowserRouter: FC<WithChildren> = passthrough;
export const Routes: FC<WithChildren> = passthrough;
export const Route: FC<{ element?: ReactNode }> = ({ element }) => (element ?? null);
export const Link: FC<WithChildren> = passthrough;
export const NavLink: FC<WithChildren> = passthrough;
export const useNavigate = () => () => {};
export const useInRouterContext = () => false;
