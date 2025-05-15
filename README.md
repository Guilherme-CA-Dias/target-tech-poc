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

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
  - `/records` - Records management implementation
  - `/api` - Backend API routes for records and integration token management
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and helpers
- `/src/hooks` - Custom React hooks for data fetching and state management
- `/public` - Static assets

## Template Features

### Authentication

The template implements a simple authentication mechanism using a randomly generated UUID as the customer ID. This simulates a real-world scenario where your application would have proper user authentication. The customer ID is used to:

- Identify the user/customer in the integration platform
- Generate integration tokens for external app connections
- Associate records with specific customers

### Records Management

The template includes a complete implementation of records management:

- Create, read, update, and delete (CRUD) operations for records
- Integration.app components for form handling:
  - `DataInput` for dynamic form generation based on schemas
  - `FloatingPortalBoundary` for proper modal and popover handling
- Field mapping configuration
- Webhook integration for real-time updates
- Infinite scrolling for large record sets
- Search functionality
- Record type filtering

### Integration.app Components

The template showcases the usage of various Integration.app React components:

- `DataInput` - Renders form fields based on dynamic schemas
- `FloatingPortalBoundary` - Handles proper stacking context for modals
- `useIntegrationApp` - Hook for accessing the Integration.app client
- `useFieldSchema` - Custom hook for fetching and managing field schemas

### Data Fetching

- SWR for efficient data fetching and caching
- Optimistic updates for better UX
- Proper error handling and loading states
- Infinite scroll implementation for pagination

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Best Practices

- TypeScript for type safety
- React hooks for state management
- Proper component organization
- Error boundary implementation
- Responsive design with Tailwind CSS
- Accessibility considerations

## License

MIT
