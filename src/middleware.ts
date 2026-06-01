import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const hasClerkKeys = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (hasClerkKeys) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
      const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
      return clerkMiddleware(async (auth, request) => {
        if (isDashboardRoute(request)) {
          await auth.protect();
        }
      })(req, event);
    } catch (e) {
      console.warn("Clerk middleware initialization failed. Gracefully skipping route protection:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
