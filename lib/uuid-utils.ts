// Helper function to check if a string is a valid UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Helper function to generate a deterministic UUID from a string
// This helps maintain consistency when converting non-UUID IDs to UUIDs
export function generateDeterministicUUID(input: string): string {
  // This is a simple implementation - in production you might want a more robust solution
  const namespace = "6ba7b810-9dad-11d1-80b4-00c04fd430c8" // A random UUID
  const hash = Array.from(input).reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) & 0xffffffff
  }, 0)

  // Create a UUID-like string with the hash
  const uuid = `${hash.toString(16).padStart(8, "0")}-${(hash >> 8).toString(16).padStart(4, "0")}-4${(hash >> 16).toString(16).padStart(3, "0")}-${(0x8 | ((hash >> 24) & 0x3)).toString(16)}${(hash >> 28).toString(16).padStart(3, "0")}-${hash.toString(16).padStart(12, "0").substring(0, 12)}`

  return uuid
}
