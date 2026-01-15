import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import './Explorer.css'

export default function Explorer() {
  const loc = useLocation().pathname
  const path = loc.replace(/^\/explorer\/?/, "");
  //const loc = useLocation().pathname
  //const rest = pathname.replace(/^\/folder\/?/, "");

  console.log(`loc: ${loc}, path: ${path}`)

  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const api_url = import.meta.env.VITE_API_URL
        const res = await fetch(`${api_url}/api/v1/directory/browse/${path}`);
        if (!res.ok) throw new Error("Request failed");
        console.log(res);
        const resp = await res.json();
        console.log(resp);
        setData(resp.contents)
      } catch (err) {
        console.error(err);
      }
    }
    fetchFiles();
  }, [path]);

  //return <pre>{JSON.stringify(data, null, 2)}</pre>;
  //JSON.stringify(data, null, 2)
  return (
    <div className="mx-auto w-[90%] max-w-screen-2xl overflow-x-auto">
        <table className="w-full border border-gray-300 border-collaps">
          <thead>
            <tr>
              {/* <th className="text-left"> Name </th> */}
              <th className="text-center"> Name </th>
              <th className="text-left"> Date Modified </th>
              <th className="text-left"> st_size </th>
            </tr>
          </thead>
          <tbody>
            {
              data.map(({name, path, st_mtime, st_size}) => (
                <tr>
                  <td> <Link to={ `/explorer/${encodeURIComponent(path)}` }> { name } </Link> </td>
                  <td> { new Date(st_mtime).toLocaleString() } </td>
                  <td> { st_size } </td>
                </tr>
              ))}
          </tbody>
        </table>
    </div>
  )

  /*
  return (
    <>
    <h1> Explorer </h1>
    </>
  )
  */
}
