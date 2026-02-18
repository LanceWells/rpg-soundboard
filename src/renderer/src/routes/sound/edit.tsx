import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sound/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sound/edit"!</div>
}
