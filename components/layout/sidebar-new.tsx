"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  Settings,
  Users,
  FileCheck,
  Receipt,
  Menu,
  X,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeMobileSidebar = () => {
    setIsOpen(false)
  }

  const userRole = user?.role || "patient"

  const getNavItems = () => {
    switch (userRole) {
      case "doctor":
        return [
          { name: "Dashboard", href: "/dashboard", icon: Home },
          { name: "Appointments", href: "/appointments", icon: Calendar },
          { name: "Patients", href: "/patients", icon: Users },
          { name: "Prescriptions", href: "/prescriptions", icon: FileCheck },
          { name: "Medical Records", href: "/medical-records", icon: FileText },
          { name: "Reports", href: "/reports", icon: BarChart3 },
          { name: "Invoices", href: "/invoices", icon: Receipt },
          { name: "Profile", href: "/profile", icon: Users },
          { name: "Settings", href: "/settings", icon: Settings },
        ]
      case "patient":
        return [
          { name: "Dashboard", href: "/dashboard", icon: Home },
          { name: "Book Appointment", href: "/book-appointment", icon: Calendar },
          { name: "Appointment Calendar", href: "/appointment-calendar", icon: Calendar },
          { name: "Medical Records", href: "/medical-records", icon: FileText },
          { name: "Prescriptions", href: "/prescriptions", icon: FileCheck },
          { name: "Reports", href: "/reports", icon: BarChart3 },
          { name: "Invoices", href: "/invoices", icon: Receipt },
          { name: "Profile", href: "/profile", icon: Users },
          { name: "Settings", href: "/settings", icon: Settings },
        ]
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
          { name: "Control Center", href: "/admin/control-center", icon: Settings },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={toggleMobileSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={closeMobileSidebar} />}

        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-950",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Health Portal</h2>
            <Button variant="ghost" size="icon" onClick={closeMobileSidebar}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close Menu</span>
            </Button>
          </div>

          <nav className="p-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "group/sidebar relative hidden h-screen flex-col border-r bg-white transition-all duration-300 ease-in-out dark:bg-gray-950 md:flex",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3 py-4">
        {!isCollapsed && <h2 className="text-lg font-semibold">Health Portal</h2>}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", isCollapsed ? "mx-auto" : "ml-auto")}
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
