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
  private [callbackFns]: Set<() => void> = new Set();

  constructor(url: URL) {
    this.url = url;
  }

  get url() {
    return this[currentUrl];
  }

  set url(url: URL) {
    this[currentUrl] = url;
    for (const fn of this[callbackFns]) fn();
  }

  push(location: string) {
    this.url = new URL(this.format(location), this.url.href);
  }

  format(location: string) {
    return location;
  }

  onChange(fn: () => void) {
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
    const { pathname, search, hash } = new URL(location, this.url.href)

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
 * Link props extends `<a />` props with a `to` property.
 */
export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

/**
 * Route component listens for route changes.
 */
export class Route extends React.Component<{
  children: (url: URL, location: SimpleLocation) => React.ReactNode;
}> {
  static contextType = Context;

  unsubscribe?: () => void;
  context!: React.ContextType<typeof Context>;

  state = {
    url: this.context.url
  };

  componentDidMount() {
    this.unsubscribe = this.context.onChange(() => {
      return this.setState({ url: this.context.url });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    return this.props.children(this.state.url, this.context);
  }
}

/**
 * Create a simple `<a />` link.
 */
export function Link({ to, children, ...props }: LinkProps) {
  const onClick = (e: React.MouseEvent<any>, location: SimpleLocation) => {
    // Proxy event to user.
    if (props.onClick) props.onClick(e);

    // Reference: https://github.com/ReactTraining/react-router/blob/5407993bd01647405586bbdd25f24de05743e4a7/packages/react-router-dom/modules/Link.js#L18-L22
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (props.target && props.target !== "_self") return;
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;

    e.preventDefault();
    location.push(to);
  };

  return (
    <Context.Consumer>
      {location => {
        const href = location.format(to);

        return (
          <a {...props} href={href} onClick={e => onClick(e, location)}>
            {children}
          </a>
        );
      }}
    </Context.Consumer>
  );
}
