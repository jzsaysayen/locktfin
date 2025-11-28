// middleware.ts
import { stackServerApp } from "./stack/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEXT_PUBLIC_ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];

export async function middleware(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (user) {
      const userEmail = user.primaryEmail;
      
      if (!userEmail || !NEXT_PUBLIC_ALLOWED_EMAILS.includes(userEmail)) {
        await user.signOut();
        
        const signInUrl = new URL('/handler/sign-in', request.url);
        signInUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(signInUrl);
      }
    }
    
    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - handler routes (sign-in, sign-out, etc.)
     * - login route (ADD THIS!)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|handler|login).*)',
  ],
};