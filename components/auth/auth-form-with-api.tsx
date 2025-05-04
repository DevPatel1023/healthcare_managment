"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export default function AuthFormWithApi() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"doctor" | "patient">("doctor")
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
    fullName?: string
  }>({})
  const [formTab, setFormTab] = useState<"signin" | "signup">("signin")

  // Basic form validation
  const validateForm = () => {
    const errors: {
      email?: string
      password?: string
      fullName?: string
    } = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!fullName && formTab === "signup") {
      errors.fullName = "Full name is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        })
        router.refresh()
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        title: "Error signing in",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Step 1: Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error(authError.message || "Failed to create account")
      }

      if (!authData.user) {
        throw new Error("User creation failed")
      }

      // Step 2: Call our API to create the profile using the service role key
      const response = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName,
          role,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create profile")
      }

      // Step 3: Sign in the user
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("Sign in error after registration:", signInError)
          throw new Error(signInError.message || "Failed to sign in after registration")
        }
      }

      toast({
        title: "Account created successfully",
        description: "You are now signed in to your new account",
      })

      router.refresh()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Sign up error:", error)
      toast({
        title: "Error creating account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="signin" onValueChange={(value) => setFormTab(value as "signin" | "signup")}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Healthcare Management System</CardTitle>
          <CardDescription className="text-center">Manage your healthcare services efficiently</CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="m.smith@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={!!formErrors.password}
                />
                {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-fullName">Full Name</Label>
                <Input
                  id="signup-fullName"
                  placeholder="Michael Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  aria-invalid={!!formErrors.fullName}
                />
                {formErrors.fullName && <p className="text-sm text-destructive">{formErrors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m.smith@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={!!formErrors.password}
                />
                {formErrors.password && <p className="text-sm text-destructive">{formErrors.password}</p>}
                {!formErrors.password && password && password.length < 8 && (
                  <p className="text-sm text-muted-foreground">Password should be at least 8 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <RadioGroup
                  defaultValue="doctor"
                  value={role}
                  onValueChange={(value) => setRole(value as "doctor" | "patient")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor">Doctor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient">Patient</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">Secure healthcare management for doctors and patients</p>
        </CardFooter>
      </Tabs>
    </Card>
  )
}
