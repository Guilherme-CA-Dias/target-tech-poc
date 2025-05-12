/**
 * Expected webhook payload structure:
 * {
 *   "recordType": "contacts",              // Type of record (e.g., "contacts", "deals")
 *   "data": {
 *     "id": "12345",                      // Unique identifier for the record
 *     "name": "John Doe",                 // Optional: Name of the record
 *     "fields": {                         // Optional: Custom fields
 *       "email": "john@example.com",
 *       "phone": "+1234567890",
 *       "status": "active"
 *       // ... any other custom fields
 *     },
 *     "createdTime": "2024-03-20T10:00:00Z",  // Optional: ISO timestamp
 *     "updatedTime": "2024-03-20T15:30:00Z",  // Optional: ISO timestamp
 *     // ... any other top-level fields from the integration
 *   }
 * }
 * 
 * Headers:
 * integration-app-token: JWT token containing customerId in the payload.id field
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Record } from '@/models/record';
import { RecordActionKey } from '@/lib/constants';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  iss: string;
  exp: number;
}

interface WebhookPayload {
  recordType: string;
  data: {
    id: string | number;
    name?: string;
    fields?: {
      [key: string]: any;
    };
    createdTime?: string;
    updatedTime?: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const token = request.headers.get('integration-app-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Decode the token (without verification since we trust the source)
    const decodedToken = jwt.decode(token) as JWTPayload;
    if (!decodedToken?.id) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    const customerId = decodedToken.id;
    const payload = await request.json() as WebhookPayload;
    
    console.log('Received webhook payload:', {
      customerId,
      recordId: payload.data.id,
      recordType: payload.recordType
    });

    await connectToDatabase();

    // Ensure we have the required fields
    if (!payload.data.id || !payload.recordType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add 'get-' prefix to recordType for database storage
    const dbRecordType = `get-${payload.recordType}` as RecordActionKey;

    // Check for existing record
    const existingRecord = await Record.findOne({
      id: payload.data.id.toString(),
      customerId
    });

    // Compare records to check if update is needed
    if (existingRecord) {
      // Convert both records to comparable objects
      const existingData = {
        ...existingRecord.toObject(),
        _id: undefined, // Exclude MongoDB _id from comparison
        __v: undefined, // Exclude version from comparison
        updatedTime: undefined // Exclude updatedTime from comparison
      };

      const newData = {
        ...payload.data,
        id: payload.data.id.toString(),
        customerId,
        recordType: dbRecordType,
        _id: undefined,
        __v: undefined,
        updatedTime: undefined
      };

      // Only update if data has changed
      if (JSON.stringify(existingData) === JSON.stringify(newData)) {
        console.log('Record unchanged, skipping update:', payload.data.id);
        return NextResponse.json({ 
          success: true,
          recordId: payload.data.id,
          _id: existingRecord._id,
          customerId,
          recordType: dbRecordType,
          status: 'unchanged'
        });
      }
    }

    // Update or insert the record with the modified recordType
    const result = await Record.findOneAndUpdate(
      { 
        id: payload.data.id.toString(),
        customerId 
      },
      {
        $set: {
          ...payload.data,
          id: payload.data.id.toString(),
          customerId,
          recordType: dbRecordType,
          updatedTime: new Date().toISOString()
        }
      },
      { 
        upsert: true,
        new: true
      }
    );

    console.log('Record updated:', {
      id: payload.data.id,
      _id: result._id,
      customerId,
      recordType: dbRecordType,
      status: existingRecord ? 'updated' : 'created'
    });

    return NextResponse.json({ 
      success: true,
      recordId: payload.data.id,
      _id: result._id,
      customerId,
      recordType: dbRecordType,
      status: existingRecord ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 