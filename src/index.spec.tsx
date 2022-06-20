/**
 * @vitest-environment jsdom
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
  SpyInstance,
} from "vitest";
import { render } from "react-dom";
import { act } from "react-dom/test-utils";
import {
  Context,
  Link,
  SimpleLocation,
  HashLocation,
  HistoryLocation,
  useURL,
} from "./index.js";

describe("react location", () => {
  it("should push location changes", () => {
    const fn = vi.fn();
    const location = new SimpleLocation(new URL("http://example.com"));

    location.onChange(fn);

    location.push("/cafe\u0301");
    expect(location.url.href).toEqual("http://example.com/cafe%CC%81");
    expect(fn).toBeCalledTimes(1);

    location.push("/caf\u00E9");
    expect(location.url.href).toEqual("http://example.com/caf%C3%A9");
    expect(fn).toBeCalledTimes(2);

    location.push("/foo///bar");
    expect(location.url.href).toEqual("http://example.com/foo///bar");
    expect(fn).toBeCalledTimes(3);

    location.push("#test");
    expect(location.url.href).toEqual("http://example.com/foo///bar#test");
    expect(fn).toBeCalledTimes(4);
  });

  describe("with dom", () => {
    let node: HTMLDivElement;

    beforeEach(() => {
      node = document.createElement("div");

      document.body.appendChild(node);
    });

    afterEach(() => {
      document.body.removeChild(node);
    });

    it("should render link element", () => {
      render(
        <Link to="/foo" className="test">
          Link
        </Link>,
        node
      );

      const el = node.children[0] as HTMLAnchorElement;

      expect(el.nodeName).toEqual("A");
      expect(el.href).toEqual("http://localhost:3000/foo");
      expect(el.textContent).toEqual("Link");
      expect(el.className).toEqual("test");
    });

    describe("simple location", () => {
      it("should update url location on change", () => {
        const location = new SimpleLocation(new URL("http://example.com/test"));

        const App = () => {
          const { href } = useURL();
          return <div>{href}</div>;
        };

        render(
          <Context.Provider value={location}>
            <App />
          </Context.Provider>,
          node
        );

        const el = node.children[0];

        expect(el.nodeName).toEqual("DIV");
        expect(el.textContent).toEqual("http://example.com/test");

        act(() => location.push("/foo"));
        expect(el.textContent).toEqual("http://example.com/foo");

        act(() => location.push("#test"));
        expect(el.textContent).toEqual("http://example.com/foo#test");
      });

      it("should render links with simple location", () => {
        const location = new SimpleLocation(new URL("http://example.com"));

        render(
          <Context.Provider value={location}>
            <Link to="/test">Click here</Link>
          </Context.Provider>,
          node
        );

        const el = node.children[0] as HTMLAnchorElement;

        expect(location.url.href).toEqual("http://example.com/");

        act(() => el.click());
        expect(location.url.href).toEqual("http://example.com/test");
      });
    });

    describe("hash location", () => {
      afterEach(() => {
        window.location.hash = ""; // Reset.
      });

      it("should render links with hash location", () => {
        const location = new HashLocation();

        render(
          <Context.Provider value={location}>
            <Link to="/test">Click here</Link>
          </Context.Provider>,
          node
        );

        const el = node.children[0] as HTMLAnchorElement;

        expect(window.location.href).toEqual("http://localhost:3000/");

        act(() => el.click());
        expect(window.location.href).toEqual("http://localhost:3000/#!/test");
      });

      it("should render relative hash location links", () => {
        window.location.hash = "#!/foo/bar?test=true";

        const location = new HashLocation();

        render(
          <Context.Provider value={location}>
            <Link to="baz">Click here</Link>
          </Context.Provider>,
          node
        );

        const el = node.children[0] as HTMLAnchorElement;

        expect(window.location.href).toEqual(
          "http://localhost:3000/#!/foo/bar?test=true"
        );

        act(() => el.click());
        expect(window.location.href).toEqual(
          "http://localhost:3000/#!/foo/baz"
        );
      });
    });

    describe("history location", () => {
      let spy: SpyInstance;

      beforeAll(() => {
        spy = vi.spyOn(history, "pushState");
      });

      afterEach(() => {
        window.history.pushState(undefined, "", "/");
        spy.mockClear(); // Reset spy.
      });

      it("should render links with history location", () => {
        const location = new HistoryLocation();

        render(
          <Context.Provider value={location}>
            <Link to="/test">Click here</Link>
          </Context.Provider>,
          node
        );

        const el = node.children[0] as HTMLAnchorElement;

        expect(window.location.href).toEqual("http://localhost:3000/");

        act(() => el.click());
        expect(window.location.href).toEqual("http://localhost:3000/test");
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("should push hash changes", () => {
        const location = new HistoryLocation();

        const App = () => {
          const { href } = useURL();
          return <div>{href}</div>;
        };

        render(
          <Context.Provider value={location}>
            <App />
          </Context.Provider>,
          node
        );

        expect(window.location.href).toEqual("http://localhost:3000/");
        expect(spy).toHaveBeenCalledTimes(0);

        act(() => location.push("#test"));
        expect(window.location.href).toEqual("http://localhost:3000/#test");
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
