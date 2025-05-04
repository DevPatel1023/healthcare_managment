"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Settings, User, Menu } from "lucide-react"
import { clearUserSession } from "@/lib/browser-storage"
import Sidebar from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
  userAvatar?: string
}

export default function DashboardLayout({ children, userRole, userName, userAvatar }: DashboardLayoutProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear local storage
      clearUserSession()

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Role-based profile and settings paths
  const profilePath =
    userRole === "admin" ? "/admin/profile" : userRole === "doctor" ? "/doctor/profile" : "/patient/profile"

  const settingsPath =
    userRole === "admin" ? "/admin/settings" : userRole === "doctor" ? "/doctor/settings" : "/patient/settings"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">HealthCare</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 md:gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} />
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profilePath}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsPath}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
      <div className="flex flex-1">
        <Sidebar userRole={userRole as "doctor" | "patient" | "admin"} userName={userName} userAvatar={userAvatar} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
