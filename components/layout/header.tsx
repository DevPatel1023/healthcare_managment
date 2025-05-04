"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Bell } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface HeaderProps {
  user: any
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [initials, setInitials] = useState(() => {
    const nameParts = (user?.name || "User Name").split(" ")
    return nameParts.map((part: string) => part[0]).join("")
  })

  const handleSignOut = async () => {
    try {
      onSignOut()
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
    }
  }

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/appointments" && "Appointments"}
              {pathname === "/appointment-calendar" && "Appointment Calendar"}
              {pathname === "/patients" && "Manage Patients"}
              {pathname === "/profile" && "Profile"}
              {pathname === "/settings" && "Settings"}
              {pathname === "/book-appointment" && "Book an Appointment"}
              {pathname === "/reports" && "Medical Reports"}
              {pathname === "/invoices" && "Your Invoices"}
              {pathname === "/medical-records" && "Medical Records"}
              {pathname === "/prescriptions" && "Prescriptions"}
              {pathname.includes("/admin/dashboard") && "Admin Dashboard"}
              {pathname.includes("/admin/control-center") && "Control Center"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
