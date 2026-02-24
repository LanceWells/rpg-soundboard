import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Nav } from '@renderer/components/nav/nav'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Nav />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  )
})
