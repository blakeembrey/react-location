import * as React from "react";
import {
  createStyles,
  Context as StyleContext,
  StyleSheetRenderer
} from "react-free-style";
import { Link, Router } from "../dist";

const useStyles = createStyles(
  {
    container: {
      display: "flex",
      flexDirection: "column"
    },
    el: {
      margin: 10,
      textAlign: "center"
    }
  },
  {
    "html,body": {
      width: "100%",
      height: "100%",
      margin: 0
    },
    body: {
      fontFamily: "sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }
);

const App = () => {
  const styles = useStyles();

  return React.createElement(Router, {}, url =>
    React.createElement(
      "div",
      {
        className: styles.container
      },
      React.createElement("div", { className: styles.el }, url.pathname),
      React.createElement(Link, { className: styles.el, to: "/foo" }, "Foo"),
      React.createElement(Link, { className: styles.el, to: "/bar" }, "Bar"),
      React.createElement(Link, { className: styles.el, to: "/baz" }, "Baz")
    )
  );
};

export default () => {
  return React.createElement(
    StyleContext.Provider,
    { value: new StyleSheetRenderer() },
    React.createElement(App)
  );
};
