import mongoose, { Schema, type Document } from 'mongoose'

export interface IRegistrationTokenDocument extends Document {
  token: string
  email: string
  expiresAt: Date
  createdAt: Date
}

const registrationTokenSchema = new Schema<IRegistrationTokenDocument>(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

registrationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const RegistrationToken =
  (mongoose.models.RegistrationToken as mongoose.Model<IRegistrationTokenDocument>) ??
  mongoose.model<IRegistrationTokenDocument>('RegistrationToken', registrationTokenSchema)
