"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { UserPlus, RefreshCw, Copy } from "lucide-react"
import { getCurrentUser, getProfileById, getProfiles, addUser, addProfile, generateId } from "@/lib/browser-storage"

export default function AdminControlCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [newDoctorData, setNewDoctorData] = useState({
    fullName: "",
    email: "",
    specialization: "",
    department: "",
  })
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false)

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

      // Get all profiles
      const allProfiles = getProfiles()
      const doctorProfiles = allProfiles.filter((p) => p.role === "doctor")

      setDoctors(doctorProfiles)
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDoctorData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewDoctorData((prev) => ({ ...prev, [name]: value }))
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleCreateDoctor = () => {
    setIsCreatingDoctor(true)

    try {
      // Validate inputs
      if (
        !newDoctorData.fullName ||
        !newDoctorData.email ||
        !newDoctorData.specialization ||
        !newDoctorData.department
      ) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields to create a doctor account.",
          variant: "destructive",
        })
        setIsCreatingDoctor(false)
        return
      }

      // Generate IDs and password
      const doctorId = generateId("doctor-")
      const password = generatePassword()

      // Create user
      const newUser = {
        id: doctorId,
        email: newDoctorData.email,
        role: "doctor" as const,
        fullName: newDoctorData.fullName,
      }

      // Create profile
      const newProfile = {
        id: doctorId,
        fullName: newDoctorData.fullName,
        role: "doctor" as const,
        phone: "",
        address: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        specialization: newDoctorData.specialization,
        department: newDoctorData.department,
        enableNotifications: true,
      }

      // Add to storage
      addUser(newUser)
      addProfile(newProfile)

      // Update state
      setDoctors((prev) => [...prev, newProfile])

      // Set generated credentials
      setGeneratedCredentials({
        email: newDoctorData.email,
        password: password,
      })

      // Reset form
      setNewDoctorData({
        fullName: "",
        email: "",
        specialization: "",
        department: "",
      })

      // Show success message
      toast({
        title: "Doctor account created",
        description: `Account for ${newDoctorData.fullName} has been created successfully.`,
      })
    } catch (error) {
      console.error("Error creating doctor account:", error)
      toast({
        title: "Error creating account",
        description: "There was an error creating the doctor account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingDoctor(false)
    }
  }

  const handleCopyCredentials = () => {
    if (generatedCredentials) {
      const text = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`
      navigator.clipboard.writeText(text)
      toast({
        title: "Credentials copied",
        description: "The login credentials have been copied to your clipboard.",
      })
    }
  }

  const handleResetPassword = (doctorId: string, doctorName: string) => {
    const newPassword = generatePassword()

    // In a real app, we would update the password in the database
    // For now, we'll just show a toast with the new password

    toast({
      title: "Password reset",
      description: `New password for ${doctorName}: ${newPassword}`,
    })
  }

  if (loading || !profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout userRole={profileData.role} userName={profileData.fullName} userAvatar={profileData.avatarUrl}>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Control Center</h2>
          <p className="text-muted-foreground">Generate and manage doctor accounts in the system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create Doctor Account</CardTitle>
              <CardDescription>Generate a new doctor account with login credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={newDoctorData.fullName}
                    onChange={handleInputChange}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newDoctorData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={newDoctorData.specialization}
                    onValueChange={(value) => handleSelectChange("specialization", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                      <SelectItem value="Gynecology">Gynecology</SelectItem>
                      <SelectItem value="Urology">Urology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newDoctorData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology Department">Cardiology Department</SelectItem>
                      <SelectItem value="Neurology Department">Neurology Department</SelectItem>
                      <SelectItem value="Orthopedics Department">Orthopedics Department</SelectItem>
                      <SelectItem value="Pediatrics Department">Pediatrics Department</SelectItem>
                      <SelectItem value="Dermatology Department">Dermatology Department</SelectItem>
                      <SelectItem value="Ophthalmology Department">Ophthalmology Department</SelectItem>
                      <SelectItem value="Gynecology Department">Gynecology Department</SelectItem>
                      <SelectItem value="Urology Department">Urology Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateDoctor} disabled={isCreatingDoctor}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isCreatingDoctor ? "Creating Account..." : "Create Doctor Account"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedCredentials && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Credentials</CardTitle>
                <CardDescription>Login credentials for the newly created doctor account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md border">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Email:</span>
                        <span>{generatedCredentials.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Password:</span>
                        <span>{generatedCredentials.password}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Please save these credentials or share them with the doctor. For security reasons, the password will
                    not be displayed again.
                  </div>
                  <Button className="w-full" variant="outline" onClick={handleCopyCredentials}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Doctors</CardTitle>
            <CardDescription>View and manage existing doctor accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.fullName}</TableCell>
                    <TableCell>{doctor.specialization || "Not specified"}</TableCell>
                    <TableCell>{doctor.department || "Not specified"}</TableCell>
                    <TableCell>{new Date(doctor.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(doctor.id, doctor.fullName)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
