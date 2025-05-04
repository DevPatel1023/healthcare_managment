"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText, CreditCard } from "lucide-react"
import {
  getCurrentUser,
  getProfileById,
  getAppointmentsByDoctorId,
  getAppointmentsByPatientId,
  getProfiles,
} from "@/lib/browser-storage"
import { DashboardCharts } from "./dashboard-charts"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})

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

      setProfileData(profile)

      // Get appointments based on user role
      const userAppointments =
        profile.role === "doctor" ? getAppointmentsByDoctorId(user.id) : getAppointmentsByPatientId(user.id)

      // Enrich appointments with user data
      const allProfiles = getProfiles()
      const enrichedAppointments = userAppointments.map((appointment) => {
        if (profile.role === "doctor") {
          const patientProfile = allProfiles.find((p) => p.id === appointment.patientId)
          return {
            ...appointment,
            patients: { full_name: patientProfile?.fullName || "Unknown Patient" },
          }
        } else {
          const doctorProfile = allProfiles.find((p) => p.id === appointment.doctorId)
          return {
            ...appointment,
            doctors: { full_name: doctorProfile?.fullName || "Unknown Doctor" },
          }
        }
      })

      setAppointments(enrichedAppointments)

      // Calculate stats
      if (profile.role === "doctor") {
        const uniquePatientIds = [...new Set(userAppointments.map((a) => a.patientId))]
        setStats({
          appointments: userAppointments.length,
          patients: uniquePatientIds.length,
          surgeries: 3, // Placeholder
          roomVisits: 12, // Placeholder
        })
      } else {
        setStats({
          appointments: userAppointments.length,
          reports: 3, // Placeholder
          expenditure: 420.0, // Placeholder
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back, {profileData.fullName}!</h2>
          <p className="text-muted-foreground">
            We hope you're having a great day. Here's a quick overview of your{" "}
            {profileData.role === "doctor" ? "practice" : "health records and appointments"}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {profileData.role === "doctor" ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.appointments}+</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.patients}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Surgeries</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.surgeries}+</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Room Visits</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.roomVisits}+</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.appointments}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenditure</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.expenditure?.toFixed(2) || "0.00"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reports}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <DashboardCharts userRole={profileData.role} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment: any) => (
                    <div key={appointment.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium">
                          {profileData.role === "doctor"
                            ? appointment.patients?.full_name
                            : appointment.doctors?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          appointment.status === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appointments found.</p>
              )}
            </CardContent>
          </Card>

          {profileData.role === "doctor" ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {Array.from(new Set(appointments.map((a) => a.patients?.full_name)))
                      .slice(0, 5)
                      .map((patientName, index) => (
                        <div key={index} className="flex items-center border-b pb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="font-medium text-blue-600">
                              {(patientName as string)?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{patientName || "Unknown Patient"}</p>
                            <p className="text-sm text-muted-foreground">Last visit: Recently</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No patient data available.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Lisinopril 10mg</p>
                      <p className="text-sm text-muted-foreground">Once daily, with food</p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Morning</div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Aspirin 81mg</p>
                      <p className="text-sm text-muted-foreground">Once daily</p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Evening</div>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Vitamin D3 1000 IU</p>
                      <p className="text-sm text-muted-foreground">Once daily, with meal</p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Afternoon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
