import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.server";

let queryClient: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * Server-only lazy connection.
 * Importing CreditCore does not require a database connection, which keeps
 * tests/builds deterministic until persistence is explicitly enabled.
 */
export function getDatabase() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      "DATABASE_URL is not configured. Add it to .env.local before enabling PostgreSQL persistence.",
    );
  }

  if (!queryClient) {
    queryClient = postgres(process.env.DATABASE_URL, {
      max: 5,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  if (!database) {
    database = drizzle(queryClient, { schema });
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (queryClient) {
    await queryClient.end({ timeout: 5 });
    queryClient = undefined;
    database = undefined;
  }
}
