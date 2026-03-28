import { useEffect } from "react";

interface SEOOptions {
  ogType?: string;
  ogImage?: string;
}

export const useSEO = (title: string, description: string, canonicalPath = "/", options?: SEOOptions) => {
  useEffect(() => {
    document.title = title;

    // Meta description
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", options?.ogType || "website", true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    if (options?.ogImage) {
      setMeta("og:image", options.ogImage, true);
      setMeta("twitter:image", options.ogImage);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + canonicalPath;
  }, [title, description, canonicalPath, options?.ogType, options?.ogImage]);
};
