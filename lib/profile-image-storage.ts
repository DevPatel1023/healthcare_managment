// Utility for storing profile images in browser storage

// Store profile image in localStorage as base64
export function storeProfileImage(userId: string, imageData: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(`profile_image_${userId}`, imageData)
  } catch (error) {
    console.error("Error storing profile image:", error)
  }
}

// Get profile image from localStorage
export function getProfileImage(userId: string): string | null {
  if (typeof window === "undefined") return null

  try {
    return localStorage.getItem(`profile_image_${userId}`)
  } catch (error) {
    console.error("Error retrieving profile image:", error)
    return null
  }
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Create a placeholder image with initials
export function createInitialsImage(name: string, size = 200): string {
  if (typeof window === "undefined") return ""

  try {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext("2d")
    if (!context) return ""

    // Background
    context.fillStyle = getRandomColor(name)
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Text
    const initials = getInitials(name)
    context.fillStyle = "#FFFFFF"
    context.font = `${size / 2}px Arial`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(initials, size / 2, size / 2)

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error creating initials image:", error)
    return ""
  }
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Generate a consistent color based on name
function getRandomColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    "#4F46E5", // indigo
    "#0EA5E9", // sky
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EC4899", // pink
    "#8B5CF6", // violet
    "#EF4444", // red
    "#F97316", // orange
  ]

  return colors[Math.abs(hash) % colors.length]
}
