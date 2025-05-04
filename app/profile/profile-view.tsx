"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"

interface ProfileViewProps {
  userId: string
  profile: any
  email: string
}

export default function ProfileView({ userId, profile, email }: ProfileViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(profile.full_name)
  const [phone, setPhone] = useState(profile.phone || "")
  const [address, setAddress] = useState(profile.address || "")
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const avatarUrl = publicUrlData.publicUrl

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(avatarUrl)

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="text-lg">
                {name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-white">
              <Upload className="h-4 w-4" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <h2 className="mt-4 text-xl font-semibold">{name}</h2>
          <p className="text-muted-foreground">{email}</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
