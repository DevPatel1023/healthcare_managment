"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Download, Plus } from "lucide-react"
import {
  getCurrentUser,
  getProfileById,
  getPrescriptionsByPatientId,
  getPrescriptionsByDoctorId,
  getProfiles,
} from "@/lib/browser-storage"
import { generatePDF } from "@/lib/pdf-generator"
import PrescriptionForm from "@/components/prescriptions/prescription-form"

export default function PrescriptionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false)

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

    // Get prescriptions based on user role
    if (profile.role === "patient") {
      const userPrescriptions = getPrescriptionsByPatientId(user.id)

      // Enrich prescriptions with doctor data
      const allProfiles = getProfiles()
      const enrichedPrescriptions = userPrescriptions.map((prescription) => {
        const doctorProfile = allProfiles.find((p) => p.id === prescription.doctorId)
        return {
          ...prescription,
          doctorName: doctorProfile?.fullName || "Unknown Doctor",
        }
      })

      setPrescriptions(enrichedPrescriptions)
    } else if (profile.role === "doctor") {
      const userPrescriptions = getPrescriptionsByDoctorId(user.id)

      // Enrich prescriptions with patient data
      const allProfiles = getProfiles()
      const enrichedPrescriptions = userPrescriptions.map((prescription) => {
        const patientProfile = allProfiles.find((p) => p.id === prescription.patientId)
        return {
          ...prescription,
          patientName: patientProfile?.fullName || "Unknown Patient",
        }
      })

      setPrescriptions(enrichedPrescriptions)
    }

    setLoading(false)
  }, [router, isPrescriptionFormOpen])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleDownloadPDF = (prescription: any) => {
    const name = profileData.role === "doctor" ? prescription.patientName : prescription.doctorName

    const medicationsList = prescription.medications
      .map((med: any) => `${med.name} - ${med.dosage}, ${med.frequency}, ${med.duration}`)
      .join("\n")

    const content = `
      # Prescription
      
      ## Date: ${formatDate(prescription.date)}
      
      ## ${profileData.role === "doctor" ? "Patient" : "Doctor"}: ${name}
      
      ### Medications
      ${medicationsList}
      
      ### Instructions
      ${prescription.instructions}
    `

    generatePDF(content, `prescription-${prescription.id}.pdf`)
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {profileData.role === "doctor" ? "Manage Prescriptions" : "My Prescriptions"}
          </h1>

          {profileData.role === "doctor" && (
            <Button onClick={() => setIsPrescriptionFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          )}
        </div>

        {profileData.role === "patient" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <Card key={prescription.id} className="overflow-hidden">
                  <CardHeader className="bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Pill className="h-5 w-5 mr-2 text-blue-600" />
                          Prescription
                        </CardTitle>
                        <CardDescription>{formatDate(prescription.date)}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                        <p>{prescription.doctorName}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Medications</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {prescription.medications.map((med: any) => (
                            <li key={med.id}>
                              <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency},{" "}
                              {med.duration}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Instructions</p>
                        <p>{prescription.instructions}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <Button variant="outline" className="w-full" onClick={() => handleDownloadPDF(prescription)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Prescriptions</h3>
                <p className="text-muted-foreground mb-4">You don't have any prescriptions yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="overflow-hidden">
                    <CardHeader className="bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <Pill className="h-5 w-5 mr-2 text-blue-600" />
                            Prescription
                          </CardTitle>
                          <CardDescription>{formatDate(prescription.date)}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Patient</p>
                          <p>{prescription.patientName}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Medications</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {prescription.medications.map((med: any) => (
                              <li key={med.id}>
                                <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency},{" "}
                                {med.duration}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Instructions</p>
                          <p>{prescription.instructions}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t">
                      <Button variant="outline" className="w-full" onClick={() => handleDownloadPDF(prescription)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Prescriptions</h3>
                <p className="text-muted-foreground mb-4">You haven't created any prescriptions yet.</p>
                <Button onClick={() => setIsPrescriptionFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Prescription
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {profileData.role === "doctor" && (
        <PrescriptionForm
          doctorId={profileData.id}
          open={isPrescriptionFormOpen}
          onOpenChange={setIsPrescriptionFormOpen}
        />
      )}
    </DashboardLayout>
  )
}
