import mongoose, { Schema, type Document, type Types } from 'mongoose'
import type { Role } from '../../constants'

export interface IMemberDocument extends Document {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  userId: Types.ObjectId
  role: Role
  status: 'active' | 'invited'
  inviteToken: string | null
  joinedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const memberSchema = new Schema<IMemberDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'manager'], required: true },
    status: { type: String, enum: ['active', 'invited'], default: 'invited' },
    inviteToken: { type: String },
    joinedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true })
memberSchema.index({ userId: 1, status: 1 })
memberSchema.index({ inviteToken: 1 }, { unique: true, sparse: true })

export const WorkspaceMember =
  (mongoose.models.WorkspaceMember as mongoose.Model<IMemberDocument>) ??
  mongoose.model<IMemberDocument>('WorkspaceMember', memberSchema)
