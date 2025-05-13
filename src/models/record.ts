import mongoose, { Schema } from 'mongoose';

export interface IRecord {
  id: string;
  name: string;
  createdTime?: string;
  updatedTime?: string;
  uri?: string;
  fields?: {
    domain?: string;
    industry?: string;
    [key: string]: any;
  };
  recordType: string;
  customerId: string;
}

// Specify the database name
const dbName = 'local-deployments';

const RecordSchema = new Schema({
  id: String,
  customerId: String,
  recordType: String,
  fields: {
    type: Map,
    of: Schema.Types.Mixed
  },
  createdAt: Date,
  updatedAt: Date,
  createdTime: String,
  updatedTime: String,
  name: String,
  uri: String
}, {
  timestamps: true
});

// Compound index for efficient queries
RecordSchema.index({ customerId: 1, recordType: 1 });

// Connect to the specific database
const connection = mongoose.connection.useDb(dbName);

// This creates a 'records' collection in the local-deployments database
export const Record = connection.models.Record || connection.model<IRecord>('Record', RecordSchema); 