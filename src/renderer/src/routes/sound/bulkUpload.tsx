import { BulkUploadFiles } from '@renderer/components/forms/bulkUpload/form'
import { createFileRoute } from '@tanstack/react-router'

/**
 * TanStack Router route definition for the bulk upload page.
 */
export const Route = createFileRoute('/sound/bulkUpload')({
  component: RouteComponent
})

/**
 * Page component that renders the bulk upload form with a heading.
 */
function RouteComponent() {
  return (
    <div
      className={`
        p-8
        h-dvh
        max-h-dvh
        overflow-hidden
        relative
        grid
        grid-rows-[min-content_1fr]
      `}
    >
      <h1 className="text-2xl text-center mb-4">Bulk Upload</h1>
      <BulkUploadFiles />
    </div>
  )
}
