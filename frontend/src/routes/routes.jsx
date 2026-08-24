import Home from "../pages/Home";
import Explorer from "../pages/Explorer";
import Favorites from "../pages/Favorites";
import { Reader, ReaderRedirect } from "../pages/Reader";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Gallery from "../pages/Gallery";

export const routes = [
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
  {
    path: "/login",
    title: "Login",
    label: "login",
    element: <Login/>,
    showInNav: false, // not shown in navbar
  },
  {
    path: "/register",
    title: "Register",
    label: "register",
    element: <Register/>,
    showInNav: false, // not shown in navbar
  },
  {
    path: "/gallery/:container",
    title: "Gallery",
    label: "gallery",
    element: <Gallery/>,
    showInNav: false, // not shown in navbar
  },
];
