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
    // Avoid unnecessary changes.
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
  private onpopstate = () => {
    this.url = new URL(window.location.href);
  };

  constructor() {
    super(new URL(window.location.href));

    window.addEventListener("popstate", this.onpopstate);
  }

  push(location: string) {
    const url = this.format(location);
    this.url = new URL(url, window.location.href);
    window.history.pushState(undefined, "", url);
  }

  unsubscribe() {
    window.removeEventListener("popstate", this.onpopstate);
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
  children: (url: URL, location: SimpleLocation) => React.ReactNode;
}

/**
 * Route component listens for route changes.
 */
export class Router extends React.Component<RouterProps> {
  static contextType = Context;

  unsubscribe?: () => void;
  context!: React.ContextType<typeof Context>;

  state = {
    url: this.context.url
  };

  componentDidMount() {
    this.unsubscribe = this.context.onChange(url => this.setState({ url }));
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    return this.props.children(this.state.url, this.context);
  }
}

/**
 * Inline `<Link />` click handler.
 */
function onClick(
  e: React.MouseEvent<HTMLAnchorElement>,
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
 * Export HOC for `<a />` elements.
 */
export function withLink<
  P extends {
    href?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
>(Component: React.ComponentType<P>) {
  return (props: P & { to: string }) => {
    return (
      <Context.Consumer>
        {location => {
          return (
            <Component
              {...props}
              href={location.format(props.to)}
              onClick={e => onClick(e, location, props.to, props)}
            />
          );
        }}
      </Context.Consumer>
    );
  };
}

/**
 * Create a simple `<a />` link.
 */
export const Link = withLink<React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  props => <a {...props} />
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
