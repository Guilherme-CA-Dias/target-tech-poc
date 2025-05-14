"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useFieldSchema } from "@/hooks/use-field-schema"
import { Record } from "@/types/record"
import { Loader2, ArrowLeft } from "lucide-react"
import { DataInput, DataSchema, ComboBox, ComboBoxOption } from "@integration-app/react"
import { sendToWebhook } from '@/lib/webhook-utils'
import { ensureAuth } from "@/lib/auth"
import { useSearchParams } from "next/navigation"

export default function CreateRecordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordType = searchParams.get('type')
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Record['fields']>({})
  const { schema, isLoading: schemaLoading, error: schemaError } = useFieldSchema(recordType)

  const handleFieldChange = (value: unknown) => {
    setFormData(value as Record['fields'])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !recordType) return

    setIsSaving(true)
    try {
      await sendToWebhook({
        type: 'created',
        data: {
          ...formData,
          createdTime: new Date().toISOString(),
        },
        customerId: ensureAuth().customerId || '',
      })

      router.push('/records')
    } catch (error) {
      console.error('Failed to create record:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!recordType) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          No record type selected
        </h1>
        <p className="mt-2 text-muted-foreground">
          Please select a record type from the records page
        </p>
        <Button
          onClick={() => router.push('/records')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
      </div>
    )
  }

  if (schemaError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight text-red-600">
          Error Loading Form
        </h1>
        <p className="mt-2 text-red-500">
          {schemaError.message || 'Failed to load. Please try again.'}
        </p>
        <Button
          onClick={() => router.push('/records')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Records
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/records')}
          variant="outline"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Record</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create a new record
          </p>
        </div>
      </div>

      {schemaLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="min-h-[500px]">
            {schema && (
              <DataInput
                schema={schema}
                value={formData}
                onChange={handleFieldChange}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={() => router.push('/records')}
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
          </div>
        </form>
      )}
    </div>
  )
} 