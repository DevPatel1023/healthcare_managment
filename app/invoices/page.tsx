"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCurrentUser, getProfileById, getInvoicesByPatientId, getProfiles } from "@/lib/browser-storage"
import { generatePDF } from "@/lib/pdf-generator"

export default function InvoicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

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

    if (profile.role !== "patient") {
      router.push("/dashboard")
      return
    }

    setProfileData(profile)

    // Get invoices
    const patientInvoices = getInvoicesByPatientId(user.id)

    // Enrich invoices with doctor data
    const allProfiles = getProfiles()
    const enrichedInvoices = patientInvoices.map((invoice) => {
      const doctorProfile = allProfiles.find((p) => p.id === invoice.doctorId)
      return {
        ...invoice,
        doctorName: doctorProfile?.fullName || "Unknown Doctor",
      }
    })

    setInvoices(enrichedInvoices)
    setLoading(false)
  }, [router])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "unpaid":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewOpen(true)
  }

  const handleDownloadInvoice = (invoice: any) => {
    const itemsList = invoice.items.map((item: any) => `${item.description}: ${formatCurrency(item.amount)}`).join("\n")

    const content = `
      # Invoice: ${invoice.invoiceNumber}
      
      ## Date: ${formatDate(invoice.createdAt)}
      ## Due Date: ${formatDate(invoice.dueDate)}
      ## Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
      
      ## Doctor: ${invoice.doctorName}
      
      ### Items
      ${itemsList}
      
      ### Summary
      Subtotal: ${formatCurrency(invoice.amount)}
      Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}
      Total: ${formatCurrency(invoice.totalAmount)}
    `

    generatePDF(content, `invoice-${invoice.invoiceNumber}.pdf`)
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">My Invoices</h1>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and manage your invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.doctorName}</TableCell>
                      <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
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
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                <p className="text-muted-foreground mb-4">You don't have any invoices yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invoice #{selectedInvoice?.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                  <p>{selectedInvoice?.doctorName || "Unknown Doctor"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge className={selectedInvoice && getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice?.status.charAt(0).toUpperCase() + selectedInvoice?.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p>{selectedInvoice && formatDate(selectedInvoice.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p>{selectedInvoice && formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice?.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{selectedInvoice && formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedInvoice?.taxRate}%)</span>
                  <span>{selectedInvoice && formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>{selectedInvoice && formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)}>
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
