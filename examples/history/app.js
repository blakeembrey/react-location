import * as React from "react";
import { render } from "react-dom";
import { HistoryLocation, Context } from "../../dist";
import App from "../shared";

render(
  React.createElement(
    Context.Provider,
    { value: new HistoryLocation() },
    React.createElement(App)
  ),
  document.body
);
