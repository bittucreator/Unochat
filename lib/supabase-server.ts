"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Create a server-side Supabase client
export async function createServerClient() {
  return createServerComponentClient<Database>({ cookies })
}
