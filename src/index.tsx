import { useLayoutEffect, useContext, createContext, useState } from "react";

/**
 * Private location properties.
 */
export const currentUrl = Symbol("currentUrl");
export const callbackFns = Symbol("callbackFns");

/**
 * Simple in-memory location with no external helpers.
 */
export class SimpleLocation {
  private [currentUrl]: URL;
  private [callbackFns]: Set<(url: URL) => void> = new Set();

  constructor(url: URL) {
    this[currentUrl] = url;
  }

  get url() {
    return this[currentUrl];
  }

  set url(url: URL) {
    // Avoids unnecessary changes.
    if (url.href === this[currentUrl].href) return;

    this[currentUrl] = url;
    for (const fn of this[callbackFns]) fn(url);
  }

  push(location: string) {
    this.url = new URL(this.format(location), this.url.href);
  }

  format(location: string) {
    return location;
  }

  onChange(fn: (url: URL) => void) {
    const fns = this[callbackFns];
    fns.add(fn);
    return () => void fns.delete(fn);
  }
}

/**
 * History-based location for browsers.
 */
export class HistoryLocation extends SimpleLocation {
  private listener = () => {
    this.url = new URL(window.location.href);
  };

  constructor() {
    super(new URL(window.location.href));

    window.addEventListener("popstate", this.listener);
  }

  push(location: string) {
    const newURL = this.format(location);
    window.history.pushState(undefined, "", newURL);
    this.url = new URL(newURL, window.location.href);
  }

  unsubscribe() {
    window.removeEventListener("popstate", this.listener);
  }
}

/**
 * Get URL path from hash string.
 */
function pathFromHash(hash: string) {
  if (hash.slice(0, 3) !== "#!/") return "/";
  return hash.slice(2);
}

/**
 * Hash-based location for browsers.
 */
export class HashLocation extends SimpleLocation {
  private listener = () => {
    this.url = new URL(pathFromHash(location.hash), location.href);
  };

  constructor() {
    super(new URL(pathFromHash(location.hash), location.href));

    window.addEventListener("hashchange", this.listener);
  }

  push(location: string) {
    window.location.hash = this.format(location);
  }

  format(location: string) {
    const { pathname, search, hash } = new URL(location, this.url.href);

    return `#!${pathname}${search}${hash}`;
  }

  unsubscribe() {
    window.removeEventListener("hashchange", this.listener);
  }
}

/**
 * Global routing context.
 */
export const Context = createContext(
  new SimpleLocation(new URL("http://0.0.0.0"))
);

/**
 * React hook for routing.
 */
export function useURL(): URL {
  const location = useContext(Context);
  const [url, setUrl] = useState(location.url);
  useLayoutEffect(() => location.onChange(setUrl), [location]);
  return url;
}

/**
 * Format a link for `<a />` elements.
 */
export function useHref(to: string) {
  const location = useContext(Context);
  return location.format(to);
}

/**
 * Inline `<a />` click handler.
 */
export function useLinkHandler(
  to: string
): React.MouseEventHandler<HTMLAnchorElement> {
  const location = useContext(Context);

  return (e) => {
    // Reference: https://github.com/ReactTraining/react-router/blob/5407993bd01647405586bbdd25f24de05743e4a7/packages/react-router-dom/modules/Link.js#L18-L22
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      (e.currentTarget.target && e.currentTarget.target !== "_self") ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    )
      return;

    e.preventDefault();
    location.push(to);
  };
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
};

/**
 * Create a simple `<a />` link.
 */
export function Link({ to, ...props }: LinkProps) {
  const href = useHref(to);
  const handleClick = useLinkHandler(to);

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    props.onClick?.(event);
    handleClick(event);
  };

  return <a {...props} href={href} onClick={onClick} />;
}
