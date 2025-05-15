import { Record } from "@/types/record"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Pen, Trash2 } from "lucide-react"
import { EditRecordModal } from "./edit-record-modal"
import { useState } from "react"
import { sendToWebhook } from '@/lib/webhook-utils'
import { ensureAuth } from "@/lib/auth"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

interface RecordsTableProps {
  records: Record[]
  isLoading?: boolean
  isError?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  recordType: string | null
  onUpdateRecord: (record: Record) => Promise<void>
  onDeleteRecord?: (record: Record) => void
}

function getDisplayableFields(record: Record): { [key: string]: string } {
  const displayableFields: { [key: string]: string } = {}
  
  // Add customerId to excluded fields here too
  const excludedTopLevelFields = ['id', '_id', 'customerId', 'recordType', '__v', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'uri'];
  
  // Get string fields from top level
  Object.entries(record).forEach(([key, value]) => {
    if (
      typeof value === 'string' && 
      !key.startsWith('_') && 
      !excludedTopLevelFields.includes(key)
    ) {
      displayableFields[key] = value
    }
  })

  // Get string fields from nested fields object
  if (record.fields) {
    Object.entries(record.fields).forEach(([key, value]) => {
      if (
        typeof value === 'string' &&
        !key.startsWith('_') &&
        key !== 'id' // Exclude id from fields since we have it at top level
      ) {
        displayableFields[key] = value
      }
    })
  }

  return displayableFields
}

export function RecordsTable({
  records,
  isLoading = false,
  isError = false,
  onLoadMore,
  hasMore,
  recordType,
  onUpdateRecord,
  onDeleteRecord
}: RecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "-";
    }
  };

  if (isError) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          Error loading records. Please try again later.
        </p>
      </div>
    )
  }

  const renderFieldValue = (value: any) => {
    if (!value) return "-";
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  };

  const renderRecordFields = (record: Record) => {
    const excludedFields = ['id', '_id', 'customerId', 'recordType', '__v'];
    return Object.entries(record).map(([key, value]) => {
      if (excludedFields.includes(key)) return null;
      if (key === 'fields') {
        return Object.entries(value as object).map(([fieldKey, fieldValue]) => (
          <div key={fieldKey} className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-500 capitalize">{fieldKey}</span>
            <span className="text-sm leading-tight">{renderFieldValue(fieldValue)}</span>
          </div>
        ));
      }
      return (
        <div key={key} className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span className="text-sm leading-tight">{renderFieldValue(value)}</span>
        </div>
      );
    });
  };

  const handleDelete = async (record: Record) => {
    try {
      await sendToWebhook({
        type: 'deleted',
        data: {
          id: record.id,
          ...record.fields,
        },
        customerId: ensureAuth().customerId || '',
      })
      
      onDeleteRecord?.(record)
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  return (
    <div className="relative">
      <ScrollArea 
        className="h-[800px] w-full"
        scrollHideDelay={0}
      >
        <div className="space-y-3 p-4 pr-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-xl bg-sky-100/60 p-4 shadow-sm"
              >
                <Skeleton className="h-7 w-1/3 mb-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))
          ) : records.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No records found
            </div>
          ) : (
            records.map((record) => {
              const displayFields = getDisplayableFields(record)
              
              return (
                <div
                  key={`${record.id}-${record.customerId}`}
                  className="rounded-xl bg-sky-100/60 p-4 shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(record)
                        setIsEditModalOpen(true)
                      }}
                      className="p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                    >
                      <Pen className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setRecordToDelete(record)}
                      className="p-1.5 rounded-full bg-white/50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      ID: {record.id}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(displayFields).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-0.5">
                        <span className="text-sm text-gray-500 capitalize">{key}</span>
                        <span className="text-sm leading-tight">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
          {hasMore && !isLoading && (
            <div className="py-3 text-center">
              <button
                onClick={onLoadMore}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Load More
              </button>
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <EditRecordModal
        record={selectedRecord}
        recordType={recordType}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecord(null)
        }}
        onSave={onUpdateRecord}
      />

      <DeleteConfirmationDialog
        record={recordToDelete}
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
} 