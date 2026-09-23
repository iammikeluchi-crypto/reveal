import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Only ever uses the PUBLISHABLE key.
// Never import the service_role key here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
