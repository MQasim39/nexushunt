
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egiyjyvprrsnvstfnfpf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaXlqeXZwcnJzbnZzdGZuZnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4Njk3NjUsImV4cCI6MjA1NDQ0NTc2NX0.GTV9EfSIyCGPZmfq53ZcWnA43tv111Ym1HHHepj480U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
