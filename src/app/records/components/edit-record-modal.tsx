import { useState, useEffect } from "react"
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
import { useRecord } from '@/hooks/use-record'
import { DataInput } from "@integration-app/react"
import { sendToWebhook } from '@/lib/webhook-utils'
import { ensureAuth } from "@/lib/auth"

interface EditRecordModalProps {
  record: Record | null
  recordType: string | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedRecord: Record) => Promise<void>
}

interface FieldChange {
  fieldName: string
  oldValue: any
  newValue: any
  timestamp: string
}

export function EditRecordModal({
  record: initialRecord,
  recordType,
  isOpen,
  onClose,
  onSave
}: EditRecordModalProps) {
  const [formData, setFormData] = useState<Record | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldChanges, setFieldChanges] = useState<FieldChange[]>([])
  const { schema, isLoading: schemaLoading, error: schemaError } = useFieldSchema(recordType)
  const { record, isLoading: recordLoading, error: recordError } = useRecord(initialRecord?.id ?? null)
  const [recordId, setRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (record) {
      setFormData(record)
      setRecordId(record.id)
    }
  }, [record])

  const handleFieldChange = (value: unknown) => {
    if (!formData?.fields) return

    const newFields = value as { [key: string]: any }
    
    // Compare old and new values to track changes
    Object.entries(newFields).forEach(([fieldName, newValue]) => {
      const oldValue = formData.fields?.[fieldName]
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        setFieldChanges(prev => [...prev, {
          fieldName,
          oldValue,
          newValue,
          timestamp: new Date().toISOString()
        }])
      }
    })

    setFormData({
      ...formData,
      fields: newFields
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData?.fields || !fieldChanges.length || !formData.id) return

    setIsSaving(true)
    try {
      const webhookPayload = {
        type: 'updated' as const,
        data: {
          id: formData.id,
          ...formData.fields,
          updatedTime: new Date().toISOString(),
        },
        customerId: ensureAuth().customerId || '',
      }
      
      const { id: _, ...fieldsWithoutId } = formData.fields
      
      const finalPayload = {
        ...webhookPayload,
        data: {
          id: formData.id,
          ...fieldsWithoutId,
          updatedTime: new Date().toISOString(),
        }
      }
      
      console.log('Final Webhook Payload:', finalPayload)
      await sendToWebhook(finalPayload)

      await onSave(formData)
      setFieldChanges([])
      onClose()
    } catch (error) {
      console.error('Failed to save record:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const modifiedSchema = schema ? {
    ...schema,
    properties: Object.entries(schema.properties).reduce((acc, [key, value]) => {
      if (key === 'id') return acc
      return { ...acc, [key]: value }
    }, {})
  } : null

  const filteredFormData = formData?.fields ? {
    ...formData.fields,
    id: undefined
  } : null

  if (schemaError || recordError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Form</DialogTitle>
          </DialogHeader>
          <p className="text-red-500">
            {schemaError?.message || recordError?.message || 'Failed to load. Please try again.'}
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle>Edit Record - ID: {formData?.id}</DialogTitle>
          </div>
        </DialogHeader>
        {(schemaLoading || recordLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="py-4">
              {modifiedSchema && filteredFormData && (
                <DataInput
                  schema={modifiedSchema}
                  value={filteredFormData}
                  onChange={handleFieldChange}
                />
              )}
            </div>
            <DialogFooter className="mt-6 border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-red-700 dark:hover:bg-red-700 dark:hover:text-red-100" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100 hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-800 dark:hover:text-blue-100"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 