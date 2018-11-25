import * as React from "react";
import { render } from "react-dom";
import { SimpleLocation, Context } from "../../dist";
import App from "../shared";

render(
  React.createElement(
    Context.Provider,
    { value: new SimpleLocation(new URL("http://example.com")) },
    React.createElement(App)
  ),
  document.body
);
