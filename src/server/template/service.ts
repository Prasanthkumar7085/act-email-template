import mongoose from 'mongoose'
import { connectMongo } from '../db/mongo'
import { Template, type ITemplateDocument, type ITemplateVariable } from '../db/models/template'
import { Workspace } from '../db/models/workspace'
import { AppError } from '../errors'
import { uniqueSlug } from '../utils/slug'

export interface ListFilters {
  category?: string
  status?: 'draft' | 'published'
  search?: string
  page?: number
  limit?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

function sanitizeTemplate(t: any) {
  return {
    _id: t._id.toString(),
    workspaceId: t.workspaceId?.toString?.() ?? null,
    createdBy: t.createdBy?.toString?.() ?? null,
    name: t.name,
    slug: t.slug,
    categoryId: t.categoryId?.toString?.() ?? null,
    description: t.description ?? null,
    subjectLine: t.subjectLine ?? null,
    editorData: t.editorData ?? null,
    compiledHtml: t.compiledHtml ?? null,
    variables: (t.variables ?? []) as ITemplateVariable[],
    status: t.status,
    version: t.version ?? 1,
    exportCount: t.exportCount ?? 0,
    isPredefined: !!t.isPredefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

function ensureObjectId(id: string, label = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('INVALID_ID', `Invalid ${label} format`)
  }
}

// ── list ───────────────────────────────────────────────────────────────────────

export async function listTemplates(workspaceId: string, filters: ListFilters = {}) {
  await connectMongo()

  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20))

  const query: Record<string, unknown> = { workspaceId, deletedAt: null }
  if (filters.category) {
    if (mongoose.Types.ObjectId.isValid(filters.category)) {
      query.categoryId = filters.category
    } else {
      query.categoryId = null
    }
  }
  if (filters.status) query.status = filters.status
  if (filters.search && filters.search.trim()) {
    const re = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ name: re }, { description: re }, { subjectLine: re }]
  }

  const [items, total] = await Promise.all([
    Template.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Template.countDocuments(query),
  ])

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }

  return { items: items.map(sanitizeTemplate), meta }
}

// ── get ────────────────────────────────────────────────────────────────────────

export async function getTemplate(workspaceId: string, tplId: string) {
  await connectMongo()
  ensureObjectId(tplId, 'template id')

  const tpl = await Template.findOne({ _id: tplId, workspaceId, deletedAt: null }).lean()
  if (!tpl) throw AppError.notFound('Template')
  return sanitizeTemplate(tpl)
}

// ── create ─────────────────────────────────────────────────────────────────────

interface CreateInput {
  name: string
  categoryId?: string | null
  description?: string | null
  subjectLine?: string | null
  editorData?: Record<string, unknown> | null
  compiledHtml?: string | null
  variables?: ITemplateVariable[]
  status?: 'draft' | 'published'
}

export async function createTemplate(
  workspaceId: string,
  userId: string,
  data: CreateInput,
) {
  await connectMongo()

  const workspace = await Workspace.findById(workspaceId).lean()
  if (!workspace) throw AppError.notFound('Workspace')

  if (workspace.maxTemplates !== -1) {
    const used = await Template.countDocuments({ workspaceId, deletedAt: null })
    if (used >= workspace.maxTemplates) {
      throw AppError.planLimit('templates', workspace.maxTemplates)
    }
  }

  const slug = await uniqueSlug(data.name, async (s) =>
    !!(await Template.findOne({ workspaceId, slug: s })),
  )

  const tpl = await Template.create({
    workspaceId,
    createdBy: userId,
    name: data.name,
    slug,
    categoryId: data.categoryId ?? null,
    description: data.description ?? null,
    subjectLine: data.subjectLine ?? null,
    editorData: data.editorData ?? null,
    compiledHtml: data.compiledHtml ?? null,
    variables: data.variables ?? [],
    status: data.status ?? 'draft',
    version: 1,
  })

  return sanitizeTemplate(tpl.toObject())
}

// ── update ─────────────────────────────────────────────────────────────────────

interface UpdateInput {
  name?: string
  categoryId?: string | null
  description?: string | null
  subjectLine?: string | null
  editorData?: Record<string, unknown> | null
  compiledHtml?: string | null
  variables?: ITemplateVariable[]
  status?: 'draft' | 'published'
}

