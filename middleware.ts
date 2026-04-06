import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = [
    "/dashboard",
    "/chat",
    "/bookings",
    "/profile",
    "/settings",
    "/post-gig",
  ];

  if (
    !user &&
    protectedRoutes.some((p) => req.nextUrl.pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}
