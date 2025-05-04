import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url))
      }

      // Get the user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Create a direct Supabase client with service role key to bypass RLS
        const { createClient } = await import("@supabase/supabase-js")
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          },
        )

        // Check if the user already has a profile
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single()

        // If no profile exists, create one using the user's metadata
        if (!existingProfile) {
          console.log("Creating profile for user:", session.user.id)

          const profileData = {
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || "User",
            role: session.user.user_metadata.role || "patient",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { error: profileError } = await supabaseAdmin.from("profiles").insert(profileData)

          if (profileError) {
            console.error("Error creating profile with admin client:", profileError)
            return NextResponse.redirect(
              new URL(`/?error=${encodeURIComponent("Failed to create profile")}`, request.url),
            )
          }

          // Create doctor or patient record based on role
          const role = session.user.user_metadata.role

          if (role === "doctor") {
            const { error: doctorError } = await supabaseAdmin.from("doctors").insert({
              id: session.user.id,
              specialization: "General",
            })

            if (doctorError) {
              console.error("Error creating doctor record:", doctorError)
            }
          } else {
            const { error: patientError } = await supabaseAdmin.from("patients").insert({
              id: session.user.id,
            })

            if (patientError) {
              console.error("Error creating patient record:", patientError)
            }
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent("An unexpected error occurred")}`, request.url),
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
