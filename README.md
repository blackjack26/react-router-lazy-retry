# React Router Lazy Retry

A wrapper around React Router routes to add a forced webpage reload when a lazy loaded resource
is not found. Supports React Router v6.9.0 and on (when lazy loading was introduced).

[![Version](https://img.shields.io/npm/v/react-router-lazy-retry.svg)](https://www.npmjs.com/package/react-router-lazy-retry)
[![License](https://img.shields.io/npm/l/react-router-lazy-retry.svg)](https://www.npmjs.com/package/react-router-lazy-retry)

> ⚠️ This requires **react-router-dom@6.9.0** or greater ⚠️

## Purpose

React Router now gives the ability to lazy load routes directly in the route definition. A big down side with
code-splitting is when dynamic imports do not resolve (like when a chunk hash changes). While React Router does provide
an `errorElement` as a fallback, it would be nice to try and resolve the issue before the user is displayed something.

This package wraps each lazy loading call with a retry wrapper, that if the dynamic import fails, the page is force
refreshed to grab the latest JS chunk information. It is based on this [gist](https://gist.github.com/raphael-leger/4d703dea6c845788ff9eb36142374bdb)
by [Raphaël Léger](https://gist.github.com/raphael-leger).

## Installation

```sh
# Yarn
$ yarn add react-router-lazy-retry

# NPM
$ npm i -s react-router-lazy-retry
```

## Usage

The most common usage is to wrap _all_ routes that contain a `lazy` function with a retry handler. The code below
creates a browser router with the given routes.
```tsx
import { createLazyRouterWithRetry } from 'react-router-lazy-retry'

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'a',
        lazy: () => import('./a'),
        children: [{
          path: 'sub-a',
          lazy: () => import('./a/sub')
        }]
      },
      {
        path: 'b',
        lazy: () => import('./b'),
      }
    ]
  }
] 
const router = createLazyRouterWithRetry('browser', routes)
```

### Supported Routers

Currently only `'browser'`, `'memory'`, and `'hash'` routers are supported. Static routers are used on server-side which may not
make sense to use in this context.

### Excluding Routes

If there are any routes that should not be retried if lazy loading fails, add the **absolute** paths to the `exclude`
array in the create options.

```tsx
const router = createLazyRouterWithRetry('browser', routes, {
  exclude: ['/a/sub-a']
})
```

_In the example above, the /a/sub-a route will be excluded from lazy retries._

### Opt-In Approach _(Include)_

By default, all routes are included, unless excluded as seen above. But, there is an opt-in approach where all routes
that should be retried are specified. To do this, use the `include` option and add all the **absolute** paths
for retry.

```tsx
const router = createLazyRouterWithRetry('browser', routes, {
  include: ['/a', '/b']
})
```

_In the example above, the /a and /b routes will be included in lazy retries._

> The `exclude` and `include` option ***cannot*** be used at the same time

### Custom Storage Key

When retries are made, a boolean is stored into local storage using the `'retry-{id}-refreshed'` key (where `{id}` is
either the absolute route or a configured route ID).

If desired, a custom key can be configured instead of the default:

```tsx
// Static key
const router = createLazyRouterWithRetry('browser', routes, {
  refreshStorageKey: 'my_static_key'
})

// Dynamic key
const router = createLazyRouterWithRetry('browser', routes, {
  refreshStorageKey: (id) => `dynamic_${id}_key`
})
```

### Router Options

All React Router options are available to be configured through the create options. The options available
depend on the type of router chosen (see [React Router](https://reactrouter.com/en/main/routers/picking-a-router) for
more details).

```tsx
const router = createLazyRouterWithRetry('memory', routes, {
  router: {
    initialEntries: ['/', '/events/123'],
    initialIndex: 1,
  }
})
```
