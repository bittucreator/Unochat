import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client with the DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL!)

// Initialize the Drizzle ORM instance with the SQL client
export const db = drizzle(sql)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Use sql.query for parameterized queries instead of direct function call
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
