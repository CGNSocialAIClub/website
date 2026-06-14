const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const assetUrl = (path) => base + path;
