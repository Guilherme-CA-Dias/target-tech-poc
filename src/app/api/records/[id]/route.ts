import { NextResponse } from 'next/server'
import { Record } from '@/models/record'
import mongoose from 'mongoose'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure MongoDB connection
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    // Find record using Mongoose model
    const record = await Record.findOne({ id: params.id })

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch record' },
      { status: 500 }
    )
  }
} 