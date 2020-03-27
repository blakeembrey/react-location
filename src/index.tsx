import React from "react";

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
    this.url = url;
  }

  get url() {
    return this[currentUrl];
  }

  set url(url: URL) {
    // Avoids unnecessary changes.
    if (this[currentUrl] && url.href === this[currentUrl].href) return;

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
  if (hash.substr(0, 3) !== "#!/") return "/";
  return hash.substr(2);
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
export const Context = React.createContext(
  new SimpleLocation(new URL("http://localhost"))
);

/**
 * React hook for routing.
 */
export function useRouter(): [URL, SimpleLocation] {
  const loc = React.useContext(Context);
  const [, setUrl] = React.useState(loc.url);
  React.useLayoutEffect(() => loc.onChange(setUrl), [loc]);
  return [loc.url, loc];
}

/**
 * Router props.
 */
export interface RouterProps {
  children: (url: URL, location: SimpleLocation) => JSX.Element | null;
}

/**
 * Route component listens for route changes.
 */
export function Router({ children }: RouterProps) {
  const [url, location] = useRouter();
  return children(url, location);
}

/**
 * Inline `<Link />` click handler.
 */
export function useClick(to: string) {
  const location = React.useContext(Context);

  return (e: React.MouseEvent<HTMLAnchorElement>) => {
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

/**
 * Export HOC for `<a />` elements.
 */
export function withLink<
  P extends {
    href?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
>(Component: React.ComponentType<P>) {
  return ({ to, ...props }: P & { to: string }) => {
    const location = React.useContext(Context);
    const click = useClick(to);
    const onClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (props.onClick) props.onClick(e);
        click(e);
      },
      [props.onClick, click]
    );

    return (
      <Component
        {...((props as any) as P)}
        href={location.format(to)}
        onClick={onClick}
      />
    );
  };
}

/**
 * Create a simple `<a />` link.
 */
export const Link = withLink<React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  (props) => <a {...props} />
);

/**
 * Redirect component properties.
 */
export interface RedirectProps {
  to: string;
}

/**
 * Declarative redirection.
 */
export function Redirect({ to }: RedirectProps) {
  const context = React.useContext(Context);
  React.useEffect(() => context.push(to));
  return null;
}
