import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/server/supabase-env';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const type = request.nextUrl.searchParams.get('type');
  const rawNext = request.nextUrl.searchParams.get('next');
  const next = rawNext?.startsWith('/') ? rawNext : '/flashcards';
  const redirectPath = type === 'recovery' ? `/auth/reset-password?next=${encodeURIComponent(next)}` : next;
  let response = NextResponse.redirect(new URL(redirectPath, request.url));

  if (!code) {
    return response;
  }

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        response = NextResponse.redirect(new URL(redirectPath, request.url));
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code).catch(() => null);

  return response;
}
