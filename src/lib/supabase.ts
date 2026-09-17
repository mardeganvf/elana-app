import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mixedzmkjfzumeimfkfz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peGVkem1ramZ6dW1laW1ma2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNDAyNzQsImV4cCI6MjEwMjkxNjI3NH0.xb5mORzAh8ZK3UkSErmWAjcyj4WQP3LyKBg1v6k4a9Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
