"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Appointment {
  id: string
  title: string
  appointmentDate: string
  appointmentTime: string
  status: "upcoming" | "completed" | "cancelled"
  patients?: { full_name: string }
  doctors?: { profiles: { full_name: string } }
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  userRole: "doctor" | "patient"
}

export default function AppointmentCalendar({ appointments, userRole }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Helper functions for date manipulation without date-fns
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  const parseDate = (dateString: string) => {
    try {
      return new Date(dateString)
    } catch (error) {
      console.error("Error parsing date:", error)
      return new Date()
    }
  }

  const prevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Create calendar days array
  const days = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return []

    return appointments.filter((appointment) => {
      if (!appointment.appointmentDate) {
        return false
      }
      try {
        const appointmentDate = parseDate(appointment.appointmentDate)
        return isSameDay(appointmentDate, day)
      } catch (error) {
        console.error("Error comparing dates:", error)
        return false
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {daysOfWeek.map((day) => (
            <div key={day} className="bg-white p-2 text-center font-medium">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="bg-white p-2 min-h-[100px]"></div>
            }

            const dayAppointments = getAppointmentsForDay(day)
            const isCurrentDay = isToday(day)

            return (
              <div key={day.toString()} className={`bg-white p-2 min-h-[100px] ${isCurrentDay ? "bg-gray-50" : ""}`}>
                <div className="text-right font-medium">{day.getDate()}</div>
                <div className="mt-2 space-y-1">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded truncate ${
                        appointment.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {userRole === "doctor"
                        ? appointment.patients?.full_name
                        : appointment.doctors?.profiles?.full_name}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
