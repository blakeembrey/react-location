import { Context, Route, SimpleLocation, Link } from "./index";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

describe("react location", () => {
  const App = () => {
    return (
      <Route>
        {({ pathname }) => {
          return <div>{pathname}</div>;
        }}
      </Route>
    );
  };

  it("should render location and changes", () => {
    const location = new SimpleLocation(new URL("http://example.com/test"));

    const root = (
      <Context.Provider value={location}>
        <App />
      </Context.Provider>
    );

    expect(renderToStaticMarkup(root)).toEqual("<div>/test</div>");

    location.push("/foo");

    expect(renderToStaticMarkup(root)).toEqual("<div>/foo</div>");
  });

  it("should render link", () => {
    expect(
      renderToStaticMarkup(
        <Link to="/foo" className="test">
          Link
        </Link>
      )
    ).toEqual('<a class="test" href="/foo">Link</a>');
  });
});
