import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/server/supabase-env';
import type { Database } from '@/types/database';

function normalizeNextPath(rawNext: string | null) {
  if (!rawNext || rawNext.trim() === '') {
    return '/flashcards';
  }

  return rawNext.startsWith('/') ? rawNext : '/flashcards';
}

export async function middleware(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const authType = request.nextUrl.searchParams.get('type');
  const nextPath = normalizeNextPath(request.nextUrl.searchParams.get('next'));
  const targetPath = authType === 'recovery' ? `/auth/reset-password?next=${encodeURIComponent(nextPath)}` : nextPath;

  if (code) {
    let redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));

    const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          redirectResponse = NextResponse.redirect(new URL(targetPath, request.url));
          cookiesToSet.forEach(({ name, options, value }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.exchangeCodeForSession(code).catch(() => null);
    return redirectResponse;
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
