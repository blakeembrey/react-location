# React Location

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Light-weight and universal react routing.

Uses [React.js hooks](https://reactjs.org/docs/hooks-intro.html).

## Installation

```
npm install @blakeembrey/react-location --save
```

## Usage

**React Location** exports a React.js `Context` to control routing. The default router is `SimpleLocation`, useful for testing or server-side rendering.

```js
import { Link, Redirect, useRouter, Router } from "@blakeembrey/react-location";

const App = () => {
  // Or `const [url, location] = useRouter()`.

  return (
    <Router>
      {(url, location) => {
        return (
          <div>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
            </nav>

            {url.pathname === '/about-me' && <Redirect to="/about" />}
            {url.pathname === "/" && <div>Home</div>}
            {url.pathname === "/about" && <div>About</div>}
          </div>
        );
      }}
    </Route>
  );
};
```

**Location Properties:**

- `url` Get the locations current [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- `push(location: string)` Push the user to a new URL (e.g. `<Link />` or dynamic redirects)
- `format(location: string)` Format the URL for `<Link />`
- `onChange(fn: () => void)` Notify `fn` on URL change (returns an `unsubscribe` function)

**Tip:** For a simpler routing experience, combine with [`@blakeembrey/react-route`](https://github.com/blakeembrey/react-route).

```js
import { Route } from "@blakeembrey/react-route";

export default () => (
  <div>
    <Route path="/">{() => <div>Home</div>}</Route>
    <Route path="/page/:id">{([id]) => <Page id={id} />}</Route>
  </div>
);
```

### [Hash Location](examples/hash/app.js)

```js
import { Context, HashLocation } from '@blakeembrey/react-location'

<Context.Provider value={new HashLocation()}>
  <App />
</Context.Provider>
```

### [History Location](examples/history/app.js)

```js
import { Context, HistoryLocation } from '@blakeembrey/react-location'

<Context.Provider value={new HistoryLocation()}>
  <App />
</Context.Provider>
```

### [Simple Location](examples/simple/app.js)

Useful for testing React.js applications or server-side rendering.

```js
import { Context, SimpleLocation } from '@blakeembrey/react-location'

// E.g. `req.url` from a node.js HTTP server.
const location = new SimpleLocation(new URL(`http://example.com${req.url}`))

<Context.Provider value={location}>
  <App />
</Context.Provider>
```

## TypeScript

This project uses [TypeScript](https://github.com/Microsoft/TypeScript) and publishes definitions on NPM.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/@blakeembrey/react-location.svg?style=flat
[npm-url]: https://npmjs.org/package/@blakeembrey/react-location
[downloads-image]: https://img.shields.io/npm/dm/@blakeembrey/react-location.svg?style=flat
[downloads-url]: https://npmjs.org/package/@blakeembrey/react-location
[travis-image]: https://img.shields.io/travis/blakeembrey/react-location.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/react-location
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/react-location.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/react-location?branch=master
