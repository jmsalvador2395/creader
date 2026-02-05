import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";

export function Reader() {
  const loc = useLocation().pathname
  const path = loc.replace(/^\/reader\/?/, "");

  const {container, file} = useParams();
  const full_path = encodeURIComponent(
    `${decodeURIComponent(container)}/${decodeURIComponent(file)}`
  );

  const [data, setData] = useState([]);

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchInfo() {
      try {
        const api_url = import.meta.env.VITE_API_URL;
        const res = await fetch(`${api_url}/api/v1/directory/list_entries?p=${container}&img=true`);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInfo();
  }, [path]);

  //console.log(data);
  //let page = data.indexof(file);
  let page = data.indexOf(file);
  
  const api_url = import.meta.env.VITE_API_URL;
  const img_url = `${api_url}/media/container-image?c=${encodeURIComponent(container)}&img=${encodeURIComponent(file)}`;

  return (
    <>
      <h1> Reader </h1>
      <img src={ img_url }/>
    </>
  )
}

export function ReaderRedirect() {

  const loc = useLocation().pathname
  const path = loc.replace(/^\/reader\/?/, "");

  const [data, setData] = useState({});

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchInfo() {
      try {
        const api_url = import.meta.env.VITE_API_URL
        const res = await fetch(`${api_url}/api/v1/directory/resolve_target?p=${path}`);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInfo();
  }, [path]);

  const container = encodeURIComponent(data.container);
  const file = encodeURIComponent(data.file);

  console.log(data);

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!data?.container || !data?.file) return;

    const container = encodeURIComponent(data.container);
    const file = encodeURIComponent(data.file);

    navigate(`/reader/${container}/${file}`, { replace: true });
  }, [data, navigate]);
  return null;
}
