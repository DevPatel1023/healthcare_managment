"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"

interface DashboardChartsProps {
  userRole: string
}

export function DashboardCharts({ userRole }: DashboardChartsProps) {
  // Sample data for doctor's dashboard
  const doctorData = [
    { name: "Jan", appointments: 45, patients: 30 },
    { name: "Feb", appointments: 52, patients: 35 },
    { name: "Mar", appointments: 48, patients: 32 },
    { name: "Apr", appointments: 61, patients: 40 },
    { name: "May", appointments: 55, patients: 37 },
    { name: "Jun", appointments: 67, patients: 45 },
  ]

  // Sample data for patient's dashboard
  const patientHealthData = [
    { name: "Jan", bloodPressure: 120, weight: 70 },
    { name: "Feb", bloodPressure: 118, weight: 69 },
    { name: "Mar", bloodPressure: 122, weight: 71 },
    { name: "Apr", bloodPressure: 119, weight: 70 },
    { name: "May", bloodPressure: 121, weight: 72 },
    { name: "Jun", bloodPressure: 120, weight: 71 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {userRole === "doctor" ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>Monthly appointment trends</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Patient Growth</CardTitle>
              <CardDescription>Monthly new patient registrations</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={doctorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#82ca9d" name="New Patients" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure</CardTitle>
              <CardDescription>Monthly blood pressure readings</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientHealthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bloodPressure" stroke="#8884d8" name="Blood Pressure" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Weight Tracking</CardTitle>
              <CardDescription>Monthly weight measurements (kg)</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientHealthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#82ca9d" name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
