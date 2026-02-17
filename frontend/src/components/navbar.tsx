import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { AppRoute } from '../routes/routes'

type NavlinkProps = {
  title: string;
  link: string;
};
function Navlink(props: NavlinkProps) {

  const base = props.link.replace(/^\/([^/]+).*$/, "/$1");
  return (
    <>
      {/* <a href={ props.link } className="text-gray-600 hover:text-gray-900 transition"> */}
      <Link to={ base }>
        { props.title}
      </Link>
      {/* </a> */}
    </>
  )
}

export default function Navbar({ routes }: AppRoute[]) {

    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY > 0) setVisible(false);
        else if (e.deltaY < 0) setVisible(true);
      };
      window.addEventListener('wheel', onWheel);
      return () => window.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <>
       <nav
        className="w-full fixed top-0 z-50 transition-transform duration-300 bg-white dark:bg-gray-900"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
       >
        <div className="mx-auto px-8">
          <div className="flex h-16 items-center justify-start">

            {/* <!-- Logo --> */}
            <div className="flex-shrink-0 md:flex mr-8 ml-8">
              <a href="#" className="text-xl font-bold text-gray-900">
              CReader
              </a>
            </div>

            {/* <!-- Desktop links --> */}
            <div className="hidden md:flex items-center space-x-8 w-full">
              { routes
                  .filter(({showInNav}) => showInNav)
                  .map(({title, path}) => (
                    <Navlink 
                      key={ path }
                      title={ title} 
                      link={ path } 
                    />)) 
              }
              <a
                href="#"
                className="ml-auto rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </nav>
      </>
    );
}
