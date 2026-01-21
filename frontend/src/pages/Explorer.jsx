import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import './Explorer.css'

export default function Explorer() {

  const loc = useLocation().pathname
  const path = loc.replace(/^\/explorer\/?/, "");

  const [data, setData] = useState([]);

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchFiles() {
      try {
        const api_url = import.meta.env.VITE_API_URL
        const res = await fetch(`${api_url}/api/v1/directory/browse?path=${path}`);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp.contents)
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

  return (
    <div className="mx-auto w-[90%] max-w-screen-2xl overflow-x-auto">
      <table className="w-full border border-gray-300 border-collaps">
        <thead>
          <tr>
            <th className="text-center"> Name </th>
            <th className="text-left"> Date Modified </th>
            <th className="text-left"> st_size </th>
          </tr>
        </thead>
        <tbody>
          { has_parent ? <Link to={ `/explorer/${encodeURIComponent(parent) }` }> .. </Link> : null}
          {
            data.map(({name, path, st_mtime, st_size}) => (
              <tr key={ path }>
                <td> <Link to={ `/explorer/${encodeURIComponent(path)}` }> { name } </Link> </td>
                <td> { new Date(st_mtime).toLocaleString() } </td>
                <td> { st_size } </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}
