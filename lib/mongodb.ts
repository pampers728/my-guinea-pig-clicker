import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not defined - MongoDB features will be disabled")
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

if (process.env.MONGODB_URI) {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
}

export default clientPromise
