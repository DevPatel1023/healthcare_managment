"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import BookAppointmentForm from "./book-appointment-form"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser, getProfileById } from "@/lib/browser-storage"

export default function BookAppointmentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser()

      if (!user) {
        router.push("/")
        return
      }

      const profile = getProfileById(user.id)

      if (!profile) {
        router.push("/")
        return
      }

      if (profile.role !== "patient") {
        router.push("/dashboard")
        return
      }

      setProfileData(profile)

      try {
        // Fetch doctors from Supabase
        const { data: doctorsData, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            doctors!inner(specialization)
          `)
          .eq("role", "doctor")

        if (error) throw error

        if (doctorsData) {
          const formattedDoctors = doctorsData.map((doctor) => ({
            id: doctor.id,
            full_name: doctor.full_name,
            specialization: doctor.doctors[0]?.specialization || null,
          }))
          setDoctors(formattedDoctors)
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        // Fallback to empty array if there's an error
        setDoctors([])
      }

      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>
        <div className="max-w-2xl mx-auto">
          <BookAppointmentForm patientId={profileData.id} patientName={profileData.fullName} doctors={doctors} />
        </div>
      </div>
    </DashboardLayout>
  )
}
