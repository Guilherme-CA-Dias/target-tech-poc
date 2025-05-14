"use client"

import { RecordsTable } from "./components/records-table"
import { useRecords } from "@/hooks/use-records"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, Search, Settings, Plus } from "lucide-react"
import { useState } from "react"
import { Select } from "@/components/ui/select"
import { RecordActionKey, RECORD_ACTIONS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { useIntegrationConfig } from "@/hooks/use-integration-config"
import { Record } from "@/types/record"
import { useRouter } from "next/navigation"
import { CreateRecordModal } from "./components/create-record-modal"

export default function RecordsPage() {
  const [selectedAction, setSelectedAction] = useState<RecordActionKey | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { openFieldMappings } = useIntegrationConfig()
  const { 
    records, 
    isLoading, 
    hasMore, 
    loadMore, 
    importRecords, 
    isImporting, 
    isError,
    setRecords
  } = useRecords(
    selectedAction || null,
    searchQuery
  );
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleUpdateRecord = async (updatedRecord: Record) => {
    console.log('Updating record:', updatedRecord)
  }

  const handleDeleteRecord = async (record: Record) => {
    // Update UI optimistically
    setRecords((prev: Record[]) => prev.filter((r: Record) => r.id !== record.id))
  }

  const handleCreateRecord = (newRecord: Record) => {
    records.unshift(newRecord)
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="text-muted-foreground mt-2">
            Select a record type to view and manage your records
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedAction}
          className="bg-green-100 text-green-700 hover:bg-green-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Record
        </Button>
      </div>

      {/* Record Type Selection and Search */}
      <div className="grid gap-4 md:grid-cols-[1.5fr,1.5fr,auto,auto] items-center">
        <Select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value as RecordActionKey)}
          className="w-full"
        >
          <option value="">Select type</option>
          {RECORD_ACTIONS.map((action) => (
            <option key={action.key} value={action.key}>
              {action.name}
            </option>
          ))}
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 w-full rounded-full bg-gray-100/70 border-transparent placeholder:text-gray-400 focus:border-gray-200 focus:bg-gray-100/90 focus-visible:ring-gray-200/70 dark:bg-gray-800/50 dark:focus:bg-gray-800/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => selectedAction && openFieldMappings(selectedAction)}
          disabled={!selectedAction}
          className="px-4 py-2 rounded-md font-medium transition-colors bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 hover:bg-green-200 hover:text-green-800 dark:hover:bg-green-800 dark:hover:text-green-100"
        >
          <Settings className="mr-2 h-4 w-4" />
          Field Mappings
        </Button>

        <Button 
          onClick={() => importRecords()} 
          disabled={!selectedAction || isImporting}
          className="px-4 py-2 rounded-md font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100 hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-800 dark:hover:text-blue-100"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Import Records
            </>
          )}
        </Button>
      </div>

      {/* Records Table */}
      <div className="mt-6">
        <RecordsTable 
          records={records}
          isLoading={isLoading}
          isError={isError}
          hasMore={hasMore}
          onLoadMore={loadMore}
          recordType={selectedAction}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>

      <CreateRecordModal
        recordType={selectedAction}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreateRecord}
      />
    </div>
  );
} 