"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AppointmentCalendar from "./appointment-calendar"
import {
  getCurrentUser,
  getProfileById,
  getAppointmentsByDoctorId,
  getAppointmentsByPatientId,
  getProfiles,
} from "@/lib/browser-storage"

export default function AppointmentCalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
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

    setProfileData(profile)

    // Get appointments based on user role
    const userAppointments =
      profile.role === "doctor" ? getAppointmentsByDoctorId(user.id) : getAppointmentsByPatientId(user.id)

    // Enrich appointments with user data
    const allProfiles = getProfiles()
    const enrichedAppointments = userAppointments.map((appointment) => {
      // Make sure we're using consistent property names (camelCase)
      const formattedAppointment = {
        ...appointment,
        // Ensure we're using camelCase property names to match the interface
        appointmentDate: appointment.appointmentDate || appointment.appointment_date,
        appointmentTime: appointment.appointmentTime || appointment.appointment_time,
      }

      if (profile.role === "doctor") {
        const patientProfile = allProfiles.find((p) => p.id === appointment.patientId)
        return {
          ...formattedAppointment,
          patients: { full_name: patientProfile?.fullName || "Unknown Patient" },
        }
      } else {
        const doctorProfile = allProfiles.find((p) => p.id === appointment.doctorId)
        return {
          ...formattedAppointment,
          doctors: { profiles: { full_name: doctorProfile?.fullName || "Unknown Doctor" } },
        }
      }
    })

    setAppointments(enrichedAppointments)
    setLoading(false)
  }, [router])

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Appointment Calendar</h1>
        <AppointmentCalendar appointments={appointments} userRole={profileData.role} />
      </div>
    </DashboardLayout>
  )
}
