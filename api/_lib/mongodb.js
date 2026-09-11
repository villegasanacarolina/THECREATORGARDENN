import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'the_creator_garden'

let cachedClientPromise = globalThis._tcgMongoClientPromise
let cachedIndexesPromise = globalThis._tcgMongoIndexesPromise

async function ensureIndexes(db) {
  if (cachedIndexesPromise) return cachedIndexesPromise

  cachedIndexesPromise = Promise.all([
    db.collection('pageviews').createIndex({ createdAt: -1 }),
    db.collection('pageviews').createIndex({ visitorId: 1, createdAt: -1 }),
    db.collection('pageviews').createIndex({ sessionId: 1, createdAt: 1 }),
    db.collection('pageviews').createIndex({ path: 1, createdAt: -1 }),
    db.collection('events').createIndex({ createdAt: -1 }),
    db.collection('events').createIndex({ visitorId: 1, createdAt: -1 }),
    db.collection('events').createIndex({ sessionId: 1, createdAt: 1 }),
    db.collection('events').createIndex({ type: 1, label: 1, createdAt: -1 }),
  ]).catch((err) => {
    // Analytics must keep working even if an index cannot be created because
    // of permissions or a transient MongoDB issue.
    console.error('analytics index setup error', err)
  })

  globalThis._tcgMongoIndexesPromise = cachedIndexesPromise
  return cachedIndexesPromise
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI no está configurada en las variables de entorno')
  }

  if (!cachedClientPromise) {
    const client = new MongoClient(uri)
    cachedClientPromise = client.connect()
    globalThis._tcgMongoClientPromise = cachedClientPromise
  }

  const client = await cachedClientPromise
  const db = client.db(dbName)
  ensureIndexes(db)
  return db
}
