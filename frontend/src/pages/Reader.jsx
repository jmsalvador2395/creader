import { useRef, useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";

export function Reader() {

  const loc = useLocation().pathname
  const path = loc.replace(/^\/reader\/?/, "");
  const {container, file} = useParams();
  const full_path = `${container}/${file}`
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const divRef = useRef(null);
  const [visited, setVisited] = useState(new Set());

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchInfo() {
      try {
        const api_url = import.meta.env.VITE_API_URL;
        const res = await fetch(`${api_url}/api/v1/directory/list-entries?p=${encodeURIComponent(container)}&img=true`);
        if (!res.ok) throw new Error("Request failed");
        const resp = await res.json();
        setData(resp);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, [container]);

  const [currentPage, setCurrentPage] = useState(0);
  useEffect(() => {
    console.log(data);
    console.log(`looking for page: ${file}`);
    setCurrentPage(data.findIndex((item) => item.name === file));
  }, [data]);


  useEffect(() => {
    if ( data.length === 0 )
      return;
    const pageName = data[currentPage]?.name;
    if (pageName) {
      window.history.replaceState(null, '', `/reader/${encodeURIComponent(container)}/${encodeURIComponent(pageName)}`);
    }
  }, [currentPage]);
  
  const pages = data.map((item) => {

    const api_url = import.meta.env.VITE_API_URL;
    const fileEnc = encodeURIComponent(item.name);
    const containerEnc = encodeURIComponent(container);
    const query = `?c=${containerEnc}&img=${fileEnc}`;

    return {
        ...item,
        link: `${api_url}/media/container-image${query}`
    }
  });


  const shiftPage = (offset) => {
    const step = offset >= 0 ? 1 : -1;
    const absOffset = Math.abs(offset);

    // step through pages (stop if the intermediate page is landscape)
    let curPageTemp = currentPage;
    for (let i=0; i < absOffset; i++) {

      // detect if going beyond page limit
      if ( curPageTemp + step > pages.length || curPageTemp + step < 0) {
        break;
      }
      curPageTemp += step;
      console.log(pages.length, data.length);
      let pageInfo = pages[curPageTemp];
      if (pageInfo.w/pageInfo.h > 1.0)
        break;
    }
    setCurrentPage(curPageTemp);
  };


  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
        shiftPage(-2);
    } else if (e.key === 'ArrowLeft') {
      shiftPage(2);
    }
  };

  // left_classes = "fixed right-1/2 top-1/2 -translate-y-1/2 h-screen w-auto object-contain";
  // right_classes = "fixed left-1/2 top-1/2 -translate-y-1/2 h-screen w-auto object-contain";
  // center_classes = "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-screen w-auto object-contain";

  const getPageClass = (index) => {
    const navHeight = '4rem';
    const baseStyle = {
      position: 'fixed',
      top: navHeight,
      height: '100vh',
      width: 'auto',
      objectFit: 'contain',
      zIndex: 20,
      cursor: 'pointer',
      pointerEvents: 'auto'
    };

    const pageInfo = pages[currentPage];
    if (!pageInfo) return { visibility: 'hidden' } 
    const ratio = pageInfo.w/pageInfo.h;
    if (index === currentPage) {
      if (ratio > 1.0 || index == pages.length - 1) {
        // center page
        return { 
          ...baseStyle, 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw'
        };
      } else {
        // right page
        return { 
          ...baseStyle, 
          left: '50%',
        };
      }
    } else if (index === currentPage + 1 && ratio <= 1.0){
      const currentPageInfo = pages[currentPage];
      if (currentPageInfo.w / currentPageInfo.h > 1.0) {
        return { ...baseStyle, visibility: 'hidden' };
      } else {
        return {
          ...baseStyle,
          right: '50%',
        }
      }
    } else {
      return { ...baseStyle, visibility: 'hidden' };
    }
  };

  const setImageSource = (item, index) => {
    const nearby = Math.abs(currentPage - index) < 10;
    if (visited.has(index)) {
      return item.link;
    } else if (nearby) {
      visited.add(index);
      return item.link;
    } else {
      // console.log(`not loading page ${index}`);
      return undefined;
    }

  };

  if (loading) return (
    <>
    Loading ...
    </>
  );

  if (pages.length === 0) return (
    <>
    No Pages
    </>
  );

  return (
    <>
      <div
        className="flex justify-center items-center"
        ref={ divRef }
        tabIndex={ 0 }
        onKeyDown={ handleKeyDown }
      >
      <div className="left-pane fixed left-0 bottom-0 w-1/2 z-10 cursor-pointer" style={{ top: '4rem' }} onClick={() => shiftPage(1)}></div>
      <div className="pages fixed left-0 right-0 bottom-0 z-20" style={{ top: '4rem', pointerEvents: 'none' }}>
      { pages.map((item, index) => (
        <img
          src={ setImageSource(item, index) }
          key={ item.name }
          style={ getPageClass(index) }
          onClick={(e) => {
            const midpoint = window.innerWidth / 2;
            if (e.clientX < midpoint) shiftPage(2);
            else shiftPage(-2);
          }}
        />
      ))}
      </div>
      <div className="right-pane fixed right-0 bottom-0 w-1/2 z-10 cursor-pointer" style={{ top: '4rem' }} onClick={() => shiftPage(-1)}></div>
      </div>
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
        const res = await fetch(`${api_url}/api/v1/directory/resolve-target?p=${path}`);
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

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!data?.container || !data?.file) return;

    const container = encodeURIComponent(data.container);
    const file = encodeURIComponent(data.file);

    navigate(`/reader/${container}/${file}`, { replace: true });
  }, [data, navigate]);
  return null;
}
