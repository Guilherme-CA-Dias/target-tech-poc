import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationClient } from '@/lib/integration-app-client';
import { Record } from '@/models/record';
import { connectToDatabase } from '@/lib/mongodb';
import { RECORD_ACTIONS } from '@/lib/constants';

interface WebhookEvent {
  eventType: 'connection.created';
  data: {
    connection: {
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        fields: Record<string, any>;
        createdAt: string;
        lastActiveAt: string;
      };
      integrationId: string;
      integration: {
        id: string;
        key: string;
        name: string;
        authType: string;
        parametersSchema: Record<string, any>;
        hasDefaultParameters: boolean;
        hasMissingParameters: boolean;
        hasDocumentation: boolean;
        hasOperations: boolean;
        baseUri: string;
        logoUri: string;
      };
      credentials: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      lastActiveAt: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Log the raw request body
    const rawBody = await request.text();
    console.log('Raw webhook payload:', rawBody);

    // Parse the JSON after logging
    const event = JSON.parse(rawBody) as WebhookEvent;
    
    console.log('Parsed webhook event:', {
      eventType: event.eventType,
      connectionId: event.data.connection.id,
      userId: event.data.connection.userId,
      userName: event.data.connection.user.name,
      integrationKey: event.data.connection.integration.key,
      timestamp: new Date().toISOString()
    });

    if (event.eventType !== 'connection.created') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const client = await getIntegrationClient({ 
      customerId: event.data.connection.userId,
      customerName: event.data.connection.user.name 
    });
    const results = [];

    const connectionId = event.data.connection.id;

    // Import records for each action type
    for (const action of RECORD_ACTIONS) {
      try {
        let allRecords: any[] = [];
        let hasMoreRecords = true;
        let currentCursor: string | null = null;

        // Fetch all pages of records for this action
        while (hasMoreRecords) {
          const result = await client
            .connection(connectionId)
            .action(action.key)
            .run(currentCursor ? { cursor: currentCursor } : null);
          
          const records = result.output.records || [];
          allRecords = [...allRecords, ...records];

          // Save batch to MongoDB
          if (records.length > 0) {
            const recordsToSave = records.map(record => ({
              ...record,
              customerId: event.data.connection.userId,
              recordType: action.key,
            }));

            await Promise.all(recordsToSave.map(record => 
              Record.updateOne(
                { id: record.id, customerId: event.data.connection.userId },
                record,
                { upsert: true }
              )
            ));
          }

          currentCursor = result.output.cursor;
          hasMoreRecords = !!currentCursor;
        }

        results.push({
          actionKey: action.key,
          recordsCount: allRecords.length
        });

      } catch (error) {
        console.error(`Error importing ${action.key}:`, error);
        results.push({
          actionKey: action.key,
          error: 'Failed to import'
        });
      }
    }

    return NextResponse.json({
      success: true,
      connectionId,
      integrationKey: event.data.connection.integration.key,
      results
    });

  } catch (error) {
    console.error('Error in import-all:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 