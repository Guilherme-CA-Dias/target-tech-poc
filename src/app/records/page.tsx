"use client"

import { RecordsTable } from "./components/records-table"
import { useRecords } from "@/hooks/use-records"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, Search, Settings } from "lucide-react"
import { useState } from "react"
import { Select } from "@/components/ui/select"
import { RecordActionKey, RECORD_ACTIONS } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { useIntegrationConfig } from "@/hooks/use-integration-config"

export default function RecordsPage() {
  const [selectedAction, setSelectedAction] = useState<RecordActionKey | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { openFieldMappings } = useIntegrationConfig()
  const { records, isLoading, hasMore, loadMore, importRecords, isImporting } = useRecords(
    selectedAction || null,
    searchQuery
  );

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Records</h1>
        <p className="text-muted-foreground mt-2">
          Select a record type to view and manage your records
        </p>
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
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button 
          onClick={() => selectedAction && openFieldMappings(selectedAction)}
          disabled={!selectedAction}
          variant="secondary"
          className="h-10 whitespace-nowrap"
        >
          <Settings className="mr-2 h-4 w-4" />
          Field Mappings
        </Button>

        <Button 
          onClick={() => importRecords()} 
          disabled={!selectedAction || isImporting}
          variant="default"
          className="h-10 whitespace-nowrap"
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
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
} 