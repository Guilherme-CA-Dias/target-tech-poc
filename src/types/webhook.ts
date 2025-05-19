export interface WebhookPayloadData {
  id: string
  [key: string]: any
}

export interface WebhookPayload {
  type: 'created' | 'updated' | 'deleted'
  recordType?: string // Add recordType field
  data: WebhookPayloadData
  customerId: string
} 