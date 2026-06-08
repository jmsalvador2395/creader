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

export async function getFiles({path, page, size, search}) {
    const params = new URLSearchParams();
    if (path) params.set('path', path);
    if (page != null) params.set('page', page);
    if (size) params.set('size', size);
    if (search) params.set('search', search);

    try {
        const res = await fetch(
            `${apiUrl}/api/v1/directory/browse?${params}`,
            {credentials: "include"},
        );
        if (!res.ok) throw new Error("Request failed");
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}