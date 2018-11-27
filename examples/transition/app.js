/**
 * Reference: https://reacttraining.com/react-router/web/example/animated-transitions
 */

import htm from "htm";
import React from "react";
import { render } from "react-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  createStyles,
  Context as StyleContext,
  StyleSheetRenderer
} from "react-free-style";
import {
  Router,
  Link,
  Redirect,
  HashLocation,
  Context as LocationContext
} from "../../dist";

const html = htm.bind(React.createElement);

const useStyles = createStyles(
  {
    fill: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    content: {
      top: "40px",
      textAlign: "center"
    },
    nav: {
      padding: 0,
      margin: 0,
      position: "absolute",
      top: 0,
      height: "40px",
      width: "100%",
      display: "flex"
    },
    navItem: {
      textAlign: "center",
      flex: 1,
      listStyleType: "none",
      padding: "10px"
    },
    color: {
      color: "white",
      paddingTop: "20px",
      fontSize: "30px"
    }
  },
  {
    ".fade-enter": {
      opacity: 0,
      zIndex: 1
    },
    ".fade-enter.fade-enter-active": {
      opacity: 1,
      transition: "opacity 250ms ease-in"
    }
  }
);

function AnimationExample() {
  const styles = useStyles();

  return html`
    <${Router}>${({ pathname, href }) => html`
      <div className=${styles.fill}>
        ${pathname === "/" &&
          html`<${Redirect} key="redirect" to="/hsl/10/90/50" />`}

        <ul key="ul" className=${styles.nav}>
          <${NavLink} to="/hsl/10/90/50">Red<//>
          <${NavLink} to="/hsl/120/100/40">Green<//>
          <${NavLink} to="/rgb/33/150/243">Blue<//>
          <${NavLink} to="/rgb/240/98/146">Pink<//>
        </ul>

        <!-- The whitespace here is hacky to avoid issues with Transition children. -->
        <${TransitionGroup}><${CSSTransition} key=${href} classNames="fade" timeout=${300}><div className=${`${
    styles.content
  } ${styles.fill}`}>
          ${/^\/hsl\//.test(pathname) &&
            html`<${HSL} key="hsl" params=${pathname.substr(5).split("/")} />`}
          ${/^\/rgb\//.test(pathname) &&
            html`<${RGB} key="rgb" params=${pathname.substr(5).split("/")} />`}
        </div><//><//>
      </div>
    `}<//>
  `;
}

function NavLink(props) {
  const styles = useStyles();

  return html`
    <li className=${styles.navItem}>
      <${Link} ...${props} style=${{ color: "inherit" }} />
    </li>
  `;
}

function HSL({ params }) {
  const styles = useStyles();

  return html`
    <div
      className="${`${styles.fill} ${styles.color}`}"
      style="${
        { background: `hsl(${params[0]}, ${params[1]}%, ${params[2]}%)` }
      }"
    >
      hsl(${params[0]}, ${params[1]}%, ${params[2]}%)
    </div>
  `;
}

function RGB({ params }) {
  const styles = useStyles();

  return html`
    <div
      className="${`${styles.fill} ${styles.color}`}"
      style="${{ background: `rgb(${params[0]}, ${params[1]}, ${params[2]})` }}"
    >
      rgb(${params[0]}, ${params[1]}, ${params[2]})
    </div>
  `;
}

render(
  React.createElement(
    LocationContext.Provider,
    { value: new HashLocation() },
    React.createElement(
      StyleContext.Provider,
      { value: new StyleSheetRenderer() },
      React.createElement(AnimationExample)
    )
  ),
  document.body
);
