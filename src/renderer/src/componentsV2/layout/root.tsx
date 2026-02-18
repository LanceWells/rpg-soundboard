import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider
} from '@tanstack/react-router'
import { Nav } from '../nav/nav'
import { Board } from '../board/board'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { CreateSoundForm } from '../forms/sound/create'
import { EditSoundForm } from '../forms/sound/edit'

type RootLayoutProps = {}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Nav />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
})

const boardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Board />
})

const createSoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sound/create',
  component: () => <CreateSoundForm />
})

const editSoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sound/edit',
  component: () => <EditSoundForm />
})

const routeTree = rootRoute.addChildren([boardRoute, createSoundRoute, editSoundRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function RootLayout(props: RootLayoutProps) {
  const {} = props

  return (
    <div
      className={`
      w-full
      h-full
      grid
      grid-cols-[288px_1fr]
    `}
    >
      <RouterProvider router={router} />
    </div>
  )
}
