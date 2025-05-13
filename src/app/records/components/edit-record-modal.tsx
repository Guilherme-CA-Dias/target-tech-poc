import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFieldSchema } from "@/hooks/use-field-schema"
import { Record } from "@/types/record"
import { Loader2 } from "lucide-react"
import { useRecord } from '@/hooks/use-record'

interface EditRecordModalProps {
  record: Record | null
  recordType: string | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedRecord: Record) => Promise<void>
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
  const { schema, isLoading: schemaLoading, error: schemaError } = useFieldSchema(recordType)
  const { record, isLoading: recordLoading, error: recordError } = useRecord(initialRecord?.id ?? null)

  useEffect(() => {
    if (record) {
      setFormData(record)
    }
  }, [record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save record:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: string) => {
    if (!formData) return

    let parsedValue = value
    // Try to parse the value as JSON if it looks like a JSON string
    if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
      try {
        JSON.parse(value)
        parsedValue = value // Keep it as string if it's valid JSON
      } catch {
        // If it's not valid JSON, keep the original value
        parsedValue = value
      }
    }

    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [fieldName]: parsedValue
      }
    })
  }

  const getFieldValue = (fieldName: string, value: any): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

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
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        {(schemaLoading || recordLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {schema && formData?.fields && Object.entries(schema.properties).map(([fieldName, fieldSchema]) => {
                if (['id', '_id', '__v', 'customerId'].includes(fieldName)) return null

                return (
                  <div key={fieldName} className="flex flex-col gap-2">
                    <Label htmlFor={fieldName} className="text-sm text-gray-500">
                      {fieldSchema.title}
                    </Label>
                    <Input
                      id={fieldName}
                      type={fieldSchema.type === 'number' ? 'number' : 'text'}
                      value={getFieldValue(fieldName, formData.fields[fieldName])}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full"
                      placeholder={fieldSchema.description}
                      disabled={fieldSchema.type === 'readonly'}
                    />
                  </div>
                )
              })}
            </div>
            <DialogFooter className="mt-6">
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