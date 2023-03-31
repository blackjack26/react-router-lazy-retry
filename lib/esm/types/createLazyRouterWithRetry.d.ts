import { RouteObject } from 'react-router-dom';
import { Router, RouterOptionsMap, RouterType } from './LazyOptions';
interface LazyRouterOptions<T extends RouterType> {
    /** Router options */
    router?: RouterOptionsMap[T];
    /** Absolute routes to exclude from lazy retrying. Cannot be used at the same time as `include`. */
    exclude?: string[];
    /** Absolute routes to include into lazy retrying. Cannot be used at the same time as `exclude`. */
    include?: string[];
    /** Allows a custom storage key to be set. By default `"retry-${id}-refreshed"` is used */
    refreshStorageKey?: ((id: string) => string) | string;
}
export declare const createLazyRouterWithRetry: <T extends keyof RouterOptionsMap>(type: T, routes: RouteObject[], opts?: LazyRouterOptions<T> | undefined) => Router;
export {};
//# sourceMappingURL=createLazyRouterWithRetry.d.ts.map