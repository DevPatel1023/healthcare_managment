"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeDummyData, setCurrentUser } from "@/lib/browser-storage"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Initialize dummy data when the app loads
    initializeDummyData()
  }, [])

  const handleDoctorLogin = () => {
    setCurrentUser({
      id: "doctor-1",
      email: "john.smith@example.com",
      role: "doctor",
      fullName: "Dr. John Smith",
    })
    router.push("/dashboard")
  }

  const handlePatientLogin = () => {
    setCurrentUser({
      id: "patient-1",
      email: "michael.brown@example.com",
      role: "patient",
      fullName: "Michael Brown",
    })
    router.push("/dashboard")
  }

  const handleAdminLogin = () => {
    setCurrentUser({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
      fullName: "System Administrator",
    })
    router.push("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">Healthcare Management System</h1>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm font-medium">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#login" className="text-sm font-medium">
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">Secure and Efficient Hospital Management</h2>
            <p className="text-lg text-muted-foreground">
              Our advanced healthcare management system integrates patient records, appointments, and secure medical
              data storage into one seamless platform. With SSL encryption, two-factor authentication, and cloud
              security, your healthcare organization can operate securely and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <a href="#login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/placeholder.svg?height=400&width=400"
              alt="Healthcare Management"
              className="rounded-lg shadow-lg"
              width={400}
              height={400}
            />
          </div>
        </div>

        <section id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Digital Records</h3>
              <p className="text-muted-foreground">
                No more messy paperwork! Store and manage all patient medical records in one secure place. Patients get
                easy access to their reports, reducing unnecessary hospital visits.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Appointment Scheduling</h3>
              <p className="text-muted-foreground">
                Streamline the appointment booking process for both doctors and patients. Reduce no-shows with automated
                reminders and allow patients to reschedule with ease.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Medical Staff Portal</h3>
              <p className="text-muted-foreground">
                A dedicated space for doctors to manage their workflow efficiently. View upcoming appointments, patient
                histories, update prescriptions, and track patient progress.
              </p>
            </div>
          </div>
        </section>

        <section id="login" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Login to Your Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center bg-blue-50 rounded-t-lg">
                <CardTitle className="text-2xl">Doctor Login</CardTitle>
                <CardDescription>Access your doctor dashboard</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Dr. John Smith</p>
                    <p className="text-sm text-muted-foreground">Cardiology Department</p>
                  </div>
                  <Button className="w-full" onClick={handleDoctorLogin}>
                    Login as Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center bg-green-50 rounded-t-lg">
                <CardTitle className="text-2xl">Patient Login</CardTitle>
                <CardDescription>Access your patient portal</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Michael Brown</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                  <Button className="w-full" onClick={handlePatientLogin}>
                    Login as Patient
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center bg-purple-50 rounded-t-lg">
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Access system administration</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-600"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">System Administrator</p>
                    <p className="text-sm text-muted-foreground">Admin</p>
                  </div>
                  <Button className="w-full" onClick={handleAdminLogin}>
                    Login as Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="contact" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground mb-8">
              Have questions about our healthcare management system? Our team is here to help you get started.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
              <Button size="lg">Request Demo</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Healthcare Management System</h3>
              <p className="text-sm text-muted-foreground">Secure healthcare management for doctors and patients.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Important Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic text-sm text-muted-foreground">
                <p>123 Health Street, City, Country</p>
                <p className="mt-2">contact@hms.com</p>
                <p className="mt-2">+1 234 567 890</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Healthcare Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
