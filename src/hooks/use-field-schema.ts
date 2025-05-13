import { useIntegrationApp } from "@integration-app/react"
import { useState, useEffect } from "react"

interface FieldSchema {
  type: string
  title: string
  description?: string
  enum?: string[]
  format?: string
}

interface AppSchema {
  type: string
  properties: Record<string, FieldSchema>
}

interface FieldMappingResponse {
  appSchema: AppSchema
}

export function useFieldSchema(recordType: string | null) {
  const [schema, setSchema] = useState<AppSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const integrationApp = useIntegrationApp()

  useEffect(() => {
    async function fetchSchema() {
      if (!recordType) return

      setIsLoading(true)
      setError(null)

      try {
        // Get the first connection
        const connection = await integrationApp.connections.find()
        const firstConnection = connection.items?.[0]
        
        if (!firstConnection) {
          throw new Error('No connection found')
        }

        // Get field mapping for the record type
        const response = await integrationApp
          .connection(firstConnection.id)
          .fieldMapping(recordType.replace('get-', ''))
          .get() as FieldMappingResponse

        if (!response?.appSchema) {
          throw new Error('Invalid schema response')
        }

        setSchema(response.appSchema)
      } catch (err) {
        console.error('Error fetching field schema:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch schema'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchema()
  }, [recordType, integrationApp])

  return { schema, isLoading, error }
} 