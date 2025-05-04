"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Calendar, CreditCard, Activity, User, Stethoscope } from "lucide-react"
import {
  getCurrentUser,
  getProfileById,
  getAppointments,
  getProfiles,
  getPrescriptions,
  getReports,
  getInvoices,
} from "@/lib/browser-storage"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [stats, setStats] = useState<any>({})
  const [chartData, setChartData] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser()

      if (!user) {
        router.push("/")
        return
      }

      const profile = getProfileById(user.id)

      if (!profile || profile.role !== "admin") {
        router.push("/")
        return
      }

      setProfileData(profile)

      // Get all data
      const allAppointments = getAppointments()
      const allProfiles = getProfiles()
      const allPrescriptions = getPrescriptions()
      const allReports = getReports()
      const allInvoices = getInvoices()

      // Calculate stats
      const doctorProfiles = allProfiles.filter((p) => p.role === "doctor")
      const patientProfiles = allProfiles.filter((p) => p.role === "patient")

      const totalRevenue = allInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const paidRevenue = allInvoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0)

      const upcomingAppointments = allAppointments.filter((a) => a.status === "upcoming").length
      const completedAppointments = allAppointments.filter((a) => a.status === "completed").length
      const cancelledAppointments = allAppointments.filter((a) => a.status === "cancelled").length

      setStats({
        doctors: doctorProfiles.length,
        patients: patientProfiles.length,
        appointments: allAppointments.length,
        prescriptions: allPrescriptions.length,
        reports: allReports.length,
        revenue: totalRevenue,
        paidRevenue: paidRevenue,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      })

      // Generate chart data
      generateChartData(allAppointments, allInvoices, doctorProfiles, patientProfiles)

      setLoading(false)
    }

    const generateChartData = (appointments: any[], invoices: any[], doctors: any[], patients: any[]) => {
      // Appointments by month
      const appointmentsByMonth: Record<string, number> = {}
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Initialize all months with 0
      months.forEach((month) => {
        appointmentsByMonth[month] = 0
      })

      // Count appointments by month
      appointments.forEach((appointment) => {
        const date = new Date(appointment.appointmentDate)
        const month = months[date.getMonth()]
        appointmentsByMonth[month] = (appointmentsByMonth[month] || 0) + 1
      })

      // Revenue by month
      const revenueByMonth: Record<string, number> = {}

      // Initialize all months with 0
      months.forEach((month) => {
        revenueByMonth[month] = 0
      })

      invoices.forEach((invoice) => {
        const date = new Date(invoice.createdAt)
        const month = months[date.getMonth()]
        revenueByMonth[month] = (revenueByMonth[month] || 0) + invoice.totalAmount
      })

      // Appointment status distribution
      const appointmentStatusData = [
        { name: "Upcoming", value: appointments.filter((a) => a.status === "upcoming").length },
        { name: "Completed", value: appointments.filter((a) => a.status === "completed").length },
        { name: "Cancelled", value: appointments.filter((a) => a.status === "cancelled").length },
      ]

      // Department distribution
      const departmentData: Record<string, number> = {}

      doctors.forEach((doctor) => {
        const department = doctor.department || "Other"
        departmentData[department] = (departmentData[department] || 0) + 1
      })

      const departmentChartData = Object.entries(departmentData).map(([name, value]) => ({ name, value }))

      // Patient growth data (simulated)
      const patientGrowthData = months.slice(0, 6).map((month, index) => ({
        name: month,
        patients: Math.floor(patients.length * (0.7 + index * 0.05)),
      }))

      setChartData({
        appointmentsByMonth: Object.entries(appointmentsByMonth).map(([name, value]) => ({ name, value })),
        revenueByMonth: Object.entries(revenueByMonth).map(([name, value]) => ({ name, value: Math.round(value) })),
        appointmentStatusData,
        departmentChartData,
        patientGrowthData,
      })
    }

    fetchData()
  }, [router])

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the system administration dashboard. Here's an overview of the entire healthcare system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.doctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patients}</div>
            </CardContent>
          </Card>
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.revenue?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.patientGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="patients" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.appointmentStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.appointmentStatusData?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.appointmentsByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Appointments" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.revenueByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="value" name="Revenue (₹)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Doctors by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.departmentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.departmentChartData?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Doctors</span>
                  <span>{stats.doctors}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Patients</span>
                  <span>{stats.patients}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Appointments</span>
                  <span>{stats.appointments}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Upcoming Appointments</span>
                  <span>{stats.upcomingAppointments}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Completed Appointments</span>
                  <span>{stats.completedAppointments}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Cancelled Appointments</span>
                  <span>{stats.cancelledAppointments}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Prescriptions</span>
                  <span>{stats.prescriptions}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Reports</span>
                  <span>{stats.reports}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Revenue</span>
                  <span>₹{stats.revenue?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Collected Revenue</span>
                  <span>₹{stats.paidRevenue?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New Doctor Registered</p>
                    <p className="text-sm text-muted-foreground">Dr. Lisa Wong joined the platform</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">New Patient Registered</p>
                    <p className="text-sm text-muted-foreground">James Taylor created an account</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">System Update</p>
                    <p className="text-sm text-muted-foreground">New features added to the platform</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Received</p>
                    <p className="text-sm text-muted-foreground">Invoice #INV-2023-005 was paid</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
