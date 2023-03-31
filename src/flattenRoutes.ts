import type { RouteObject } from 'react-router-dom'

export const joinPaths = (paths: string[]): string => paths.join('/').replace(/\/\/+/g, '/')

type WrappedRouteObject = RouteObject & {
  wrapped?: boolean
}

interface RouteMeta {
  relativePath: string
  caseSensitive: boolean
  childrenIndex: number
  route: WrappedRouteObject
}

interface RouteBranch {
  path: string
  score: number
  routesMeta: RouteMeta[]
}

const flattenRoutes = (
  routes: RouteObject[],
  branches: RouteBranch[] = [],
  parentsMeta: RouteMeta[] = [],
  parentPath = ''
) => {
  const flattenRoute = (route: RouteObject, index: number, relativePath?: string) => {
    const meta: RouteMeta = {
      relativePath: relativePath ?? route.path ?? '',
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route,
    }

    if (meta.relativePath.startsWith('/')) {
      invariant(
        meta.relativePath.startsWith(parentPath),
        `Absolute route path "${meta.relativePath}" nested under path ` +
          `"${parentPath}" is not valid. An absolute child route path ` +
          `must start with the combined path of all its parent routes.`
      )
      meta.relativePath = meta.relativePath.slice(parentPath.length)
    }

    const path = joinPaths([parentPath, meta.relativePath])
    const routesMeta = parentsMeta.concat(meta)

    // Add the children before adding this route to the array so we traverse the
    // route tree depth-first and child routes appear before their parents in
    // the "flattened" version.
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        `Index routes must not have child routes. Please remove ` +
          `all child routes from route path "${path}".`
      )

      flattenRoutes(route.children, branches, routesMeta, path)
    }

    // Routes without a path shouldn't ever match by themselves unless they are
    // index routes, so don't add them to the list of possible branches.
    if (route.path == null && !route.index) {
      return
    }

    branches.push({ path, score: computeScore(path, route.index), routesMeta })
  }

  routes.forEach((route, index) => {
    // coarse-grain check for optional params
    if (route.path === '' || !route.path?.includes('?')) {
      flattenRoute(route, index)
    } else {
      for (const exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded)
      }
    }
  })

  return branches
}

export default flattenRoutes

/**
 * Computes all combinations of optional path segments for a given path,
 * excluding combinations that are ambiguous and of lower priority.
 *
 * For example, `/one/:two?/three/:four?/:five?` explodes to:
 * - `/one/three`
 * - `/one/:two/three`
 * - `/one/three/:four`
 * - `/one/three/:five`
 * - `/one/:two/three/:four`
 * - `/one/:two/three/:five`
 * - `/one/three/:four/:five`
 * - `/one/:two/three/:four/:five`
 */
function explodeOptionalSegments(path: string): string[] {
  const segments = path.split('/')
  if (segments.length === 0) return []

  const [first, ...rest] = segments

  // Optional path segments are denoted by a trailing `?`
  const isOptional = first.endsWith('?')
  // Compute the corresponding required segment: `foo?` -> `foo`
  const required = first.replace(/\?$/, '')

  if (rest.length === 0) {
    // Intepret empty string as omitting an optional segment
    // `["one", "", "three"]` corresponds to omitting `:two` from `/one/:two?/three` -> `/one/three`
    return isOptional ? [required, ''] : [required]
  }

  const restExploded = explodeOptionalSegments(rest.join('/'))

  const result: string[] = []

  // All child paths with the prefix.  Do this for all children before the
  // optional version for all children so we get consistent ordering where the
  // parent optional aspect is preferred as required.  Otherwise, we can get
  // child sections interspersed where deeper optional segments are higher than
  // parent optional segments, where for example, /:two would explodes _earlier_
  // then /:one.  By always including the parent as required _for all children_
  // first, we avoid this issue
  result.push(
    ...restExploded.map((subpath) => (subpath === '' ? required : [required, subpath].join('/')))
  )

  // Then if this is an optional value, add all child versions without
  if (isOptional) {
    result.push(...restExploded)
  }

  // for absolute paths, ensure `/` instead of empty segment
  return result.map((exploded) => (path.startsWith('/') && exploded === '' ? '/' : exploded))
}

const paramRe = /^:\w+$/
const dynamicSegmentValue = 3
const indexRouteValue = 2
const emptySegmentValue = 1
const staticSegmentValue = 10
const splatPenalty = -2
const isSplat = (s: string) => s === '*'

function computeScore(path: string, index: boolean | undefined): number {
  const segments = path.split('/')
  let initialScore = segments.length
  if (segments.some(isSplat)) {
    initialScore += splatPenalty
  }

  if (index) {
    initialScore += indexRouteValue
  }

  return segments
    .filter((s) => !isSplat(s))
    .reduce(
      (score, segment) =>
        score +
        (paramRe.test(segment)
          ? dynamicSegmentValue
          : segment === ''
          ? emptySegmentValue
          : staticSegmentValue),
      initialScore
    )
}

function invariant(value: boolean, message?: string): asserts value {
  if (value === false || value === null || typeof value === 'undefined') {
    throw new Error(message)
  }
}
