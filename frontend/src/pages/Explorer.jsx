import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import './Explorer.css'


function convertToReadableSize(size, is_file) {
  if (size < 1_024)
    return `${size} B`;

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

export default function Explorer() {

  const loc = useLocation().pathname
  const path = loc.replace(/^\/explorer\/?/, "");

  const [data, setData] = useState([]);

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchFiles() {
      try {
        const api_url = import.meta.env.VITE_API_URL
        let res;
        if (path === "") {
            res = await fetch(`${api_url}/api/v1/directory/browse`);
        } else {
            res = await fetch(`${api_url}/api/v1/directory/browse?path=${path}`);
        }
        console.log(res);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp.contents);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFiles();
  }, [path]);

  // determine if the path has a parent to include '..' in the directory
  let path_dec = decodeURIComponent(path);
  let has_parent = false;
  parent = null;
  if (path !== '') {
    parent = path_dec.includes("/") ? encodeURIComponent(path_dec.replace(/\/[^/]+$/, "")) : "";
    has_parent = true;
  }

  const mdata = data.map((item) => {

    const encoded_path = encodeURIComponent(item.path);

    let explorer_link;
    if (item.is_file) {
        explorer_link = `/reader/${encoded_path}`;
    } else {
        explorer_link = `/explorer/${encoded_path}`;
    }

    // convert to B, KB, MB or GB
    const display_size = convertToReadableSize(
      item.st_size, 
      item.is_file
    );

    return {
      ...item,
      encoded_path: encoded_path,
      explorer_link: explorer_link,
      reader_link: `/reader/${encoded_path}`,
      display_size: display_size
    }
  })

  return (
    <div className="mx-auto w-[90%] max-w-screen-2xl overflow-x-auto">
      <table className="w-full border border-gray-300 border-collaps">
        <thead>
          <tr>
            <th className="text-center"> Name </th>
            <th className="text-left"> Date Modified </th>
            <th className="text-left"> Size </th>
            <th className="text-center"> Actions </th>
          </tr>
        </thead>
        <tbody>
          { has_parent ? <tr key=".."><td><Link to={ `/explorer/${encodeURIComponent(parent) }` } > .. </Link></td></tr> : null}
          {
            mdata.map(({name, path, st_mtime, display_size, explorer_link, reader_link, encoded_path}) => (
              <tr key={ path }>
                <td><Link to={ explorer_link }>{ name }</Link></td>
                <td>{ new Date(st_mtime).toLocaleString() }</td>
                <td>{ display_size }</td>
                <td className="flex justify-center"> 
                  <Link to={ reader_link }>
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
                  </Link>
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

                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}
