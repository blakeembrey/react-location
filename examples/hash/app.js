import * as React from "react";
import { render } from "react-dom";
import { HashLocation, Context } from "../../dist";
import App from "../shared";

render(
  React.createElement(
    Context.Provider,
    { value: new HashLocation() },
    React.createElement(App)
  ),
  document.body
);
