-- Supabase schema for School Management System
-- Run this in the Supabase SQL editor or psql

-- Helper functions for role checks.
-- SECURITY DEFINER avoids recursive RLS lookups when policies need to read
-- users/students/teachers to decide what the signed-in user can access.
create or replace function public.current_user_role() returns text
language sql stable security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
    and coalesce(u.is_active, true) = true
    and coalesce(u.is_blocked, false) = false
  limit 1;
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_teacher() returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() = 'teacher';
$$;

create or replace function public.is_student() returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.current_user_role() = 'student';
$$;

create or replace function public.current_student_id() returns uuid
language sql stable security definer
set search_path = public
as $$
  select s.id
  from public.students s
  where s.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_teacher_id() returns uuid
language sql stable security definer
set search_path = public
as $$
  select t.id
  from public.teachers t
  where t.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.student_class_id() returns uuid
language sql stable security definer
set search_path = public
as $$
  select s.class_id
  from public.students s
  where s.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.teacher_can_access_class(class_uuid uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = class_uuid
      and c.class_teacher_id = public.current_teacher_id()
  )
  or exists (
    select 1
    from public.subjects sub
    where sub.class_id = class_uuid
      and sub.teacher_id = public.current_teacher_id()
  )
  or exists (
    select 1
    from public.timetable tt
    where tt.class_id = class_uuid
      and tt.teacher_id = public.current_teacher_id()
  );
$$;

create or replace function public.teacher_can_access_student(student_uuid uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.students s
    where s.id = student_uuid
      and public.teacher_can_access_class(s.class_id)
  );
$$;

create or replace function public.teacher_can_access_subject(subject_uuid uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subjects sub
    where sub.id = subject_uuid
      and (
        sub.teacher_id = public.current_teacher_id()
        or public.teacher_can_access_class(sub.class_id)
      )
  );
$$;

create or replace function public.teacher_can_manage_attendance(class_uuid uuid, student_uuid uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.teacher_can_access_class(class_uuid)
    and exists (
      select 1
      from public.students s
      where s.id = student_uuid
        and s.class_id = class_uuid
    );
$$;

create or replace function public.teacher_can_manage_result(student_uuid uuid, subject_uuid uuid) returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.teacher_can_access_student(student_uuid)
    and public.teacher_can_access_subject(subject_uuid);
$$;

-- Users table (mirror of auth users for metadata)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null,
  phone text,
  profile_image text,
  is_active boolean default true,
  is_blocked boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Students
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  admission_number text,
  roll_number text,
  class_id uuid references public.classes(id),
  section text,
  gender text,
  dob date,
  address text,
  emergency_contact text,
  parent_name text,
  parent_phone text,
  status text default 'active',
  photo_url text
);

-- Teachers
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  qualification text,
  experience int,
  joining_date date,
  address text,
  photo_url text,
  status text default 'active'
);

-- Classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text,
  class_teacher_id uuid references public.teachers(id),
  academic_year text
);

-- Subjects
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  teacher_id uuid references public.teachers(id),
  class_id uuid references public.classes(id)
);

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  class_id uuid references public.classes(id),
  teacher_id uuid references public.teachers(id),
  date date not null,
  status text not null,
  remarks text,
  synced boolean default false,
  created_at timestamp with time zone default now()
);

-- Fees
create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  month text,
  amount numeric not null,
  due_date date,
  status text default 'pending'
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  fee_id uuid references public.fees(id) on delete cascade,
  amount numeric,
  payment_method text,
  transaction_reference text,
  payment_date timestamp with time zone,
  receipt_url text
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text,
  target_role text,
  target_class uuid references public.classes(id),
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now()
);

-- Timetable
create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id),
  subject_id uuid references public.subjects(id),
  teacher_id uuid references public.teachers(id),
  day text,
  start_time time,
  end_time time,
  room text
);

