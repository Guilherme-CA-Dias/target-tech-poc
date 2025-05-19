# Integration Use Case Template

This is a template for an application showcasing integration capabilities using [Integration.app](https://integration.app). The app is built with Next.js and demonstrates how to implement user authentication, integration token generation, and records management.

## Prerequisites

- Node.js 18+ installed
- Integration.app workspace credentials (Workspace Key and Secret)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
# Copy the sample environment file
cp .env-sample .env
```

4. Edit `.env` and add your Integration.app credentials:

```env
INTEGRATION_APP_WORKSPACE_KEY=your_workspace_key_here
INTEGRATION_APP_WORKSPACE_SECRET=your_workspace_secret_here
MONGODB_URI=your_mongodb_connection_string
```

You can find these credentials in your Integration.app workspace settings.

5. Configure webhook endpoints:

Update the webhook URLs in `src/lib/webhook-utils.ts` with your own Integration.app webhook endpoints:

```typescript
const WEBHOOK_URLS = {
  'contacts': 'https://api.integration.app/webhooks/app-events/your-contacts-webhook-id',
  'companies': 'https://api.integration.app/webhooks/app-events/your-companies-webhook-id',
  'leads': 'https://api.integration.app/webhooks/app-events/your-leads-webhook-id',
  'deals': 'https://api.integration.app/webhooks/app-events/your-deals-webhook-id',
  'default': 'https://api.integration.app/webhooks/app-events/your-default-webhook-id'
}
```

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── records/          # Records CRUD endpoints
│   │   └── webhooks/         # Webhook handlers
│   └── records/              # Records UI pages and components
│       ├── components/       # Record-specific components
│       ├── create/           # Create record page
│       └── page.tsx          # Main records listing page
├── components/               # Shared UI components
│   └── ui/                   # Base UI components
├── hooks/                    # Custom React hooks
│   ├── use-field-schema.ts   # Schema fetching from Integration.app
│   ├── use-integration-config.ts # Integration configuration
│   └── use-records.ts        # Records data fetching and management
├── lib/                      # Utility functions
│   ├── auth.ts               # Authentication utilities
│   ├── constants.ts          # Application constants
│   ├── fetch-utils.ts        # Fetch helpers
│   └── webhook-utils.ts      # Webhook handling
└── types/                    # TypeScript type definitions
```

## Key Files

### Constants (`src/lib/constants.ts`)

Defines the record types supported by the application:

```typescript
export const RECORD_ACTIONS = [
  { key: 'get-leads', name: 'Leads' },
  { key: 'get-deals', name: 'Opportunities' },
  { key: 'get-contacts', name: 'Contacts' },
  { key: 'get-companies', name: 'Companies' }
];
```

### Webhook Utilities (`src/lib/webhook-utils.ts`)

Handles sending data to Integration.app webhooks based on record type:

```typescript
export async function sendToWebhook(payload: WebhookPayload): Promise<Response> {
  const recordType = payload.recordType?.toLowerCase() || 'default'
  const webhookUrl = WEBHOOK_URLS[recordType] || WEBHOOK_URLS.default
  
  // Send the webhook
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
```

### Field Schema Hook (`src/hooks/use-field-schema.ts`)

Fetches field schemas from Integration.app for dynamic form generation:

```typescript
export function useFieldSchema(recordType: string | null) {
  // Fetches schema from Integration.app based on record type
  // Used to dynamically generate form fields
}
```

### Records Hook (`src/hooks/use-records.ts`)

Manages record data fetching, pagination, and state:

```typescript
export function useRecords(actionKey: string | null, search: string = '') {
  // Handles fetching, pagination, and state management for records
}
```

## API Endpoints

The application provides several API endpoints:

### Authentication

- `GET /api/auth/token` - Generates an Integration.app token for the current user

### Records

- `GET /api/records` - Retrieves records based on action type and search query
- `POST /api/records` - Creates a new record
- `PUT /api/records/:id` - Updates an existing record
- `DELETE /api/records/:id` - Deletes a record
- `POST /api/records/import` - Imports records from external systems

## Template Features

### Authentication

The template implements a simple authentication mechanism using a randomly generated UUID as the customer ID. This simulates a real-world scenario where your application would have proper user authentication.

### Records Management

The template includes a complete implementation of records management:

- Create, read, update, and delete (CRUD) operations for records
- Dynamic form generation based on Integration.app schemas
- Field mapping configuration
- Webhook integration for real-time updates
- Infinite scrolling for large record sets
- Search functionality
- Record type filtering

### Integration.app Components

The template showcases the usage of various Integration.app React components:

- `DataInput` - Renders form fields based on dynamic schemas
- `useIntegrationApp` - Hook for accessing the Integration.app client

### Data Fetching

- SWR for efficient data fetching and caching
- Optimistic updates for better UX
- Proper error handling and loading states
- Infinite scroll implementation for pagination

## Customizing for Your Application

### Adding New Record Types

1. Update `RECORD_ACTIONS` in `src/lib/constants.ts`
2. Add webhook URL in `src/lib/webhook-utils.ts`
3. Create field mappings in your Integration.app workspace

### Modifying Webhook Behavior

The webhook system is designed to route events to different endpoints based on record type. To customize:

1. Update the `WEBHOOK_URLS` object in `src/lib/webhook-utils.ts`
2. Modify the `sendToWebhook` function if you need different payload structures

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## License

MIT
