import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sound/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sound/create"!</div>
}