-- App settings
create table if not exists public.app_settings (
  id serial primary key,
  school_name text,
  school_logo text,
  school_address text,
  contact_number text,
  email text,
  academic_year text,
  theme text
);

-- Enable RLS and policies
alter table public.users enable row level security;

create policy "users_admin_full_access" on public.users
  for all
  using (public.is_admin())
  with check (public.is_admin());

CREATE POLICY allow_self_insert_users
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role IN ('student','teacher')
    AND coalesce(is_active, false) = false
    AND coalesce(is_blocked, false) = false
  );

create policy "users_self_read" on public.users
  for select
  using (auth.uid() = id);

create policy "users_self_update" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow students to read the `full_name` of teachers assigned to their class
create policy "users_student_teacher_read" on public.users
  for select
  using (
    public.is_admin()
    or public.is_teacher()
    or (
      public.is_student()
      and exists (
        select 1
        from public.teachers t
        where t.user_id = users.id
          and (
            exists (
              select 1 from public.classes c
              where c.class_teacher_id = t.id
                and c.id = public.student_class_id()
            )
            or exists (
              select 1 from public.subjects s
              where s.teacher_id = t.id
                and s.class_id = public.student_class_id()
            )
            or exists (
              select 1 from public.timetable tt
              where tt.teacher_id = t.id
                and tt.class_id = public.student_class_id()
            )
          )
      )
    )
  );


alter table public.students enable row level security;

create policy "students_admin_full" on public.students
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "students_teacher_read" on public.students
  for select
  using (public.is_teacher() and public.teacher_can_access_class(class_id));

create policy "students_self_read" on public.students
  for select
  using (public.is_student() and user_id = auth.uid());

create policy "students_self_update" on public.students
  for update
  using (public.is_student() and user_id = auth.uid())
  with check (public.is_student() and user_id = auth.uid());


alter table public.teachers enable row level security;

create policy "teachers_admin_full" on public.teachers
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "teachers_self_read" on public.teachers
  for select
  using (public.is_teacher() and user_id = auth.uid());

create policy "teachers_self_update" on public.teachers
  for update
  using (public.is_teacher() and user_id = auth.uid())
  with check (public.is_teacher() and user_id = auth.uid());

create policy "teachers_student_assigned_read" on public.teachers
  for select
  using (
    public.is_student()
    and (
      exists (
        select 1
        from public.classes c
        where c.id = public.student_class_id()
          and c.class_teacher_id = teachers.id
      )
      or exists (
        select 1
        from public.subjects sub
        where sub.class_id = public.student_class_id()
          and sub.teacher_id = teachers.id
      )
      or exists (
        select 1
        from public.timetable tt
        where tt.class_id = public.student_class_id()
          and tt.teacher_id = teachers.id
      )
    )
  );

alter table public.classes enable row level security;

create policy "classes_admin_full" on public.classes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "classes_teacher_read" on public.classes
  for select
  using (public.is_teacher() and public.teacher_can_access_class(id));

create policy "classes_student_read" on public.classes
  for select
  using (public.is_student() and id = public.student_class_id());


alter table public.subjects enable row level security;

create policy "subjects_admin_full" on public.subjects
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "subjects_teacher_read" on public.subjects
  for select
  using (public.is_teacher() and public.teacher_can_access_subject(id));

create policy "subjects_student_read" on public.subjects
  for select
  using (public.is_student() and class_id = public.student_class_id());

-- Fallback: allow any authenticated user to read subjects (so UI joins can show subject names)
create policy "subjects_authenticated_read" on public.subjects
  for select
  using (auth.uid() is not null);


alter table public.attendance enable row level security;

create policy "attendance_admin_full" on public.attendance
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "attendance_teacher_read" on public.attendance
  for select
  using (
    public.is_teacher()
    and public.teacher_can_manage_attendance(class_id, student_id)
  );

create policy "attendance_teacher_insert" on public.attendance
  for insert
  with check (
    public.is_teacher()
    and public.teacher_can_manage_attendance(class_id, student_id)
    and (teacher_id is null or teacher_id = public.current_teacher_id())
  );

