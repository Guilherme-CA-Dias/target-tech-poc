import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useFieldSchema } from "@/hooks/use-field-schema"
import { Record } from "@/types/record"
import { Loader2 } from "lucide-react"
import { DataInput, FloatingPortalBoundary, DataSchema } from "@integration-app/react"
import { sendToWebhook } from '@/lib/webhook-utils'
import { ensureAuth } from "@/lib/auth"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface CreateRecordModalProps {
  recordType: string | null
  isOpen: boolean
  onClose: () => void
  onCreated: (record: Record) => void
}

export function CreateRecordModal({
  recordType,
  isOpen,
  onClose,
  onCreated
}: CreateRecordModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record['fields']>({})
  const { schema, isLoading: schemaLoading, error: schemaError } = useFieldSchema(recordType)

  const filteredSchema: DataSchema | undefined = schema ? {
    ...schema,
    properties: Object.fromEntries(
      Object.entries(schema.properties).filter(([key]) => key !== 'id')
    )
  } : undefined

  const handleFieldChange = (value: unknown) => {
    setFormData(value as Record['fields'])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !recordType) return

    const tempId = `temp_${Date.now()}`
    setIsSaving(true)
    try {
      await sendToWebhook({
        type: 'created',
        data: {
          id: tempId,
          ...formData,
          createdTime: new Date().toISOString(),
        },
        customerId: ensureAuth().customerId || '',
      })

      onCreated({
        id: tempId,
        customerId: ensureAuth().customerId || '',
        recordType,
        fields: formData,
        name: formData.name as string || '',
      })
      
      onClose()
      
      // Optionally refresh the records list
      window.location.reload()
    } catch (error) {
      console.error('Failed to create record:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (schemaError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Form</DialogTitle>
          </DialogHeader>
          <p className="text-red-500">
            {schemaError.message || 'Failed to load. Please try again.'}
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <div className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Record</DialogTitle>
          </DialogHeader>
          {schemaLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1 -mx-6 px-6" style={{ position: 'relative' }}>
                <FloatingPortalBoundary id="create-record-modal">
                  <div className="py-4">
                    {filteredSchema && (
                      <DataInput
                        schema={filteredSchema}
                        value={formData}
                        onChange={handleFieldChange}
                        className={{
                          dropdown__popover: "!bg-white rounded-lg shadow-lg border border-gray-200",
                          dropdown__popover_container: "!bg-white p-1",
                          dropdown__option: "rounded hover:bg-gray-100",
                          dropdown__selected_option: "bg-blue-50"
                        }}
                      />
                    )}
                  </div>
                </FloatingPortalBoundary>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
              <DialogFooter className="flex-shrink-0 pt-6 border-t mt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Record'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 