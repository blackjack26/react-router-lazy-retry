import { createBrowserRouter, createMemoryRouter, createHashRouter, } from 'react-router-dom';
import flattenRoutes from './flattenRoutes';
import { lazyRetry } from './lazyRetry';
export const createLazyRouterWithRetry = (type, routes, opts) => {
    if (opts?.exclude && opts.include)
        throw new Error('Cannot specify both "include" and "exclude"');
    const flattened = flattenRoutes(routes);
    // Filter all routes that have a lazy function
    let routesWithLazy = flattened
        .map((branch) => ({
        path: branch.path,
        routes: branch.routesMeta.filter((meta) => meta.route.lazy).map((meta) => meta.route),
    }))
        .filter((data) => data.routes.length > 0);
    if (opts?.include) {
        routesWithLazy = routesWithLazy.filter((data) => opts.include?.includes(data.path));
    }
    else if (opts?.exclude) {
        routesWithLazy = routesWithLazy.filter((data) => !(opts?.exclude ?? []).includes(data.path));
    }
    const retryOptions = {
        // We set the router to null at first and in an object because the routes will be called while the router is
        // initializing. So, by passing null we can tell the lazy retry to just reload the page instead of trying to get the
        // navigation path from the router.
        router: null,
        refreshStorageKey: opts?.refreshStorageKey,
    };
    // Wrap each lazy function with retry logic
    for (const { path, routes } of routesWithLazy) {
        for (const route of routes) {
            if (!route.lazy || route.wrapped) {
                // Do not change lazy function if it wasn't set in the first place or if we've already wrapped it
                continue;
            }
            route.lazy = lazyRetry(route.lazy, route.id ?? path, retryOptions);
            // Make sure we don't wrap route multiple times
            route.wrapped = true;
        }
    }
    let router;
    if (type === 'hash') {
        router = createHashRouter(routes, opts?.router);
    }
    else if (type === 'memory') {
        router = createMemoryRouter(routes, opts?.router);
    }
    else {
        // browser
        router = createBrowserRouter(routes, opts?.router);
    }
    // After the router has been created, we set it here so all of the lazy retry functions now have access to the router.
    // This is done through reference updating, since calling opts.router = router will update the opts object reference
    // which all lazy retry functions have.
    // This will allow the retry functions to access the path the router is navigating to if an error occurs
    retryOptions.router = router;
    return router;
};
