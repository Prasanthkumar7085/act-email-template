import mongoose, { Schema, type Document, type Types } from 'mongoose'

export interface IRefreshTokenDocument extends Document {
  token: string
  userId: Types.ObjectId
  expiresAt: Date
  createdAt: Date
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshToken =
  (mongoose.models.RefreshToken as mongoose.Model<IRefreshTokenDocument>) ??
  mongoose.model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema)
