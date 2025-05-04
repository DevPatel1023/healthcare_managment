"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Bell, Shield, Clock, Save } from "lucide-react"
import { getCurrentUser, getProfileById, updateProfile } from "@/lib/browser-storage"

export default function DoctorSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableTwoFactor: false,
    darkMode: false,
    appointmentDuration: "30",
    availableForEmergency: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setSettings({
        enableNotifications: profile.enableNotifications !== false,
        enableTwoFactor: profile.enableTwoFactor || false,
        darkMode: profile.darkMode || false,
        appointmentDuration: profile.appointmentDuration || "30",
        availableForEmergency: profile.availableForEmergency || false,
      })

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update profile
      const updatedProfile = {
        ...profileData,
        enableNotifications: settings.enableNotifications,
        enableTwoFactor: settings.enableTwoFactor,
        darkMode: settings.darkMode,
        appointmentDuration: settings.appointmentDuration,
        availableForEmergency: settings.availableForEmergency,
        updatedAt: new Date().toISOString(),
      }

      // Update in storage
      updateProfile(updatedProfile)

      // Update state
      setProfileData(updatedProfile)

      // Show success message
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error updating settings",
        description: "There was an error updating your settings. Please try again.",
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
        <h1 className="text-3xl font-bold mb-8">Doctor Settings</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableNotifications" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about appointments and patient updates
                    </p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleToggleChange("enableNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableTwoFactor" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => handleToggleChange("enableTwoFactor", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Settings</CardTitle>
                <CardDescription>Configure your appointment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDuration" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Default Appointment Duration
                  </Label>
                  <Select
                    value={settings.appointmentDuration}
                    onValueChange={(value) => handleSelectChange("appointmentDuration", value)}
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="availableForEmergency" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Available for Emergency
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow patients to book emergency appointments</p>
                  </div>
                  <Switch
                    id="availableForEmergency"
                    checked={settings.availableForEmergency}
                    onCheckedChange={(checked) => handleToggleChange("availableForEmergency", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
