import { NextResponse } from 'next/server'
import { Record } from '@/models/record'
import mongoose from 'mongoose'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  try {
    // Ensure MongoDB connection
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }

    // Get and validate params
    const { params } = context
    const id = await params.id

    // Validate id parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    // Find record using Mongoose model with proper type casting
    const record = await Record.findOne({ 
      id: id.toString() 
    })

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