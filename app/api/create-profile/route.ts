import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, role } = await request.json()

    // Create a direct Supabase client with service role key to bypass RLS
    const { createClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create profile
    const profileData = {
      id: userId,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert(profileData)

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: "Failed to create profile", details: profileError }, { status: 500 })
    }

    // Create doctor or patient record based on role
    if (role === "doctor") {
      const { error: doctorError } = await supabaseAdmin.from("doctors").insert({
        id: userId,
        specialization: "General",
      })

      if (doctorError) {
        console.error("Error creating doctor record:", doctorError)
        return NextResponse.json({ error: "Failed to create doctor record", details: doctorError }, { status: 500 })
      }
    } else {
      const { error: patientError } = await supabaseAdmin.from("patients").insert({
        id: userId,
      })

      if (patientError) {
        console.error("Error creating patient record:", patientError)
        return NextResponse.json({ error: "Failed to create patient record", details: patientError }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error in create-profile API:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error }, { status: 500 })
  }
}
