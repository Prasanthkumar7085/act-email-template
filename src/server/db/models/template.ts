import mongoose, { Schema, type Document, type Types } from 'mongoose'

export interface ITemplateVariable {
  slug: string
  name: string
  type: string
  defaultValue: string
}

export interface ITemplateDocument extends Document {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId | null
  createdBy: Types.ObjectId | null
  name: string
  slug: string
  categoryId: Types.ObjectId | null
  description: string | null
  subjectLine: string | null
  editorData: Record<string, unknown> | null
  compiledHtml: string | null
  variables: ITemplateVariable[]
  status: 'draft' | 'published'
  version: number
  exportCount: number
  isPredefined: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const variableSchema = new Schema<ITemplateVariable>(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, default: 'string' },
    defaultValue: { type: String, default: '' },
  },
  { _id: false },
)

const templateSchema = new Schema<ITemplateDocument>(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'TemplateCategory', default: null },
    description: { type: String, default: null },
    subjectLine: { type: String, default: null },
    editorData: { type: Schema.Types.Mixed, default: null },
    compiledHtml: { type: String, default: null },
    variables: { type: [variableSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    version: { type: Number, default: 1 },
    exportCount: { type: Number, default: 0 },
    isPredefined: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

templateSchema.index({ workspaceId: 1, slug: 1 }, { unique: true, partialFilterExpression: { workspaceId: { $type: 'objectId' } } })
templateSchema.index({ workspaceId: 1, status: 1, updatedAt: -1 })
templateSchema.index({ isPredefined: 1, categoryId: 1 })

export const Template =
  (mongoose.models.Template as mongoose.Model<ITemplateDocument>) ??
  mongoose.model<ITemplateDocument>('Template', templateSchema)
