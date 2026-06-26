import mongoose, { Schema, type Document } from 'mongoose'

export interface IOtpRateLimitDocument extends Document {
  email: string
  count: number
  expiresAt: Date
  createdAt: Date
}

const otpRateLimitSchema = new Schema<IOtpRateLimitDocument>(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

otpRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OtpRateLimit =
  (mongoose.models.OtpRateLimit as mongoose.Model<IOtpRateLimitDocument>) ??
  mongoose.model<IOtpRateLimitDocument>('OtpRateLimit', otpRateLimitSchema)
