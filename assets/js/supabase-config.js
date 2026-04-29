// WARNING: Replace these with your actual Supabase Project URL and Anon Key.
// You can find them in your Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https://yxhttagasgufstcabnem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aHR0YWdhc2d1ZnN0Y2FibmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDI4ODksImV4cCI6MjA5MzAxODg4OX0.HS22A8PgeK0X_FDsbNgdk_1neppWvX1VN5zzd551Or8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
