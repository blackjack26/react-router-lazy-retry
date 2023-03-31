import { LazyRouteFunction, RouteObject } from 'react-router-dom';
import { Router } from './LazyOptions';
export interface RetryOptions {
    router?: Router | null;
    refreshStorageKey?: ((id: string) => string) | string;
}
export declare const lazyRetry: (lazyFn: LazyRouteFunction<RouteObject>, id: string, opts: RetryOptions) => LazyRouteFunction<RouteObject>;
//# sourceMappingURL=lazyRetry.d.ts.map