export async function updateTemplate(
  workspaceId: string,
  tplId: string,
  data: UpdateInput,
) {
  await connectMongo()
  ensureObjectId(tplId, 'template id')

  const existing = (await Template.findOne({
    _id: tplId,
    workspaceId,
    deletedAt: null,
  })) as ITemplateDocument | null
  if (!existing) throw AppError.notFound('Template')

  const update: Record<string, unknown> = {}

  if (data.name !== undefined && data.name !== existing.name) {
    update.name = data.name
    update.slug = await uniqueSlug(data.name, async (s) =>
      !!(await Template.findOne({ workspaceId, slug: s, _id: { $ne: tplId } })),
    )
  }
  if (data.categoryId !== undefined) update.categoryId = data.categoryId
  if (data.description !== undefined) update.description = data.description
  if (data.subjectLine !== undefined) update.subjectLine = data.subjectLine
  if (data.editorData !== undefined) update.editorData = data.editorData
  if (data.compiledHtml !== undefined) update.compiledHtml = data.compiledHtml
  if (data.variables !== undefined) update.variables = data.variables
  if (data.status !== undefined) update.status = data.status

  const tpl = await Template.findByIdAndUpdate(
    tplId,
    { $set: update, $inc: { version: 1 } },
    { new: true, runValidators: true },
  ).lean()
  if (!tpl) throw AppError.notFound('Template')
  return sanitizeTemplate(tpl)
}

// ── delete (soft) ──────────────────────────────────────────────────────────────

export async function deleteTemplate(workspaceId: string, tplId: string) {
  await connectMongo()
  ensureObjectId(tplId, 'template id')

  const tpl = await Template.findOneAndUpdate(
    { _id: tplId, workspaceId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean()
  if (!tpl) throw AppError.notFound('Template')
  return { _id: tpl._id.toString() }
}

// ── render helpers ─────────────────────────────────────────────────────────────

function applyVariables(html: string | null | undefined, variables: Record<string, string>) {
  if (!html) return ''
  return html.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) =>
    key in variables ? variables[key] : `{{${key}}}`,
  )
}

// ── preview ────────────────────────────────────────────────────────────────────

export async function previewTemplate(
  workspaceId: string,
  tplId: string,
  variables: Record<string, string>,
) {
  const tpl = await getTemplate(workspaceId, tplId)
  return { html: applyVariables(tpl.compiledHtml, variables) }
}

// ── export ─────────────────────────────────────────────────────────────────────

export async function exportTemplate(
  workspaceId: string,
  tplId: string,
  format: 'ejs' | 'mjml' | 'html',
  variables?: Record<string, string>,
) {
  await connectMongo()
  ensureObjectId(tplId, 'template id')

  const tpl = await Template.findOneAndUpdate(
    { _id: tplId, workspaceId, deletedAt: null },
    { $inc: { exportCount: 1 } },
    { new: true },
  ).lean()
  if (!tpl) throw AppError.notFound('Template')

  const output = tpl.compiledHtml ?? ''
  const rendered = variables && Object.keys(variables).length ? applyVariables(output, variables) : undefined

  return { output, format, ...(rendered !== undefined && { rendered }) }
}

// ── duplicate ──────────────────────────────────────────────────────────────────

export async function duplicateTemplate(
  workspaceId: string,
  userId: string,
  tplId: string,
) {
  await connectMongo()
  ensureObjectId(tplId, 'template id')

  const src = await Template.findOne({ _id: tplId, workspaceId, deletedAt: null }).lean()
  if (!src) throw AppError.notFound('Template')

  return createTemplate(workspaceId, userId, {
    name: `${src.name} (copy)`,
    categoryId: src.categoryId ? src.categoryId.toString() : null,
    description: src.description ?? null,
    subjectLine: src.subjectLine ?? null,
    editorData: (src.editorData ?? null) as Record<string, unknown> | null,
    compiledHtml: src.compiledHtml ?? null,
    variables: src.variables ?? [],
    status: 'draft',
  })
}

// ── gallery (predefined templates) ─────────────────────────────────────────────

export async function listGallery(category?: string) {
  await connectMongo()
  const query: Record<string, unknown> = { isPredefined: true, deletedAt: null }
  if (category && mongoose.Types.ObjectId.isValid(category)) query.categoryId = category
  const items = await Template.find(query).sort({ updatedAt: -1 }).lean()
  return items.map(sanitizeTemplate)
}

export async function copyFromGallery(
  workspaceId: string,
  userId: string,
  predefinedId: string,
) {
  await connectMongo()
  ensureObjectId(predefinedId, 'gallery template id')

  const src = await Template.findOne({
    _id: predefinedId,
    isPredefined: true,
    deletedAt: null,
  }).lean()
  if (!src) throw AppError.notFound('Gallery template')

  return createTemplate(workspaceId, userId, {
    name: src.name,
    categoryId: src.categoryId ? src.categoryId.toString() : null,
    description: src.description ?? null,
    subjectLine: src.subjectLine ?? null,
    editorData: (src.editorData ?? null) as Record<string, unknown> | null,
    compiledHtml: src.compiledHtml ?? null,
    variables: src.variables ?? [],
    status: 'draft',
  })
}
