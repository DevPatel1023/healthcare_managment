"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { FileText } from "lucide-react"
import { getCurrentUser, getProfileById, getProfiles, addReport, generateId } from "@/lib/browser-storage"

export default function CreateReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportData, setReportData] = useState({
    title: "",
    patientId: "",
    description: "",
    fileUrl: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser()

      if (!user) {
        router.push("/")
        return
      }

      const profile = getProfileById(user.id)

      if (!profile || profile.role !== "doctor") {
        router.push("/dashboard")
        return
      }

      setProfileData(profile)

      // Get all patients
      const allProfiles = getProfiles()
      const patientProfiles = allProfiles.filter((p) => p.role === "patient")
      setPatients(patientProfiles)

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReportData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setReportData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate inputs
      if (!reportData.title || !reportData.patientId || !reportData.description) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create report
      const newReport = {
        id: generateId("report-"),
        title: reportData.title,
        patientId: reportData.patientId,
        doctorId: profileData.id,
        description: reportData.description,
        fileUrl: reportData.fileUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add to storage
      addReport(newReport)

      // Show success message
      toast({
        title: "Report created",
        description: "The medical report has been created successfully.",
      })

      // Reset form
      setReportData({
        title: "",
        patientId: "",
        description: "",
        fileUrl: "",
      })

      // Redirect to reports list
      router.push("/reports")
    } catch (error) {
      console.error("Error creating report:", error)
      toast({
        title: "Error creating report",
        description: "There was an error creating the report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Create Medical Report</h1>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>New Medical Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={reportData.title}
                  onChange={handleInputChange}
                  placeholder="Enter report title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select value={reportData.patientId} onValueChange={(value) => handleSelectChange("patientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Report Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={reportData.description}
                  onChange={handleInputChange}
                  placeholder="Enter detailed report description"
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">Image URL (Optional)</Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  value={reportData.fileUrl}
                  onChange={handleInputChange}
                  placeholder="Enter image URL if available"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Creating Report..."
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
