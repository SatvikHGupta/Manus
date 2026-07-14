import { useEffect } from 'react';

// Manus has no server-rendered per-route tags to fall back on (it's a
// hash-routed single-file build), so this is the only thing that ever
// sets document.title / the meta description - App.jsx calls it once per
// route with whatever title fits (including the current notebook's name
// while in the editor).
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);
}
