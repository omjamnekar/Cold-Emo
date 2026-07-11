import { MongoClient, Db } from "mongodb";
import { Collections } from "./collections.db"; // Import your collection names
import "dotenv/config"; // Must be the first import

class MongoDatabase {
  private client: MongoClient;
  private db?: Db;

  constructor() {
    // Check if we are in production, otherwise default to dev
    const connectionString =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_DATABASE!
        : process.env.DEV_DATABASE!;
    this.client = new MongoClient(connectionString);
  }

  async connect() {
    if (this.db) return this.db;

    await this.client.connect();

    // The database name is now part of the connection string URL
    this.db = this.client.db();

    await this.initializeCollections();
    console.log(`DB connected to: ${this.db.databaseName}`);
    return this.db;
  }

  async disconnect() {
    try {
      await this.client.close();
      this.db = undefined;
      console.log("DB disconnected");
    } catch (err) {
      console.error("Error disconnecting DB", err);
    }
  }

  private async initializeCollections() {
    const db = this.getDatabase();
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map((c) => c.name);

    for (const key in Collections) {
      const colName = Collections[key as keyof typeof Collections];

      if (!existingNames.includes(colName)) {
        await db.createCollection(colName);
        console.log(`Created collection: ${colName}`);
      }
    }
  }

  getDatabase(): Db {
    if (!this.db) throw new Error("Db not initialized");
    return this.db;
  }
}

export default new MongoDatabase();
