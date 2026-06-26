import mongoose, { Schema, type Document } from 'mongoose'

export interface IOtpDocument extends Document {
  email: string
  code: string
  purpose: 'login' | 'register'
  attempts: number
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const otpSchema = new Schema<IOtpDocument>(
  {
    email: { type: String, required: true, lowercase: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'register'], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

otpSchema.index({ email: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Otp =
  (mongoose.models.Otp as mongoose.Model<IOtpDocument>) ??
  mongoose.model<IOtpDocument>('Otp', otpSchema)
