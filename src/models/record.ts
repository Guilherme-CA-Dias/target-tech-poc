import mongoose from 'mongoose';

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

const recordSchema = new mongoose.Schema<IRecord>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdTime: String,
    updatedTime: String,
    uri: String,
    fields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recordType: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
recordSchema.index({ customerId: 1, recordType: 1 });

// Connect to the specific database
const connection = mongoose.connection.useDb(dbName);

// This creates a 'records' collection in the local-deployments database
export const Record = connection.models.Record || connection.model<IRecord>('Record', recordSchema); 