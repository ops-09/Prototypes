/** Prefix app paths for GitHub Pages (`/Prototypes/`) while keeping local `/`. */
export function withBasePath(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path || path === '/') {
    return base || '/';
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
