
const apiUrl = import.meta.env.VITE_API_URL;


/* tag functions */
export async function readTags(path) {
}

export async function assignTag(path, tag) {
}

export async function createTag(tag) {
}

export async function deleteTag(tag) {
}

/* favorites functions */
export async function readFavorites(path = null) {
  const params = new URLSearchParams();
  if (path !== null) params.set('path', path);
  try {
    const res = await fetch(
      `${apiUrl}/api/v1/library/favorite?${params}`,
      { credentials: "include" },
    );
    return res.json();
  } catch (err) {
    console.log("failed to determine favorite status");
    return [];
  }
}

export async function addFavorite(path) {
}

export async function deleteFavorite(path) {
}

/* gallery functions */
export async function createGallery(path) {
}

export async function readGallery(path) {
}

export async function updateGallery(path) {
}

export async function deleteGallery(path) {
}

/* bookmarks */
async function bookmarkRequest(path, page, method) {
  const params = new URLSearchParams();
  if (path) params.set('path', path)
  if (page) params.set('page', page)
  try {
    const res = await fetch(
      `${apiUrl}/api/v1/library/bookmark?${params}`,
      { 
        credentials: "include",
        method: method,
      },
    );
    return res;
  } catch (err) {
    console.log(`failed to make ${method} request to bookmark api`);
    throw err;
  }
}
export async function createBookmark(path, page) {
  const res = await bookmarkRequest(path, page, "POST");
  return res.ok;
}

export async function readBookmark(path=null, page=null) {
  const res = await bookmarkRequest(path, page, "GET");
  return res.json();
}

export async function deleteBookmark(path, page) {
  const res = await bookmarkRequest(path, page, "DELETE");
  return res.ok;
}