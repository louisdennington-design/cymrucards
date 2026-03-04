import { createServerClient } from '@supabase/ssr';
import type { SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/server/supabase-env';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') ?? '/';
  let response = NextResponse.redirect(new URL(next, request.url));

  if (!code) {
    return response;
  }

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        response = NextResponse.redirect(new URL(next, request.url));
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}
