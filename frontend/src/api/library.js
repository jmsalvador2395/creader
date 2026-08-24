const apiUrl = import.meta.env.VITE_API_URL;


/* tag functions */
export async function readTags(path) {
  const options = {
    credentials: "include",
    method: "GET"
  };

  const params = new URLSearchParams();
  params.set("path", path);

  const res = await fetch(
    `${apiUrl}/api/v1/library/tags?${params}`,
    options,
  );
  if (!res.ok) throw new Error(`failed to fetch tags for path="${path}"`);
  return res.json();
}

export async function updateTag(path, tag) {
}

export async function createTag(path, tag) {
}

export async function deleteTag(path, tag) {
}

/* favorites functions */
export async function getFavoritesList({page, size, search}) {
  const options = {
    credentials: "include",
    method: "GET"
  };

  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (size) params.set("size", size);
  if (search) params.set("search", search);

  try {
    const res = await fetch(
      `${apiUrl}/api/v1/library/favorites-list?${params}`, 
      options, 
    );
    if (res.ok) return res.json();
    return [];

  } catch (err) {
    console.log(`failed to make ${method} request to favorites api`);
    throw(err);
  }
}

async function favoriteRequest(path, method) {
  const options = {
    credentials: "include",
    method: method
  };

  const params = new URLSearchParams();
  if (path) params.set("path", path);

  try {
    return await fetch(
      `${apiUrl}/api/v1/library/favorite?${params}`, 
      options, 
    )
  } catch (err) {
    console.log(`failed to make ${method} request to favorites api`);
    throw(err);
  }
}

export async function readFavorites(path = null) {
  const res = await favoriteRequest(path, "GET");
  if (res.ok) return res.json()
  return [];
}

export async function addFavorite(path) {
  const res = await favoriteRequest(path, "POST");
  return res.ok;
}

export async function deleteFavorite(path) {
  const res = await favoriteRequest(path, "DELETE");
  return res.ok;
}

/* gallery functions */
export async function createGallery(path) {
}

export async function readGalleryInfo(path) {
  if (!path) throw new Error('this function requires a path');

  const params = new URLSearchParams();
  params.set('path', path)

  try {
    const res = await fetch(
      `${apiUrl}/api/v1/library/gallery-info?${params}`,
      { 
        credentials: "include",
      },
    );
    return res.json();
  } catch (err) {
    console.log(
      `function 'readGalleryInfo' failed to fetch gallery info for path="${path}"`
    );
    throw err;
  }
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