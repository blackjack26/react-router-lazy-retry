import type { createBrowserRouter, createHashRouter, createMemoryRouter } from 'react-router-dom'

export interface RouterOptionsMap {
  browser: Parameters<typeof createBrowserRouter>[1]
  hash: Parameters<typeof createHashRouter>[1]
  memory: Parameters<typeof createMemoryRouter>[1]
}

export type RouterType = keyof RouterOptionsMap

export type Router = ReturnType<
  typeof createBrowserRouter | typeof createMemoryRouter | typeof createHashRouter
>
