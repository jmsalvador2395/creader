import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from "react-router-dom";

function Navlink(props) {
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

export default function Navbar({ routes }) {
    const {user, loading, logout} = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
      <>
       <nav
        className="w-full transition-transform duration-300 bg-white dark:bg-gray-900"
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
              {/* User Menu */}
              <div className="ml-auto relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="rounded-md bg-gray-900 p-2 text-white hover:bg-gray-800 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </button>
                {open && !user && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-lg">
                        <Link to="/login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Login</Link>
                        <Link to="/register" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Up</Link>
                    </div>
                )}
                {open && user && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-lg">
                      <button onClick={async () => {
                        await logout();
                        setOpen(false);
                        navigate("/login");
                      }}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full">
                      Logout
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      </>
    );
}
