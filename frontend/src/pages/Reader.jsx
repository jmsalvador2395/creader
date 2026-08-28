import { useRef, useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  readFavorites, addFavorite, deleteFavorite,
  readBookmark, createBookmark, deleteBookmark
} from "../api/library"

export function Reader() {

  const apiUrl = import.meta.env.VITE_API_URL;
  const PRELOAD_DIST = 3;

  // set reactive variables
  const loc = useLocation().pathname
  const {container, file} = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const divRef = useRef(null);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [visiblePages, setVisiblePages] = useState([]);
  const [readDirection, setReadDirection] = useState("left");
  const [currentPage, setCurrentPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [sortedBookmarks, setSortedBookmarks] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [lastPage, setLastPage] = useState(null);
  const [lastPageNum, setLastPageNum] = useState(null);
  const autoplayRef = useRef(null);
  const autoplayCallbackRef = useRef(null);
  const autoplayInterval = 45_000;

  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowCursor(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowCursor(false), 1000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
      setShowCursor(true);
    };
  }, []);

  // check favorite status
  useEffect(() => { 
    queryFavorite(); 
  }, [container]);

  async function queryFavorite() {
    const res = await readFavorites(container)
    setFavorited(res.length > 0);
  }

  // check bookmarks
  useEffect(() => { 
    queryBookmarks();
  }, [container]);

  const setBookmarkVars = (bookmarkSet) => {
    setBookmarks(bookmarkSet);
    setSortedBookmarks(Array.from(bookmarkSet)
      .sort((a, b) => a.localeCompare(b, undefined, {numeric: true})
    ))
  };

  const queryBookmarks = async () => {
    const res = await readBookmark(container, null);
    const next = new Set(res.map(item => item.page));
    setBookmarkVars(next);
    const pageName = data[currentPage]?.name;
    if (pageName) setIsBookmarked(next.has(pageName));
  };

  useEffect(() => {
    const pageName = data[currentPage]?.name;
    setIsBookmarked(bookmarks.has(pageName));
  }, [bookmarks, currentPage]);

  const showToast = (msg) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
    setTimeout(() => setToast(null), 2300);
  };

  const toggleBookmarked = async (page) => {
    const pageName = data[page].name;
    if (bookmarks.has(pageName)) {
      const res = await deleteBookmark(container, pageName);
      if (res) {
        const next = new Set(bookmarks);
        next.delete(pageName);
        // setBookmarks(next);
        setBookmarkVars(next);
        if (!menuOpen) showToast("Bookmark removed");
      }
    } else {
      const res = await createBookmark(container, pageName);
      if (res) {
        const next = new Set([...bookmarks, pageName]);
        // setBookmarks(next);
        setBookmarkVars(next);
        if (!menuOpen) showToast("Bookmark added");
      }
    }
  }

  // make api call to get the file list of the directory
  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(
          `${apiUrl}/api/v1/directory/list-entries?p=${encodeURIComponent(container)}&img=true`,
          {credentials: "include"},
        );
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
      changePage(index, false);
    }
    divRef.current?.focus();
  }, [data]);


  /*  */
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

  /*
   * UI Logic
   */

  const goToNextBookmark = () => {
    goToBookmark("next");
  }

  const goToPrevBookmark = () => {
    goToBookmark("prev");
  }

  const goToBookmark = (direction) => {
    if (direction !== "next" && direction !== "prev")
      throw new Error("direction variable should be `next` or `prev`");

    if (bookmarks.size === 0) return

    const defaultPageName = direction === "next" 
      ? sortedBookmarks[0]
      : sortedBookmarks[sortedBookmarks.length-1];
    const defaultPageNum = pages.findIndex(item => item.name === defaultPageName);
    
    const bookmarkPageNums = sortedBookmarks.map(bm => pages.findIndex(
      item => item.name === bm
    ));
    if (direction === "prev") bookmarkPageNums.reverse();

    for (let pageNum of bookmarkPageNums) {
      if (direction === "prev" && pageNum < currentPage) {
        changePage(pageNum, false);
        return
      }
      if (direction === "next" && pageNum > currentPage) {
        console.log(`setting page to ${pageNum}`);
        changePage(pageNum, false);
        return
      }
    }
    changePage(defaultPageNum, false)
  };

  /* page turning logic */
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
      changePage(curPageTemp, prematureExit);
    }
    const pageName = data[curPageTemp].name;
    setIsBookmarked(bookmarks.has(pageName));
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

  /* sets the page and triggers a render */
  const changePage = (index, prematureExit) => {
    if (index === null) return
    const lastPageName = pages[currentPage].name || null;
    setLastPageNum(currentPage);
    setLastPage(lastPageName);
    setCurrentPage(index);
    computeVisiblePages(index, prematureExit);
    divRef.current?.scrollIntoView({ behavior: 'instant' });
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = setInterval(() => {
        autoplayCallbackRef.current();
      }, autoplayInterval);
    }
  }

  /* slieshow functions */
  const toggleAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
      showToast('Autoplay off')
    } else {
      autoplayRef.current = setInterval(() => {
          autoplayCallbackRef.current();
      }, autoplayInterval);
      showToast('Autoplay on')
    }
  };

  const setAutoplay = (active) => {
    if (active) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
          autoplayCallbackRef.current();
      }, autoplayInterval);
      autoplayRef.current = null;
      showToast('Autoplay on')
    } else {
      clearInterval(autoplayRef.current);
      showToast('Autoplay off')
    }
  };

  useEffect(() => {
    autoplayCallbackRef.current = () => {
      shiftPage(2);
      if (currentPage >= pages.length)
        changePage(0, false);
    };
  });

  /* keyboard events */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // console.log(`pressed: ${e.key}`);
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          shiftPage(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          shiftPage(2);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          shiftPage(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          shiftPage(-2);
          break;
        case 'f':
        case 'Enter':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          setMenuOpen(!menuOpen);
          break;
        case 'b':
          toggleBookmarked(currentPage);
          break;
        case 'p':
          toggleFavorite();
          break;
        case 'j':
          goToNextBookmark();
          break;
        case 'k':
          goToPrevBookmark();
          break;
        case 'l':
          changePage(lastPageNum, false);
        case ' ':
          toggleAutoplay();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, visiblePages, pages]);


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
    let res;
    if (favorited) {
      res = await deleteFavorite(container);
      if (res && !menuOpen) showToast("Favorite removed");
    } else {
      res = await addFavorite(container);
      if (res && !menuOpen) showToast("Favorite added");
    }
    if (res) setFavorited(!favorited);
    // await queryFavorite();
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded shadow-lg pointer-events-none transition-opacity duration-300 ${toastVisible ? "opacity-100" : "opacity-0"}`}>
          {toast}
        </div>
      )}

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
        
        <div className="px-3 py-1 flex items-stretch">
          <a href={`/gallery/${encodeURIComponent(container)}`}>
            {container}
          </a>
        </div>

        {/* bookmark and favorite buttons */}
        <div className="px-3 py-1 flex items-stretch">
          {/* link to gallery info */}
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
            onClick={() => toggleBookmarked(currentPage)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Bookmark
          </button>
        </div>
        <div className="px-3 py-1 items-stretch w-full items-center justify-center mx-auto block">
          <label htmlFor="bookmark-select">Bookmark Select:</label>
          <select 
            key={`bm-${currentPage}`}
            className="w-full px-3 py-2 rounded border-gray outline"
            name="bookmarks-select" 
            id="bookmark-select" 
            defaultValue={
              bookmarks.has(pages[currentPage]?.name) 
              ? pages[currentPage].name ?? ""
              : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              const index = pages.findIndex((item) => item.name === value);
              changePage(index, false);
            }}
          >
            <option value="" disabled>Go to bookmark...</option>
            {sortedBookmarks.map(bookmark => (
                <option 
                  key={bookmark} 
                  value={bookmark}
                  disabled={pages[currentPage].name === bookmark}
                >
                {bookmark}
                </option>
              ))
            }
          </select>
        </div>
        <div className="px-3 py-1 items-stretch w-full items-center justify-center mx-auto block">
          <label htmlFor="page-select">Page Select:</label>
          <select 
            key={`pg-sel-${currentPage}`}
            className="w-full px-3 py-2 rounded border-gray outline"
            name="page-select" 
            id="page-select" 
            defaultValue={ pages[currentPage]?.name ?? ""}
            // defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              const index = pages.findIndex((item) => item.name === value);
              changePage(index, false);
            }}
          >
            <option value="" disabled>Go to page...</option>
            {lastPage != pages[currentPage]?.name ? (
              <option value={lastPage}>Prev: {lastPage}</option>
            ) : null}
            {pages.map((page, index) => (
              <option 
                key={page.name} 
                value={page.name}
                disabled={currentPage === index}
              >
              {page.name}
              </option>
            ))}
          </select>
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

      <div 
        className="pages relative flex justify-center items-start w-full"
        style={{ 
          zIndex: 20, 
          minHeight: '100vh',
          cursor: showCursor ? "pointer" : "none",
        }}
        onClick={(e) => {
          const midpoint = window.innerWidth / 2;
          if (e.clientX < midpoint) shiftPage(1);
          else shiftPage(-1);
        }}
      >
      {/* Progress bar */}
      <div
        className="absolute left-0 top-0 h-full z-30 opacity-30 transition-opacity" 
        style={{
          width: '4px',
          cursor: showCursor ? "pointer" : "none",
          background: `linear-gradient(to bottom, #3b82f6 ${((currentPage + 1) / pages.length) * 100}%, #9ca3af ${((currentPage + 1) / pages.length) * 100}%)`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          const ratio = e.clientY / window.innerHeight;
          const targetPage = Math.floor(ratio * pages.length);
          changePage(targetPage, false);
        }}
      />
      { visiblePages.map((index) => {
        return (
          <img
            key={`page-${index}`}
            src={pages[index].link}
            crossOrigin="use-credentials"
            style={{
              height: isSinglePage ? 'auto' : '100vh',
              maxHeight: '100vh',
              maxWidth: visiblePages.length > 1 ? '50vw' : '100vw',
              width: isSinglePage ? '100vw' : 'auto',
              objectFit: 'contain',
              cursor: showCursor ? 'pointer' : 'none',
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
        );
      })}
      </div>
      </div>
    </>
  )
}

export function ReaderRedirect() {

  const loc = useLocation().pathname
  const path = loc.replace(/^\/reader\/?/, "");
  const apiUrl = import.meta.env.VITE_API_URL;

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

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!data?.container || !data?.file) return;

    const container = encodeURIComponent(data.container);
    const file = encodeURIComponent(data.file);

    navigate(`/reader/${container}/${file}`, { replace: true });
  }, [data, navigate]);
  return null;
}
