# Supabase setup for School Management System

1. Create a Supabase project at https://app.supabase.com
2. Open the SQL editor and run the contents of `supabase/schema.sql` to create tables and RLS policies.
3. In "Settings -> API" copy the `anon` key and the project URL and set them in your Expo app as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Seed an admin user:
   - Create an auth user via Supabase Auth (email/password).
   - Insert a record in `public.users` with `id` = auth user's id and `role` = 'admin'.

5. Use Supabase Dashboard to adjust policies and add any additional policies needed for your school's workflow.

Notes:

- The provided schema contains example RLS policies; review and expand them to cover all tables and edge cases.
- For local development consider using the Supabase CLI to run migrations and seed data.
