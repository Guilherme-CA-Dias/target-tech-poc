import { useEffect, useState } from 'react'
import { Record } from '@/types/record'

export function useRecord(recordId: string | null) {
  const [record, setRecord] = useState<Record | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchRecord() {
      if (!recordId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/records/${recordId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch record')
        }

        setRecord(data)
      } catch (err) {
        console.error('Error fetching record:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch record'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecord()
  }, [recordId])

  return { record, isLoading, error }
} 