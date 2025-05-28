import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Pool } from "@neondatabase/serverless";
import { authOptions } from "../../../../../lib/authOptions";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Disconnect Linear integration for the authenticated user
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Remove Linear token from user in DB
  await pool.query(
    "UPDATE users SET linear_token = NULL WHERE email = $1",
    [session.user.email]
  );
  return NextResponse.json({ success: true });
}
