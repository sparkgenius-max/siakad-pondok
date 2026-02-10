-- 1. PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'ustadz')) default 'ustadz',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'ustadz');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SANTRI (Students)
create table santri (
  id uuid default gen_random_uuid() primary key,
  nis text unique not null,
  name text not null,
  gender text check (gender in ('L', 'P')),
  class text not null,
  dorm text,
  status text check (status in ('active', 'inactive', 'graduated')) default 'active',
  guardian_name text,
  guardian_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PAYMENTS (Syahriah)
create table payments (
  id uuid default gen_random_uuid() primary key,
  santri_id uuid references santri(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  payment_date date default current_date,
  month integer check (month between 1 and 12) not null,
  year integer not null,
  status text check (status in ('paid', 'pending', 'partial')) default 'paid',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(santri_id, month, year)
);

-- 4. PERMISSIONS (Perizinan)
create table permissions (
  id uuid default gen_random_uuid() primary key,
  santri_id uuid references santri(id) on delete cascade not null,
  type text check (type in ('sick', 'permit', 'late', 'other')) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approval_date timestamptz,
  approved_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 5. GRADES (Nilai)
create table grades (
  id uuid default gen_random_uuid() primary key,
  santri_id uuid references santri(id) on delete cascade not null,
  subject text not null,
  semester text not null,
  academic_year text not null,
  grade text not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS POLICIES
alter table profiles enable row level security;
alter table santri enable row level security;
alter table payments enable row level security;
alter table permissions enable row level security;
alter table grades enable row level security;

-- Read policies (allow authenticated users to read)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Santri are viewable by authenticated users" on santri for select to authenticated using (true);
create policy "Payments are viewable by authenticated users" on payments for select to authenticated using (true);
create policy "Permissions are viewable by authenticated users" on permissions for select to authenticated using (true);
create policy "Grades are viewable by authenticated users" on grades for select to authenticated using (true);

-- Write policies (Admin only for critical data, Ustadz for operational data)
-- Admin Full Access
create policy "Admins can do everything on profiles" on profiles for all using (auth.uid() in (select id from profiles where role = 'admin'));
create policy "Admins can do everything on santri" on santri for all using (auth.uid() in (select id from profiles where role = 'admin'));
create policy "Admins can do everything on payments" on payments for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Ustadz Access (Can insert permissions and grades)
create policy "Ustadz can insert permissions" on permissions for insert to authenticated with check (true);
create policy "Ustadz can update permissions" on permissions for update to authenticated using (true);

create policy "Ustadz can insert grades" on grades for insert to authenticated with check (true);
create policy "Ustadz can update grades" on grades for update to authenticated using (true);
