/**
 * Reference: https://reacttraining.com/react-router/web/example/animated-transitions
 */

import htm from "htm";
import React from "react";
import { render } from "react-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
  styled,
  Context as StyleContext,
  StyleSheetRenderer,
  css,
  useCss,
} from "react-free-style";
import {
  Router,
  Link,
  Redirect,
  HashLocation,
  Context as LocationContext,
} from "../../dist";

const html = htm.bind(React.createElement);

const globalStyle = css(
  (Style) =>
    void Style.registerCss({
      ".fade-enter": {
        opacity: 0,
        zIndex: 1,
      },
      ".fade-enter.fade-enter-active": {
        opacity: 1,
        transition: "opacity 250ms ease-in",
      },
    })
);

const colorStyle = css({
  color: "white",
  paddingTop: "20px",
  fontSize: "30px",
});

const Fill = styled("div", {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

const Nav = styled("ul", {
  padding: 0,
  margin: 0,
  position: "absolute",
  top: 0,
  height: "40px",
  width: "100%",
  display: "flex",
});

const LinkItem = styled("li", {
  textAlign: "center",
  flex: 1,
  listStyleType: "none",
  padding: "10px",
});

function NavLink(props) {
  return html`
    <${LinkItem}>
      <${Link} ...${props} style=${{ color: "inherit" }} />
    <//>
  `;
}

function HSL({ params }) {
  return html`
    <${Fill}
      css="${colorStyle}"
      style="${{
        background: `hsl(${params[0]}, ${params[1]}%, ${params[2]}%)`,
      }}"
    >
      hsl(${params[0]}, ${params[1]}%, ${params[2]}%)
    <//>
  `;
}

function RGB({ params }) {
  return html`
    <${Fill}
      css="${colorStyle}"
      style="${{ background: `rgb(${params[0]}, ${params[1]}, ${params[2]})` }}"
    >
      rgb(${params[0]}, ${params[1]}, ${params[2]})
    <//>
  `;
}

function AnimationExample() {
  useCss(globalStyle);

  return html`
    <${Router}
      >${({ pathname, href }) => html`
      <${Fill}>
        ${
          pathname === "/" &&
          html`<${Redirect} key="redirect" to="/hsl/10/90/50" />`
        }

        <${Nav} key="ul">
          <${NavLink} to="/hsl/10/90/50">Red<//>
          <${NavLink} to="/hsl/120/100/40">Green<//>
          <${NavLink} to="/rgb/33/150/243">Blue<//>
          <${NavLink} to="/rgb/240/98/146">Pink<//>
        <//>

        <!-- The whitespace here is hacky to avoid issues with Transition children. -->
        <${TransitionGroup}><${CSSTransition} key=${href} classNames="fade" timeout=${300}><${Fill} css=${{
        top: "40px",
        textAlign: "center",
      }}>
          ${
            /^\/hsl\//.test(pathname) &&
            html`<${HSL} key="hsl" params=${pathname.substr(5).split("/")} />`
          }
          ${
            /^\/rgb\//.test(pathname) &&
            html`<${RGB} key="rgb" params=${pathname.substr(5).split("/")} />`
          }
        </div><//><//>
      <//>
    `}<//
    >
  `;
}

render(
  React.createElement(
    LocationContext.Provider,
    { value: new HashLocation() },
    React.createElement(
      StyleContext.Provider,
      { value: new StyleSheetRenderer(true) },
      React.createElement(AnimationExample)
    )
  ),
  document.body
);
