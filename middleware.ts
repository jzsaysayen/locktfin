// middleware.ts
import { stackServerApp } from "./stack/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Get allowed emails from environment variable
// In .env.local add: ALLOWED_EMAILS=your-email@example.com,another@example.com
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];

export async function middleware(request: NextRequest) {
  try {
    // Get the current user
    const user = await stackServerApp.getUser();
    
    // If user is logged in, check if their email is allowed
    if (user) {
      const userEmail = user.primaryEmail;
      
      if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
        // Sign out the unauthorized user
        await user.signOut();
        
        // Redirect to sign-in with error message
        const signInUrl = new URL('/handler/sign-in', request.url);
        signInUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(signInUrl);
      }
    }
    
    return NextResponse.next();
  } catch {
    // If there's an error getting the user, just continue
    return NextResponse.next();
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - handler routes (sign-in, sign-out)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|handler).*)',
  ],
};