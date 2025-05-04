"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { getCurrentUser, getProfileById, getReportsByPatientId, getProfiles } from "@/lib/browser-storage"
import { generatePDF } from "@/lib/pdf-generator"

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

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

      // Get reports
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
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setIsViewOpen(true)
  }

  const handleDownloadReport = (report: any) => {
    const content = `
      # Medical Report: ${report.title}
      
      ## Doctor: ${report.doctorName}
      ## Date: ${formatDate(report.createdAt)}
      
      ### Description
      ${report.description || "No description provided"}
    `

    generatePDF(content, `report-${report.id}.pdf`)
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Medical Reports</h1>

        <Card>
          <CardHeader>
            <CardTitle>Your Medical Reports</CardTitle>
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
                          <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(report)}>
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

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                <p>{selectedReport?.doctorName || "Unknown Doctor"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p>{selectedReport && formatDate(selectedReport.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="whitespace-pre-wrap">{selectedReport?.description || "No description provided"}</p>
              </div>
              {selectedReport?.fileUrl && (
                <div className="mt-4">
                  <img
                    src={selectedReport.fileUrl || "/placeholder.svg"}
                    alt="Report"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => handleDownloadReport(selectedReport)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
