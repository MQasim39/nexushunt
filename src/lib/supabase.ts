
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egiyjyvprrsnvstfnfpf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaXlqeXZwcnJzbnZzdGZuZnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Njk3NjUsImV4cCI6MjA1NDQ0NTc2NX0.GTV9EfSIyCGPZmfq53ZcWnA43tv111Ym1HHHepj480U';

console.log("Initializing Supabase client with URL:", supabaseUrl);
console.log("Using anon key:", supabaseAnonKey.substring(0, 15) + "...");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'jobtrackr-auth-storage'
  }
});

// Set up a debug channel for Supabase API requests
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Supabase auth state change:", event, session ? "Session exists" : "No session");
});

// Debug the current session on load
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Error checking initial session:", error);
  } else {
    console.log("Initial session check:", data.session ? "Session exists" : "No session");
  }
});

// Debug helper for API errors
export const logSupabaseError = (
  action: string, 
  error: any
) => {
  console.error(`Supabase ${action} error:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    stack: error?.stack
  });
};
