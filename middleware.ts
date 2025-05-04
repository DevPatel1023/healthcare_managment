import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// DEVELOPMENT ONLY: Bypass authentication
export async function middleware(req: NextRequest) {
  // Always allow access to all routes during development
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
