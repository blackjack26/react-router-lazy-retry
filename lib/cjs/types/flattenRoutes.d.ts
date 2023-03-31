import type { RouteObject } from 'react-router-dom';
export declare const joinPaths: (paths: string[]) => string;
type WrappedRouteObject = RouteObject & {
    wrapped?: boolean;
};
interface RouteMeta {
    relativePath: string;
    caseSensitive: boolean;
    childrenIndex: number;
    route: WrappedRouteObject;
}
interface RouteBranch {
    path: string;
    score: number;
    routesMeta: RouteMeta[];
}
declare const flattenRoutes: (routes: RouteObject[], branches?: RouteBranch[], parentsMeta?: RouteMeta[], parentPath?: string) => RouteBranch[];
export default flattenRoutes;
//# sourceMappingURL=flattenRoutes.d.ts.map