import * as React from "react";
import { render } from "react-dom";
import {
  Context,
  Router,
  Link,
  SimpleLocation,
  HashLocation,
  HistoryLocation
} from "./index";

describe("react location", () => {
  it("should render link element", () => {
    const node = document.createElement("div");

    render(
      <Link to="/foo" className="test">
        Link
      </Link>,
      node
    );

    const el = node.children[0] as HTMLAnchorElement;

    expect(el.nodeName).toEqual("A");
    expect(el.href).toEqual("http://localhost/foo");
    expect(el.textContent).toEqual("Link");
    expect(el.className).toEqual("test");
  });

  it("should render simple location", () => {
    const location = new SimpleLocation(new URL("http://example.com/test"));
    const node = document.createElement("div");

    render(
      <Context.Provider value={location}>
        <Router>
          {({ pathname }) => {
            return <div>{pathname}</div>;
          }}
        </Router>
      </Context.Provider>,
      node
    );

    const el = node.children[0];

    expect(el.nodeName).toEqual("DIV");
    expect(el.textContent).toEqual("/test");

    location.push("/foo");

    expect(el.textContent).toEqual("/foo");
  });

  it("should render hash location", () => {
    const location = new HashLocation();
    const node = document.createElement("div");

    document.body.appendChild(node);

    render(
      <Context.Provider value={location}>
        <Link to="/test">Click here</Link>
      </Context.Provider>,
      node
    );

    const el = node.children[0] as HTMLAnchorElement;

    expect(window.location.href).toEqual("http://localhost/");

    el.click();

    expect(window.location.href).toEqual("http://localhost/#!/test");

    window.location.hash = ""; // Reset.
    document.body.removeChild(node);
  });

  it('should render relative hash location links', () => {
    // Set before creating the hash router, JSDOM doesn't emit `hashchange`.
    window.location.hash = '#!/foo/bar?test=true'

    const location = new HashLocation();
    const node = document.createElement("div");

    document.body.appendChild(node);

    render(
      <Context.Provider value={location}>
        <Link to="baz">Click here</Link>
      </Context.Provider>,
      node
    );

    const el = node.children[0] as HTMLAnchorElement;

    expect(window.location.href).toEqual("http://localhost/#!/foo/bar?test=true");

    el.click();

    expect(window.location.href).toEqual("http://localhost/#!/foo/baz");

    window.location.hash = ""; // Reset.
    document.body.removeChild(node);
  });

  it("should render history location", () => {
    const location = new HistoryLocation();
    const node = document.createElement("div");

    document.body.appendChild(node);

    render(
      <Context.Provider value={location}>
        <Link to="/test">Click here</Link>
      </Context.Provider>,
      node
    );

    const el = node.children[0] as HTMLAnchorElement;

    expect(window.location.href).toEqual("http://localhost/");

    el.click();

    expect(window.location.href).toEqual("http://localhost/test");

    window.history.back();
    document.body.removeChild(node);
  });
});
