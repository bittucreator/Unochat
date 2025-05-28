import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Returns integration status for the authenticated user
export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json([
      { key: "linear", connected: false },
      { key: "notion", connected: false },
    ]);
  }
  const { rows } = await pool.query(
    "SELECT linear_token, notion_token, notion_database_id FROM users WHERE email = $1",
    [session.user.email]
  );
  if (!rows.length) {
    return NextResponse.json([
      { key: "linear", connected: false },
      { key: "notion", connected: false },
    ]);
  }
  return NextResponse.json([
    { key: "linear", connected: !!rows[0].linear_token },
    { key: "notion", connected: !!rows[0].notion_token, notion_database_id: rows[0].notion_database_id },
  ]);
}
