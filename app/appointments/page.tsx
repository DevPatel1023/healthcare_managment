"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User, Plus, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  getCurrentUser,
  getProfileById,
  getAppointmentsByDoctorId,
  getAppointmentsByPatientId,
  getProfiles,
  addAppointment,
} from "@/lib/browser-storage"
import { useToast } from "@/components/ui/use-toast"

export default function AppointmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    date: "",
    time: "",
    duration: "30",
    type: "check-up",
    notes: "",
  })

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
    let userAppointments = []
    if (profile.role === "doctor") {
      userAppointments = getAppointmentsByDoctorId(user.id)

      // Get all patients for the doctor's booking modal
      const allProfiles = getProfiles()
      const patientProfiles = allProfiles.filter((p) => p.role === "patient")
      setPatients(patientProfiles)
    } else if (profile.role === "patient") {
      userAppointments = getAppointmentsByPatientId(user.id)
    }

    // Enrich appointments with doctor/patient data
    const allProfiles = getProfiles()
    const enrichedAppointments = userAppointments.map((appointment) => {
      const otherPersonId = profile.role === "doctor" ? appointment.patientId : appointment.doctorId
      const otherPerson = allProfiles.find((p) => p.id === otherPersonId)

      return {
        ...appointment,
        otherPersonName: otherPerson?.fullName || "Unknown",
        otherPersonAvatar: otherPerson?.avatarUrl || "",
      }
    })

    setAppointments(enrichedAppointments)
    setLoading(false)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewAppointment((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewAppointment((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const currentUser = getCurrentUser()

    const appointment = {
      id: `app-${Date.now()}`,
      doctorId: currentUser?.id || "",
      patientId: newAppointment.patientId,
      date: newAppointment.date,
      time: newAppointment.time,
      duration: Number.parseInt(newAppointment.duration),
      type: newAppointment.type,
      notes: newAppointment.notes,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }

    addAppointment(appointment)

    // Update the local state with the new appointment
    const patient = patients.find((p) => p.id === newAppointment.patientId)

    setAppointments((prev) => [
      ...prev,
      {
        ...appointment,
        otherPersonName: patient?.fullName || "Unknown",
        otherPersonAvatar: patient?.avatarUrl || "",
      },
    ])

    toast({
      title: "Appointment Booked",
      description: "The appointment has been successfully scheduled.",
    })

    // Reset form and close modal
    setNewAppointment({
      patientId: "",
      date: "",
      time: "",
      duration: "30",
      type: "check-up",
      notes: "",
    })
    setIsBookingModalOpen(false)
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "rescheduled",
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "cancelled",
  )

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Appointments</h1>

          {profileData.role === "doctor" && (
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>Schedule a new appointment with a patient.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBookAppointment} className="space-y-4 pt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select
                      name="patientId"
                      value={newAppointment.patientId}
                      onValueChange={(value) => handleSelectChange("patientId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={newAppointment.date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        type="time"
                        id="time"
                        name="time"
                        value={newAppointment.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        name="duration"
                        value={newAppointment.duration}
                        onValueChange={(value) => handleSelectChange("duration", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="type">Appointment Type</Label>
                      <Select
                        name="type"
                        value={newAppointment.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check-up">Check-up</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Add any notes or special instructions"
                      value={newAppointment.notes}
                      onChange={handleInputChange}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Book Appointment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>View and manage your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{profileData.role === "doctor" ? "Patient" : "Doctor"}</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              {appointment.otherPersonName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {formatDate(appointment.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {formatTime(appointment.time)}
                            </div>
                          </TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
                    <p className="text-muted-foreground mb-4">
                      {profileData.role === "doctor"
                        ? "You don't have any upcoming appointments with patients."
                        : "You don't have any upcoming appointments scheduled."}
                    </p>
                    {profileData.role === "patient" && (
                      <Button onClick={() => router.push("/book-appointment")}>Book an Appointment</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>View your appointment history</CardDescription>
              </CardHeader>
              <CardContent>
                {pastAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{profileData.role === "doctor" ? "Patient" : "Doctor"}</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              {appointment.otherPersonName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {formatDate(appointment.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {formatTime(appointment.time)}
                            </div>
                          </TableCell>
                          <TableCell>{appointment.type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Calendar className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Past Appointments</h3>
                    <p className="text-muted-foreground mb-4">You don't have any past appointment records.</p>
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
