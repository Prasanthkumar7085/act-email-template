import mongoose, { Schema, type Document, type Types } from 'mongoose'

export interface IWorkspaceDocument extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  logo: string | null
  ownerId: Types.ObjectId
  brandColor: string | null
  brandFont: string | null
  plan: 'free' | 'pro' | 'business'
  maxTemplates: number
  maxMembers: number
  maxExportsMo: number
  exportsUsed: number
  exportsResetAt: Date | null
  status: 'active' | 'suspended'
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: null },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brandColor: { type: String, default: null },
    brandFont: { type: String, default: null },
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    maxTemplates: { type: Number, default: 10 },
    maxMembers: { type: Number, default: 2 },
    maxExportsMo: { type: Number, default: 50 },
    exportsUsed: { type: Number, default: 0 },
    exportsResetAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

workspaceSchema.index({ ownerId: 1 })

export const Workspace =
  (mongoose.models.Workspace as mongoose.Model<IWorkspaceDocument>) ??
  mongoose.model<IWorkspaceDocument>('Workspace', workspaceSchema)
