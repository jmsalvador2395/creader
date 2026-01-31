import Home from "../pages/Home";
import Explorer from "../pages/Explorer";
import Favorites from "../pages/Favorites";
import { Reader, ReaderRedirect } from "../pages/Reader";


export type AppRoute = {
  path: string;
  label: string;
  element: JSX.Element;
  showInNav?: boolean;
};

export const routes: AppRoute[] = [
  {
    path: "/",
    title: "Home",
    label: "home",
    element: <Home />,
    showInNav: true,
  },
  {
    path: "/explorer/*",
    title: "Explorer",
    label: "explorer",
    element: <Explorer />,
    showInNav: true,
  },
  {
    path: "/favorites",
    title: "Favorites",
    label: "favorites",
    element: <Favorites />,
    showInNav: true,
  },
  {
    path: "/reader/:path",
    title: "ReaderRedirect",
    label: "readerRedirect",
    element: <ReaderRedirect />,
    showInNav: false,
  },
  {
    path: "/reader/:container/:file",
    title: "Reader",
    label: "reader",
    element: <Reader />,
    showInNav: false, // not shown in navbar
  },
];
