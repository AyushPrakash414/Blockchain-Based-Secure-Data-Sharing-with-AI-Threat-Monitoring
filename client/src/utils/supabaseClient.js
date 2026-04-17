import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://raptxtpxfrmdognxbbdg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcHR4dHB4ZnJtZG9nbnhiYmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDc3MDYsImV4cCI6MjA5MTk4MzcwNn0.j_dbq-RxNwMESGJbG-upS2wBA0ZbyBXA3R-sTbQsr4I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
