import { WebhookPayload } from '@/types/webhook'

interface WebhookPayloadData {
  id: string
  name?: string
  websiteUrl?: string
  phones?: Array<{
    value: string
    type: string
  }>
  primaryPhone?: string
  description?: string
  currency?: string
  industry?: string
  ownerId?: string
  primaryAddress?: {
    type?: string
    full?: string
    street?: string
    city?: string
    state?: string
    country?: string
    zip?: string
  }
  addresses?: Array<{
    type?: string
    full?: string
    street?: string
    city?: string
    state?: string
    country?: string
    zip?: string
  }>
  numberOfEmployees?: number
  createdTime?: string
  createdBy?: string
  updatedTime?: string
  updatedBy?: string
  lastActivityTime?: string
}

interface WebhookPayload {
  type: 'created' | 'updated' | 'deleted'
  data: WebhookPayloadData
  customerId: string
  internalContactId?: string
  externalContactId?: string
  recordType?: string
}

// Define webhook URL mapping by record type
const WEBHOOK_URLS = {
  'contacts': 'https://api.integration.app/webhooks/app-events/dcfd7885-04e7-4d42-9edb-aac833b1cd8f',
  'companies': 'https://api.integration.app/webhooks/app-events/72c713c0-03eb-4f52-92e7-3f44e9a1a50c',
  'leads': 'https://api.integration.app/webhooks/app-events/edbe3ab6-c49a-468b-93db-2db06c803999',
  'deals': 'https://api.integration.app/webhooks/app-events/a1e79ea3-9710-457f-9449-fb7ddf5de082',
  // Add a default URL as fallback
  'default': 'https://api.integration.app/webhooks/app-events/dcfd7885-04e7-4d42-9edb-aac833b1cd8f'
}

export async function sendToWebhook(payload: WebhookPayload): Promise<Response> {
  // Determine the record type from the payload
  // This assumes the recordType is available in the payload
  // If not, we'll need to modify the function parameters
  const recordType = payload.recordType?.toLowerCase() || 'default'
  
  // Get the appropriate webhook URL
  const webhookUrl = WEBHOOK_URLS[recordType] || WEBHOOK_URLS.default
  
  // Send the webhook
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send webhook: ${response.status} ${errorText}`)
  }

  return response
} 