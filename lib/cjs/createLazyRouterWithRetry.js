"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLazyRouterWithRetry = void 0;
const react_router_dom_1 = require("react-router-dom");
const flattenRoutes_1 = __importDefault(require("./flattenRoutes"));
const lazyRetry_1 = require("./lazyRetry");
const createLazyRouterWithRetry = (type, routes, opts) => {
    var _a;
    if ((opts === null || opts === void 0 ? void 0 : opts.exclude) && opts.include)
        throw new Error('Cannot specify both "include" and "exclude"');
    const flattened = (0, flattenRoutes_1.default)(routes);
    // Filter all routes that have a lazy function
    let routesWithLazy = flattened
        .map((branch) => ({
        path: branch.path,
        routes: branch.routesMeta.filter((meta) => meta.route.lazy).map((meta) => meta.route),
    }))
        .filter((data) => data.routes.length > 0);
    if (opts === null || opts === void 0 ? void 0 : opts.include) {
        routesWithLazy = routesWithLazy.filter((data) => { var _a; return (_a = opts.include) === null || _a === void 0 ? void 0 : _a.includes(data.path); });
    }
    else if (opts === null || opts === void 0 ? void 0 : opts.exclude) {
        routesWithLazy = routesWithLazy.filter((data) => { var _a; return !((_a = opts === null || opts === void 0 ? void 0 : opts.exclude) !== null && _a !== void 0 ? _a : []).includes(data.path); });
    }
    const retryOptions = {
        // We set the router to null at first and in an object because the routes will be called while the router is
        // initializing. So, by passing null we can tell the lazy retry to just reload the page instead of trying to get the
        // navigation path from the router.
        router: null,
        refreshStorageKey: opts === null || opts === void 0 ? void 0 : opts.refreshStorageKey,
    };
    // Wrap each lazy function with retry logic
    for (const { path, routes } of routesWithLazy) {
        for (const route of routes) {
            if (!route.lazy || route.wrapped) {
                // Do not change lazy function if it wasn't set in the first place or if we've already wrapped it
                continue;
            }
            route.lazy = (0, lazyRetry_1.lazyRetry)(route.lazy, (_a = route.id) !== null && _a !== void 0 ? _a : path, retryOptions);
            // Make sure we don't wrap route multiple times
            route.wrapped = true;
        }
    }
    let router;
    if (type === 'hash') {
        router = (0, react_router_dom_1.createHashRouter)(routes, opts === null || opts === void 0 ? void 0 : opts.router);
    }
    else if (type === 'memory') {
        router = (0, react_router_dom_1.createMemoryRouter)(routes, opts === null || opts === void 0 ? void 0 : opts.router);
    }
    else {
        // browser
        router = (0, react_router_dom_1.createBrowserRouter)(routes, opts === null || opts === void 0 ? void 0 : opts.router);
    }
    // After the router has been created, we set it here so all of the lazy retry functions now have access to the router.
    // This is done through reference updating, since calling opts.router = router will update the opts object reference
    // which all lazy retry functions have.
    // This will allow the retry functions to access the path the router is navigating to if an error occurs
    retryOptions.router = router;
    return router;
};
exports.createLazyRouterWithRetry = createLazyRouterWithRetry;
