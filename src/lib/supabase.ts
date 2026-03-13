import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://eavcatxfkavhgyjyotwx.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjliNjM4MWU2LTJjYzEtNDZjZi04MGFmLTM0NTQzYjRlMmY3ZCJ9.eyJwcm9qZWN0SWQiOiJlYXZjYXR4ZmthdmhneWp5b3R3eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyMjQ3MTU2LCJleHAiOjIwODc2MDcxNTYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.YcJA9moBB9PqDSeQZld9Z_AimgJbqYn78EE7a2xkGN0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };