"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import PatientsTable from "./patients-table"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser, getProfileById } from "@/lib/browser-storage"
import { isValidUUID } from "@/lib/uuid-utils"

export default function PatientsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])

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

      if (profile.role !== "doctor") {
        router.push("/dashboard")
        return
      }

      setProfileData(profile)

      try {
        // Since we're using browser storage with string IDs like "doctor-1",
        // we need to handle the case where the ID is not a valid UUID
        if (!isValidUUID(user.id)) {
          // If we're using browser storage, we can get dummy patients data
          const dummyPatients = [
            {
              id: "patient-1",
              full_name: "John Doe",
              phone: "123-456-7890",
              avatar_url: "/placeholder.svg?height=40&width=40",
              conditions: ["Hypertension", "Diabetes"],
            },
            {
              id: "patient-2",
              full_name: "Jane Smith",
              phone: "234-567-8901",
              avatar_url: "/placeholder.svg?height=40&width=40",
              conditions: ["Asthma"],
            },
            {
              id: "patient-3",
              full_name: "Robert Johnson",
              phone: "345-678-9012",
              avatar_url: "/placeholder.svg?height=40&width=40",
              conditions: ["Arthritis", "High Cholesterol"],
            },
            {
              id: "patient-4",
              full_name: "Emily Davis",
              phone: "456-789-0123",
              avatar_url: "/placeholder.svg?height=40&width=40",
              conditions: ["Migraine", "Anxiety"],
            },
            {
              id: "patient-5",
              full_name: "Michael Wilson",
              phone: "567-890-1234",
              avatar_url: "/placeholder.svg?height=40&width=40",
              conditions: ["Depression", "Insomnia"],
            },
          ]
          setPatients(dummyPatients)
          setLoading(false)
          return
        }

        // If we have a valid UUID, proceed with Supabase queries
        // Get all patients who have appointments with this doctor
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("doctor_id", user.id)
          .order("appointment_date", { ascending: false })

        if (appointmentsError) throw appointmentsError

        if (appointmentsData && appointmentsData.length > 0) {
          // Get unique patient IDs
          const uniquePatientIds = [...new Set(appointmentsData.map((a) => a.patient_id))]

          // Get patient details
          const { data: patientProfiles, error: patientsError } = await supabase
            .from("profiles")
            .select(`
              id,
              full_name,
              phone,
              avatar_url,
              patients!inner(id, patient_id)
            `)
            .in("id", uniquePatientIds)

          if (patientsError) throw patientsError

          // Get patient conditions
          const { data: patientConditions, error: conditionsError } = await supabase
            .from("patient_conditions")
            .select(`
              patient_id,
              conditions(name)
            `)
            .in("patient_id", uniquePatientIds)

          if (conditionsError) throw conditionsError

          // Combine the data
          const patientsWithConditions = patientProfiles.map((patient) => {
            const conditions = patientConditions
              .filter((pc) => pc.patient_id === patient.id)
              .map((pc) => pc.conditions.name)

            return {
              id: patient.id,
              full_name: patient.full_name,
              phone: patient.phone,
              avatar_url: patient.avatar_url,
              conditions: conditions,
            }
          })

          setPatients(patientsWithConditions)
        }
      } catch (error) {
        console.error("Error fetching patients:", error)
        // Fallback to dummy data if there's an error
        const dummyPatients = [
          {
            id: "patient-1",
            full_name: "John Doe",
            phone: "123-456-7890",
            avatar_url: "/placeholder.svg?height=40&width=40",
            conditions: ["Hypertension", "Diabetes"],
          },
          {
            id: "patient-2",
            full_name: "Jane Smith",
            phone: "234-567-8901",
            avatar_url: "/placeholder.svg?height=40&width=40",
            conditions: ["Asthma"],
          },
          {
            id: "patient-3",
            full_name: "Robert Johnson",
            phone: "345-678-9012",
            avatar_url: "/placeholder.svg?height=40&width=40",
            conditions: ["Arthritis", "High Cholesterol"],
          },
        ]
        setPatients(dummyPatients)
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
        <h1 className="text-3xl font-bold mb-8">Manage Patients</h1>
        <PatientsTable patients={patients} />
      </div>
    </DashboardLayout>
  )
}
