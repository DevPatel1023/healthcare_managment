
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from '@/types/supabase'

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Throw error if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables')
}

 export function createClient() {
   return createClientComponentClient<Database>()
 }

// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import type { Database } from "@/types/supabase"

// export function createClient() {
//   return createClientComponentClient<Database>()
// }
