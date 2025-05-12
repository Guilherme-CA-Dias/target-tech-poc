import { useIntegrationApp } from "@integration-app/react"

export function useIntegrationConfig() {
  const integrationApp = useIntegrationApp()

  const getFirstConnection = async () => {
    try {
      const connectionsResponse = await integrationApp.connections.find()
      const firstConnection = connectionsResponse.items?.[0]
      
      if (!firstConnection) {
        throw new Error('No connection found')
      }

      return firstConnection
    } catch (error) {
      console.error("Failed to get connection:", error)
      return null
    }
  }

  const openFieldMappings = async (actionKey: string) => {
    try {
      const connection = await getFirstConnection()
      if (!connection) return

      await integrationApp
        .connection(connection.id)
        .fieldMapping(actionKey.replace('get-', ''))
        .openConfiguration()
    } catch (error) {
      console.error("Failed to open field mappings:", error)
    }
  }

  return {
    openFieldMappings
  }
} 