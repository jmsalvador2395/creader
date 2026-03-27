import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from 'react-router-dom';


import './Explorer.css'

function convertToReadableSize(size, is_file) {
  if (!is_file) return `${size}`;
  if (size < 1_024) return `${size} B`;

  const divider = 1_024;
  size /= divider; // 8 to convert from bit to byte
  if (size < 1_024)
    return `${size.toFixed(2)} KB`;
  
  size /= divider;
  if (size < 1_024)
    return `${size.toFixed(2)} MB`;

  size /= divider;
  return `${size.toFixed(2)} GB`;
}

function ExplorerHeader({path, navigate, loc}) {
  const targets = ["/", ...path.split("/").filter(Boolean)];
  const linkEntries = targets.map((item) => 
      [item, item !== "/" 
        ? encodeURIComponent(
            path.slice(0, path.indexOf(item) + item.length)
          ) 
        : ""
      ]
  );

  return (
    <> 
    <div className="w-[90%] mx-auto" style={{ display: "flex"}}>
      <h1>
      {
        linkEntries.map(([name, link], idx) => (
          <span className="px-2" key={link}>
            {idx > 1 && ' /\u200B '}
            <Link to={`/explorer/${link}`}>{ name }</Link>
          </span>
        ))
      }
      </h1>
      <span style={{ marginLeft: 'auto' }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const q = e.target.elements.search.value;
          navigate(`${loc}?search=${encodeURIComponent(q)}`);
        }}>
          <input className="border border-gray-300"
                 name="search"
                 type="text"
                 placeholder="Search...">
          </input>
        </form>
      </span>
    </div>
    </>
  )
}

function PageSelect({ page, numPages, pageSize, searchStr, loc, navigate }) {
  if (numPages < 1) return null;

  const baseLink = searchStr ? `${loc}?search=${searchStr}&` : `${loc}?`

  return (
    <div className="flex justify-center gap-2 py-4">
      <Link
        to={`${baseLink}?page=${page - 1}&size=${pageSize}`}
        className={page <= 1 ? "invisible" : ""}
      >
        &laquo; Prev
      </Link>
      <form onSubmit={(e) => {
        e.preventDefault();
        const val = Number(e.target.elements.page.value);
        if (val >= 1 && val <= numPages) {
          navigate(`${baseLink}page=${val}&size=${pageSize}`);
        }
      }}>
        <input
          name="page"
          type="number"
          min={1}
          max={numPages}
          defaultValue={page}
          key={page}
          className="w-16 text-center border border-gray-300 rounded bg-transparent"
        />
        <span> / {numPages}</span>
      </form>
      <Link
        to={`${baseLink}page=${page + 1}&size=${pageSize}`}
        className={page >= numPages ? "invisible" : ""}
      >
        Next &raquo;
      </Link>
    </div>
  );
}

export default function Explorer() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loc = useLocation().pathname
  const path = loc.replace(/^\/explorer\/?/, "");
  const [data, setData] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const page = Number(searchParams.get("page") ?? 1);
  const sizeParam = searchParams.get("size");
  const searchStr = searchParams.get("search");
  const pageSize = Number(sizeParam ?? localStorage.getItem("explorerPageSize") ?? 50);

  useEffect(() => {
    localStorage.setItem("explorerPageSize", pageSize);
  }, [pageSize]);

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchFiles() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL
        let query = (path === "")
          ? "" 
          : `?path=${path}&page=${page}&size=${pageSize}`;
        if (searchStr) {
          query = query.startsWith("?") 
            ? `${query}&search=${searchStr}`
            : `?search=${searchStr}`
        }
        const res = await fetch(`${apiUrl}/api/v1/directory/browse${query}`);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp.contents);
        setNumPages(resp.num_pages);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFiles();
  }, [path, page, pageSize, searchStr]);

  // determine if the path has a parent to include '..' in the directory
  let pathDec = decodeURIComponent(path);
  let hasParent = false;
  parent = null;
  if (path !== '') {
    parent = pathDec.includes("/") ? pathDec.replace(/\/[^/]+$/, "") : "";
    hasParent = true;
  }

  const mdata = data.map((item) => {

    const encoded_path = encodeURIComponent(item.path);

    // let explorerLink;
    const explorerLink = item.is_file 
      ? `/reader/${encoded_path}` 
      : `/explorer/${encoded_path}`;

    // convert to B, KB, MB or GB
    const displaySize = convertToReadableSize(item.st_size, item.is_file);

    return {
      ...item,
      encoded_path: encoded_path,
      explorerLink: explorerLink,
      readerLink: `/reader/${encoded_path}`,
      displaySize: displaySize
    }
  })

  return (
    <div className="mx-auto w-full max-w-screen-2xl overflow-x-auto pt-20">
      <ExplorerHeader path={pathDec} navigate={navigate} loc={loc}/>
      <PageSelect page={page} numPages={numPages} pageSize={pageSize} searchStr={searchStr} loc={loc} navigate={navigate} />
      <table className="w-[90%] mx-auto border border-gray-300 border-collapse">
        <thead>
          <tr>
            <th className="px-2 text-center">Name</th>
            <th className="px-2 text-left">Date Modified</th>
            <th className="px-2 text-left">Size</th>
            <th className="px-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          { 
            hasParent 
              ? <tr key="..">
                  <td className="pl-2">
                    <Link to={ `/explorer/${encodeURIComponent(parent) }` } > .. </Link>
                  </td>
                </tr> 
              : null
          }
          {
            mdata.map(({name, path, st_mtime, displaySize, explorerLink, readerLink, is_dir, encoded_path}) => (
              <tr key={ path } className="hover:bg-white/10">

                {/* file/folder */}
                <td className="px-2 w-full max-w-0 truncate group/name hover:overflow-visible hover:whitespace-nowrap hover:relative hover:z-10">
                  <Link className="group-hover/name:bg-[#242424] group-hover/name:pr-2" 
                        to={ explorerLink }>{ name }{is_dir ? '/' : ""}
                  </Link>
                </td>

                {/* timestamp */}
                <td className="px-2 relative z-0 overflow-hidden whitespace-nowrap w-0">{
                new Date(st_mtime*1000).toLocaleString('en-CA', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
                </td>

                {/* size */}
                <td className="px-2 relative z-0 overflow-hidden whitespace-nowrap w-0">{ displaySize }</td>

                {/* actions */}
                <td className="px-2 relative z-0 whitespace-nowrap w-0">
                  <div className="flex justify-center">
                  <a href={ readerLink } target="_blank" rel="noopener noreferrer">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="size-6"
                    >
                       <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" 
                       />
                    </svg> 
                  </a>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 
                    0 
                    24 
                    24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="size-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <PageSelect 
        page={page} 
        numPages={numPages} 
        pageSize={pageSize}
        searchStr={searchStr}
        loc={loc} 
        navigate={navigate} 
      />
    </div>
  )
}
