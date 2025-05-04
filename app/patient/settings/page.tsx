"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Bell, Shield, Save } from "lucide-react"
import { getCurrentUser, getProfileById, updateProfile } from "@/lib/browser-storage"

export default function PatientSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableTwoFactor: false,
    darkMode: false,
    shareDataWithDoctor: true,
    receiveAppointmentReminders: true,
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

      if (!profile || profile.role !== "patient") {
        router.push("/dashboard")
        return
      }

      setProfileData(profile)
      setSettings({
        enableNotifications: profile.enableNotifications !== false,
        enableTwoFactor: profile.enableTwoFactor || false,
        darkMode: profile.darkMode || false,
        shareDataWithDoctor: profile.shareDataWithDoctor !== false,
        receiveAppointmentReminders: profile.receiveAppointmentReminders !== false,
      })

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
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
        shareDataWithDoctor: settings.shareDataWithDoctor,
        receiveAppointmentReminders: settings.receiveAppointmentReminders,
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
        <h1 className="text-3xl font-bold mb-8">Patient Settings</h1>

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
                      Receive notifications about appointments and updates
                    </p>
                  </div>
                  <Switch
                    id="enableNotifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleToggleChange("enableNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="receiveAppointmentReminders" className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Appointment Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive reminders about upcoming appointments</p>
                  </div>
                  <Switch
                    id="receiveAppointmentReminders"
                    checked={settings.receiveAppointmentReminders}
                    onCheckedChange={(checked) => handleToggleChange("receiveAppointmentReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage your privacy and security settings</CardDescription>
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareDataWithDoctor" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Share Data with Doctor
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow your doctor to access your medical records</p>
                  </div>
                  <Switch
                    id="shareDataWithDoctor"
                    checked={settings.shareDataWithDoctor}
                    onCheckedChange={(checked) => handleToggleChange("shareDataWithDoctor", checked)}
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
