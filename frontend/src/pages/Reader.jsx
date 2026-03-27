import { useRef, useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";

export function Reader() {

  const apiUrl = import.meta.env.VITE_API_URL;
  const PRELOAD_DIST = 3;

  const loc = useLocation().pathname
  const path = loc.replace(/^\/reader\/?/, "");
  const {container, file} = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const divRef = useRef(null);
  const [visited, setVisited] = useState(new Set());
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [visiblePages, setVisiblePages] = useState([]);
  const [readDirection, setReadDirection] = useState("left");
  const [currentPage, setCurrentPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const containerEnc = encodeURIComponent(container);
  const containerEncEnc = encodeURIComponent(containerEnc);
  console.log(`container: ${container}, containerEnc: ${containerEnc}`);

  useEffect(() => { 
    console.log(`querying favorite status`);
    queryFavorite(); 
  }, [container]);

  // set favorited state
  async function queryFavorite() {
    try {
      const res = await fetch(
        `${apiUrl}/api/v1/library/favorite?path=${containerEnc}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Request failed");
      const resp = await res.json();
      setFavorited(resp.exists);
    } catch (err) {
      console.log(`failed to determine favorite status`);
      setFavorited(false);
    }
  }

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(`${apiUrl}/api/v1/directory/list-entries?p=${encodeURIComponent(container)}&img=true`);
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

  useEffect(() => {
    const index = data.findIndex((item) => item.name === file);
    if (index >= 0) {
      setCurrentPage(index);
      computeVisiblePages(index, false);
    }
    divRef.current?.focus();
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

    const fileEnc = encodeURIComponent(item.name);
    const containerEnc = encodeURIComponent(container);
    const query = `?c=${containerEnc}&img=${fileEnc}`;

    return {
        ...item,
        link: `${apiUrl}/media/container-image${query}`
    }
  });


  const shiftPage = (offset) => {
    const step = offset >= 0 ? 1 : -1;
    const absOffset = Math.abs(offset);
    const movingFromSingle = visiblePages.length === 1;

    let prematureExit = false;

    // step through pages (stop if the intermediate page is landscape)
    let curPageTemp = currentPage;
    for (let i=0; i < absOffset; i++) {

      // detect if going beyond page limit
      if (curPageTemp + step >= pages.length) {
        prematureExit = true;
        break;
      } else if (curPageTemp + step < 0){
        prematureExit = true;
        break;
      }

      // make step
      curPageTemp += step;

      // check if moving from single page 
      if (movingFromSingle) {
        // break if moving forward or if next step would set page <0
        if (step > 0 || curPageTemp + step < 0) {
          prematureExit = true;
          break;
        } 

        // break if going backward and the next page is landscape
        const nextPageInfo = pages[curPageTemp + step];
        if (nextPageInfo.w / nextPageInfo.h > 1.0) {
          prematureExit = true;
          break;
        }
      }

      // break if the computed page is landscape
      let pageInfo = pages[curPageTemp];
      if (pageInfo.w/pageInfo.h > 1.0) {
        prematureExit = true;
        break;
      }
    }
    if (curPageTemp !== currentPage) {
      setCurrentPage(curPageTemp);
      computeVisiblePages(curPageTemp, prematureExit);
      divRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  };
  const computeVisiblePages = (pageNum, prematureExit) => {

    if (pages.length === 0) {
      setVisiblePages([]);
      return;
    }

    // handle missing page info or no pages cases
    const pageInfo = pages[pageNum];
    if (!pageInfo) {
      setVisiblePages([]);
      return;
    }

    // check if current page is landscape or if number of pages is 1
    const isLandscape = pageInfo.w / pageInfo.h > 1.0;
    if (isLandscape || pages.length === 1) {
      setVisiblePages([pageNum]);
      return;
    }

    // check if pageNum is last page
    if (pageNum === pages.length - 1) {
      setVisiblePages([pageNum]);
      return;
    }

    // check if first page
    if (pageNum === 0) {
      // check if premature exit happened during shift
      if (prematureExit){
        setVisiblePages([pageNum]);
      } else {
        // check if next page is landscape or not
        const nextPageInfo = pages[pageNum + 1];
        const nextPageIsLandscape = nextPageInfo.w / nextPageInfo.h > 1.0;
        if (nextPageIsLandscape)
          setVisiblePages([pageNum]);
        else {
          const vp = [pageNum, pageNum + 1]
          setVisiblePages(readDirection === "left" ? vp.reverse() : vp);
        }
      }
      return;
    }

    // check if next page is landscape or not
    const nextPageInfo = pages[pageNum + 1];
    const nextPageIsLandscape = nextPageInfo.w / nextPageInfo.h > 1.0;
    if (nextPageIsLandscape) {
      setVisiblePages([pageNum]);
    } else {
      const vp = [pageNum, pageNum + 1]
      setVisiblePages(readDirection === "left" ? vp.reverse() : vp);
    }
    return;
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        shiftPage(-2);
      } else if (e.key == 'ArrowDown') {
        e.preventDefault();
        shiftPage(-1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        shiftPage(2);
      } else if (e.key == 'ArrowUp') {
        e.preventDefault();
        shiftPage(1)
      } else if (e.key === 'f' || e.key === 'Enter') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentPage, visiblePages, pages]);



  const setImageSource = (item, index) => {
    const nearby = Math.abs(currentPage - index) < PRELOAD_DIST;
    if (visited.has(index)) {
      return item.link;
    } else if (nearby) {
      visited.add(index);
      return item.link;
    } else {
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

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const toggleFavorite = async () => {
    const params = {
      credentials: "include",
      method: favorited ? "DELETE" : "POST"
    };
    await fetch(
      `${apiUrl}/api/v1/library/favorite?path=${containerEnc}`, 
      params, 
    );
    await queryFavorite()
  }

  return (
    <>
      {/* Menu backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-out menu */}
      <div
        className="fixed top-0 right-0 h-full bg-gray-900 text-white shadow-lg transition-transform duration-300 z-50"
        style={{
          width: '300px',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <button
          className="absolute top-4 right-4 text-white text-xl"
          onClick={() => setMenuOpen(false)}
        >
          &times;
        </button>
        <div className="p-6 pt-12">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
        </div>
        <div className="px-3 flex items-stretch">
          <button
            className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors w-half"
            onClick={() => toggleFavorite()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Favorite
          </button>
          <button
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors w-half"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Bookmark
          </button>
        </div>
      </div>

      <div
        className="relative flex justify-center items-center outline-none"
        ref={ divRef }
        tabIndex={ 0 }
      >
      {/* Menu toggle button */}
      <button
        className="absolute top-2 right-2 z-40 bg-gray-800 text-white px-2 py-3 rounded opacity-50 hover:opacity-100 transition-opacity"
        onClick={() => setMenuOpen(true)}
      >
        &#9776;
      </button>

      <div className="pages relative flex justify-center items-start cursor-pointer w-full" style={{ zIndex: 20, minHeight: '100vh' }}
        onClick={(e) => {
          const midpoint = window.innerWidth / 2;
          if (e.clientX < midpoint) shiftPage(1);
          else shiftPage(-1);
        }}
      >
      {/* Progress bar */}
      <div
        className="absolute left-0 top-0 h-full z-30 cursor-pointer opacity-30 transition-opacity"
        style={{
          width: '8px',
          background: `linear-gradient(to bottom, #3b82f6 ${((currentPage + 1) / pages.length) * 100}%, #9ca3af ${((currentPage + 1) / pages.length) * 100}%)`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const ratio = e.clientY / window.innerHeight;
          const targetPage = Math.floor(ratio * pages.length);
          setCurrentPage(targetPage);
          computeVisiblePages(targetPage, false);
          divRef.current?.scrollIntoView({ behavior: 'instant' });
        }}
      />
      { visiblePages.map((index) => (
        <img
          src={ setImageSource(pages[index], index) }
          key={ pages[index].name }
          style={{
            height: isSinglePage ? 'auto' : '100vh',
            maxHeight: '100vh',
            maxWidth: visiblePages.length > 1 ? '50vw' : '100vw',
            width: isSinglePage ? '100vw' : 'auto',
            objectFit: 'contain',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            const midpoint = window.innerWidth / 2;
            if (e.clientX < midpoint) shiftPage(2);
            else shiftPage(-2);
          }}
        />
      ))}
      </div>
      { pages.map((item, index) => {
        if (visiblePages.includes(index)) return null;
        const src = setImageSource(item, index);
        if (!src) return null;
        return <img key={item.name} src={src} style={{ display: 'none' }} />;
      })}
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
        const res = await fetch(`${apiUrl}/api/v1/directory/resolve-target?p=${path}`);
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

    console.log(`navigate to: /reader/${container}/${file}`);

    navigate(`/reader/${container}/${file}`, { replace: true });
  }, [data, navigate]);
  return null;
}
