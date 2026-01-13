import { useEffect, useState } from "react";

export default function Explorer() {

  const [data, setData] = useState([]);


  useEffect(() => {
    async function fetchFiles() {
      try {
        const api_url = import.meta.env.VITE_API_URL
        const res = await fetch(`${api_url}/api/v1/directory/browse`);
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
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;

  /*
  return (
    <>
    <h1> Explorer </h1>
    </>
  )
  */
}
