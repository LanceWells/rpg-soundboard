import { BulkUploadFiles } from '@renderer/components/forms/bulkUpload/formV2'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sound/bulkUpload')({
  component: RouteComponent
})

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
