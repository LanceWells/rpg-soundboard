import { CreateSoundForm } from '@renderer/components/forms/sound/create'
import { createFileRoute } from '@tanstack/react-router'

/**
 * TanStack Router route definition for the create sound page.
 */
export const Route = createFileRoute('/sound/create')({
  component: RouteComponent
})

/**
 * Page component that renders the create sound form.
 */
function RouteComponent() {
  return <CreateSoundForm />
}