create policy "attendance_teacher_update" on public.attendance
  for update
  using (
    public.is_teacher()
    and public.teacher_can_manage_attendance(class_id, student_id)
  )
  with check (
    public.is_teacher()
    and public.teacher_can_manage_attendance(class_id, student_id)
    and (teacher_id is null or teacher_id = public.current_teacher_id())
  );

create policy "attendance_teacher_delete" on public.attendance
  for delete
  using (
    public.is_teacher()
    and public.teacher_can_manage_attendance(class_id, student_id)
  );

create policy "attendance_student_read" on public.attendance
  for select
  using (public.is_student() and student_id = public.current_student_id());


alter table public.fees enable row level security;

create policy "fees_admin_full" on public.fees
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "fees_student_read" on public.fees
  for select
  using (public.is_student() and student_id = public.current_student_id());


alter table public.payments enable row level security;

create policy "payments_admin_full" on public.payments
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "payments_student_read" on public.payments
  for select
  using (
    public.is_student()
    and exists (
      select 1
      from public.fees f
      where f.id = payments.fee_id
        and f.student_id = public.current_student_id()
    )
  );

create policy "payments_student_insert" on public.payments
  for insert
  with check (
    public.is_student()
    and exists (
      select 1
      from public.fees f
      where f.id = payments.fee_id
        and f.student_id = public.current_student_id()
    )
  );


alter table public.notifications enable row level security;

create policy "notifications_admin_full" on public.notifications
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "notifications_target_read" on public.notifications
  for select
  using (
    auth.uid() is not null
    and (
      target_role is null
      or target_role = 'everyone'
      or target_role = public.current_user_role()
      or (
        public.is_student()
        and target_class = public.student_class_id()
      )
      or (
        public.is_teacher()
        and public.teacher_can_access_class(target_class)
      )
    )
  );


alter table public.timetable enable row level security;

create policy "timetable_admin_full" on public.timetable
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "timetable_teacher_read" on public.timetable
  for select
  using (
    public.is_teacher()
    and (
      teacher_id = public.current_teacher_id()
      or public.teacher_can_access_class(class_id)
    )
  );

create policy "timetable_student_read" on public.timetable
  for select
  using (public.is_student() and class_id = public.student_class_id());


alter table public.app_settings enable row level security;

create policy "app_settings_admin_full" on public.app_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "app_settings_authenticated_read" on public.app_settings
  for select
  using (auth.uid() is not null);
  

-- Storage bucket for profile photos.
-- Files are stored as profile-photos/{auth.uid()}/profile.ext so users can
-- replace only their own profile image from the mobile app.
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = true;

create policy "profile_photos_public_read" on storage.objects
  for select
  using (bucket_id = 'profile-photos');

create policy "profile_photos_user_insert" on storage.objects
  for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_photos_user_update" on storage.objects
  for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_photos_user_delete" on storage.objects
  for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
  

-- Indexes
create index if not exists idx_attendance_student_date on public.attendance(student_id, date);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_students_class_id on public.students(class_id);
create index if not exists idx_teachers_user_id on public.teachers(user_id);
create index if not exists idx_classes_class_teacher_id on public.classes(class_teacher_id);
create index if not exists idx_subjects_class_teacher on public.subjects(class_id, teacher_id);
create index if not exists idx_attendance_class_date on public.attendance(class_id, date);
create index if not exists idx_fees_student_id on public.fees(student_id);
create index if not exists idx_payments_fee_id on public.payments(fee_id);
create index if not exists idx_notifications_target_role on public.notifications(target_role);
create index if not exists idx_notifications_target_class on public.notifications(target_class);
create index if not exists idx_timetable_class_id on public.timetable(class_id);
create index if not exists idx_timetable_teacher_id on public.timetable(teacher_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON public.users (lower(email));
