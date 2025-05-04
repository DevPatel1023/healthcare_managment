"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getProfileById } from "@/lib/browser-storage"

// This is a redirect page that will send users to their role-specific profile page
export default function ProfileRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const redirectToRoleSpecificPage = async () => {
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

      // Redirect based on role
      if (profile.role === "doctor") {
        router.push("/doctor/profile")
      } else if (profile.role === "patient") {
        router.push("/patient/profile")
      } else if (profile.role === "admin") {
        router.push("/admin/profile")
      } else {
        router.push("/dashboard")
      }
    }

    redirectToRoleSpecificPage()
  }, [router])

  return <div className="flex items-center justify-center h-screen">Redirecting...</div>
}
