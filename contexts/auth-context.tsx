"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, setCurrentUser, type User } from "@/lib/browser-storage"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = getCurrentUser()
    setUser(storedUser)
    setLoading(false)

    // Redirect if not logged in and trying to access protected routes
    if (!storedUser && pathname !== "/" && !pathname.startsWith("/auth")) {
      router.push("/")
    }
  }, [pathname, router])

  const login = (userData: User) => {
    setCurrentUser(userData)
    setUser(userData)
    router.push("/dashboard")
  }

  const logout = () => {
    setCurrentUser(null)
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
