import mongoose from 'mongoose'
import { env } from '../env'

declare global {
  // eslint-disable-next-line no-var
  var __mongoose_conn__:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined
}

const cache = globalThis.__mongoose_conn__ ?? { conn: null, promise: null }
globalThis.__mongoose_conn__ = cache

export async function connectMongo() {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(env().MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
