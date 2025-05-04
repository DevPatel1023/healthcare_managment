"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Upload, Download, Eye } from "lucide-react"
import {
  getCurrentUser,
  getProfileById,
  getMedicalConditionsByPatientId,
  getReportsByPatientId,
  getProfiles,
} from "@/lib/browser-storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generatePDF } from "@/lib/pdf-generator"
import { useToast } from "@/components/ui/use-toast"

export default function MedicalRecordsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [conditions, setConditions] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

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

    if (profile.role === "patient") {
      // Get medical conditions
      const patientConditions = getMedicalConditionsByPatientId(user.id)
      setConditions(patientConditions)

      // Get medical reports
      const patientReports = getReportsByPatientId(user.id)

      // Enrich reports with doctor data
      const allProfiles = getProfiles()
      const enrichedReports = patientReports.map((report) => {
        const doctorProfile = allProfiles.find((p) => p.id === report.doctorId)
        return {
          ...report,
          doctorName: doctorProfile?.fullName || "Unknown Doctor",
        }
      })

      setReports(enrichedReports)
    } else {
      // For doctors, we'll implement this in a separate component
      setConditions([])
      setReports([])
    }

    setLoading(false)
  }, [router])

  const handleDownload = (report: any) => {
    const content = `
      # Medical Report: ${report.title}
      
      ## Patient Information
      **Name:** ${profileData.fullName}
      **Date:** ${formatDate(report.createdAt)}
      
      ## Doctor Information
      **Doctor:** ${report.doctorName}
      
      ## Report Details
      ${report.content || "No detailed content available for this report."}
      
      ## Recommendations
      ${report.recommendations || "No specific recommendations provided."}
    `

    generatePDF(content, `medical-report-${report.id}.pdf`)

    toast({
      title: "Download Started",
      description: "Your medical report is being downloaded.",
    })
  }

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate document upload
    toast({
      title: "Document Uploaded",
      description: "Your medical document has been successfully uploaded.",
    })

    setIsUploadDialogOpen(false)
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {profileData.role === "doctor" ? "Patient Medical Records" : "My Medical Records"}
          </h1>

          {profileData.role === "patient" && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Document</DialogTitle>
                  <DialogDescription>
                    Upload your medical documents, test results, or other health records.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="document-type" className="text-sm font-medium">
                      Document Type
                    </label>
                    <select
                      id="document-type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="lab-result">Lab Result</option>
                      <option value="prescription">Prescription</option>
                      <option value="medical-report">Medical Report</option>
                      <option value="imaging">Imaging</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="document-title" className="text-sm font-medium">
                      Document Title
                    </label>
                    <input
                      type="text"
                      id="document-title"
                      placeholder="Enter document title"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="document-file" className="text-sm font-medium">
                      File
                    </label>
                    <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-10">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="document-file"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Upload a file</span>
                            <input id="document-file" name="document-file" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Upload</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="conditions">Medical Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Medical Reports</CardTitle>
                <CardDescription>View and download your medical reports and test results</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Title</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.title}</TableCell>
                          <TableCell>{report.doctorName}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>{report.title}</DialogTitle>
                                    <DialogDescription>
                                      By {report.doctorName} on {formatDate(report.createdAt)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 space-y-4">
                                    <div>
                                      <h3 className="text-lg font-medium">Report Details</h3>
                                      <p className="mt-2">
                                        {report.content || "No detailed content available for this report."}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-medium">Recommendations</h3>
                                      <p className="mt-2">
                                        {report.recommendations || "No specific recommendations provided."}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
                    <p className="text-muted-foreground mb-4">You don't have any medical reports yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Medical Conditions</CardTitle>
                <CardDescription>View your diagnosed medical conditions and related notes</CardDescription>
              </CardHeader>
              <CardContent>
                {conditions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Condition</TableHead>
                        <TableHead>Diagnosed Date</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conditions.map((condition) => (
                        <TableRow key={condition.id}>
                          <TableCell className="font-medium">{condition.name}</TableCell>
                          <TableCell>{formatDate(condition.diagnosedAt)}</TableCell>
                          <TableCell>{condition.notes || "No notes available"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Conditions Found</h3>
                    <p className="text-muted-foreground mb-4">You don't have any diagnosed medical conditions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
