import Home from "../pages/Home";
import Explorer from "../pages/Explorer";
import Favorites from "../pages/Favorites";
import Reader from "../pages/Reader";


export type AppRoute = {
  path: string;
  label: string;
  element: JSX.Element;
  showInNav?: boolean;
};

export const routes: AppRoute[] = [
  {
    path: "/",
    label: "Home",
    element: <Home />,
    showInNav: true,
  },
  {
    path: "/explorer",
    label: "Explorer",
    element: <Explorer />,
    showInNav: true,
  },
  {
    path: "/favorites",
    label: "Favorites",
    element: <Favorites />,
    showInNav: true,
  },
  {
    path: "/reader",
    label: "Reader",
    element: <Reader />,
    showInNav: false, // not shown in navbar
  },
];
