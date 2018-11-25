import * as React from "react";

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
    window.history.pushState(undefined, "", this.format(location));
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
 * Router props.
 */
export interface RouterProps {
  children: (url: URL, location: SimpleLocation) => React.ReactElement<any>;
}

/**
 * Route component listens for route changes.
 */
export function Router({ children }: RouterProps) {
  const context = React.useContext(Context);
  const [url, setUrl] = React.useState(context.url);

  React.useLayoutEffect(() => context.onChange(setUrl), [context]);

  return children(url, context);
}

/**
 * Link props extends `<a />` props with a `to` property.
 */
export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

/**
 * Inline `<Link />` click handler.
 */
function onClick(
  e: React.MouseEvent<any>,
  location: SimpleLocation,
  to: string,
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  // Proxy event to user.
  if (props.onClick) props.onClick(e);

  // Reference: https://github.com/ReactTraining/react-router/blob/5407993bd01647405586bbdd25f24de05743e4a7/packages/react-router-dom/modules/Link.js#L18-L22
  if (e.defaultPrevented) return;
  if (e.button !== 0) return;
  if (props.target && props.target !== "_self") return;
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

  e.preventDefault();
  return location.push(to);
}

/**
 * Create a simple `<a />` link.
 */
export function Link({ to, children, ...props }: LinkProps) {
  return (
    <Context.Consumer>
      {location => {
        return (
          <a
            {...props}
            href={location.format(to)}
            onClick={e => onClick(e, location, to, props)}
          >
            {children}
          </a>
        );
      }}
    </Context.Consumer>
  );
}

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
