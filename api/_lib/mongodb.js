import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'the_creator_garden'

// En serverless, cada "invocación fría" podría abrir una conexión nueva si no
// la cacheamos. globalThis persiste entre invocaciones dentro del mismo
// contenedor "caliente" de Vercel, así que reusamos la misma conexión.
let cachedClientPromise = globalThis._tcgMongoClientPromise

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
  return client.db(dbName)
}
