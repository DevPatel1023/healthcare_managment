"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Settings,
  FileText,
  CreditCard,
  Pill,
  Clipboard,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  FilePlus,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { clearUserSession } from "@/lib/browser-storage"

interface SidebarProps {
  userRole: "doctor" | "patient" | "admin"
  userName: string
  userAvatar?: string | null
}

export default function Sidebar({ userRole, userName, userAvatar }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [initials, setInitials] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (userName) {
      const nameParts = userName.split(" ")
      const initials = nameParts.map((part) => part[0]).join("")
      setInitials(initials)
    }
  }, [userName])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Clear user session from browser storage
      clearUserSession()

      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Error signing out:", error.message)
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  // Role-specific navigation items with proper routing
  const navItems =
    userRole === "doctor"
      ? [
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/appointments", label: "Appointments", icon: <FileText className="h-5 w-5" /> },
          { href: "/appointment-calendar", label: "Appointment Calendar", icon: <Calendar className="h-5 w-5" /> },
          { href: "/patients", label: "My Patients", icon: <Users className="h-5 w-5" /> },
          { href: "/prescriptions", label: "Prescriptions", icon: <Pill className="h-5 w-5" /> },
          { href: "/reports/create", label: "Create Reports", icon: <FilePlus className="h-5 w-5" /> },
          { href: "/medical-records", label: "Medical Records", icon: <Clipboard className="h-5 w-5" /> },
          { href: "/doctor/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
          { href: "/doctor/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
        ]
      : userRole === "patient"
        ? [
            { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: "/book-appointment", label: "Book Appointment", icon: <FileText className="h-5 w-5" /> },
            { href: "/appointment-calendar", label: "Appointment Calendar", icon: <Calendar className="h-5 w-5" /> },
            { href: "/reports", label: "View Reports", icon: <FileText className="h-5 w-5" /> },
            { href: "/prescriptions", label: "My Prescriptions", icon: <Pill className="h-5 w-5" /> },
            { href: "/medical-records", label: "My Records", icon: <Clipboard className="h-5 w-5" /> },
            { href: "/invoices", label: "Invoices", icon: <CreditCard className="h-5 w-5" /> },
            { href: "/patient/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
            { href: "/patient/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
          ]
        : [
            { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: "/admin/control-center", label: "Control Center", icon: <ShieldCheck className="h-5 w-5" /> },
            { href: "/admin/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
            { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
          ]

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-white to-gray-50 border-r transition-all duration-300 shadow-sm",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          <Avatar className="h-10 w-10 bg-primary/10">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? "ml-auto" : ""}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "justify-center px-2",
                    pathname === item.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-gray-100",
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t mt-auto">
        <Button
          variant="outline"
          className={cn("w-full", collapsed ? "px-2" : "", "bg-red-50 hover:bg-red-100 text-red-600 border-red-200")}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {collapsed ? (
            <LogOut className="h-5 w-5" />
          ) : (
            <>
              <LogOut className="h-5 w-5 mr-2" />
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
