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
}

export async function sendToWebhook(payload: WebhookPayload) {
  const response = await fetch('https://api.integration.app/webhooks/app-events/dcfd7885-04e7-4d42-9edb-aac833b1cd8f', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.statusText}`)
  }

  return response.json()
} 