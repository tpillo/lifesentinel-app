import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check approval status — RLS policy allows users to read their own row
  const { data: approval } = await supabase
    .from("signup_approvals")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!approval || approval.status === "pending") {
    return NextResponse.redirect(new URL("/waitlist", request.url));
  }

  if (approval.status === "denied") {
    return NextResponse.redirect(new URL("/waitlist?denied=true", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile-setup", "/admin/:path*"],
};
