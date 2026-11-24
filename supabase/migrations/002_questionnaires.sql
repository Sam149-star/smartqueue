-- =====================================================================
-- 002_questionnaires.sql: BloodConnect Questionnaires & Verifier Medical Onboarding
-- =====================================================================

create table if not exists public.personal_questionnaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profile_type text not null check (profile_type in ('donor', 'recipient', 'verifier')),
  category text not null check (category in ('senior', 'adult_male', 'adult_female', 'minor', 'medical_verifier')),
  full_name text not null,
  dob date,
  age int not null,
  gender text not null,
  blood_group text,
  weight_kg numeric,
  city text,
  district text,
  pincode text,
  address text,
  phone text,
  answers jsonb not null default '{}'::jsonb,
  preliminary_eligible boolean default true,
  is_minor boolean default false,
  hospital_name text,
  treating_doctor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique questionnaire per user per type (one donor, one recipient, one verifier questionnaire)
create unique index if not exists idx_user_questionnaire_type
  on public.personal_questionnaires(user_id, profile_type);

-- RLS
alter table public.personal_questionnaires enable row level security;

drop policy if exists "questionnaires_select_own" on public.personal_questionnaires;
create policy "questionnaires_select_own" on public.personal_questionnaires
  for select
  using (auth.uid() = user_id);

drop policy if exists "questionnaires_insert_own" on public.personal_questionnaires;
create policy "questionnaires_insert_own" on public.personal_questionnaires
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "questionnaires_update_own" on public.personal_questionnaires;
create policy "questionnaires_update_own" on public.personal_questionnaires
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Secure RPC to save and update questionnaire
create or replace function public.save_my_questionnaire(
  p_profile_type text,
  p_category text,
  p_full_name text,
  p_dob date,
  p_age int,
  p_gender text,
  p_blood_group text,
  p_weight_kg numeric,
  p_city text,
  p_district text,
  p_pincode text,
  p_address text,
  p_phone text,
  p_answers jsonb,
  p_hospital_name text default null,
  p_treating_doctor text default null
)
returns public.personal_questionnaires
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_is_minor boolean;
  v_eligible boolean;
  v_result public.personal_questionnaires;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required to save questionnaire';
  end if;

  v_is_minor := (p_age < 18 or p_category = 'minor');
  
  -- Minors cannot be eligible donors in India
  if p_profile_type = 'donor' and v_is_minor then
    v_eligible := false;
  else
    v_eligible := true;
  end if;

  insert into public.personal_questionnaires (
    user_id, profile_type, category, full_name, dob, age, gender,
    blood_group, weight_kg, city, district, pincode, address, phone,
    answers, preliminary_eligible, is_minor, hospital_name, treating_doctor, updated_at
  )
  values (
    v_uid, p_profile_type, p_category, p_full_name, p_dob, p_age, p_gender,
    p_blood_group, p_weight_kg, p_city, p_district, p_pincode, p_address, p_phone,
    p_answers, v_eligible, v_is_minor, p_hospital_name, p_treating_doctor, now()
  )
  on conflict (user_id, profile_type) do update
  set category = excluded.category,
      full_name = excluded.full_name,
      dob = excluded.dob,
      age = excluded.age,
      gender = excluded.gender,
      blood_group = excluded.blood_group,
      weight_kg = excluded.weight_kg,
      city = excluded.city,
      district = excluded.district,
      pincode = excluded.pincode,
      address = excluded.address,
      phone = excluded.phone,
      answers = excluded.answers,
      preliminary_eligible = excluded.preliminary_eligible,
      is_minor = excluded.is_minor,
      hospital_name = excluded.hospital_name,
      treating_doctor = excluded.treating_doctor,
      updated_at = now()
  returning * into v_result;

  -- Also update profiles city and onboarding_step
  update public.profiles
  set city = coalesce(p_city, city),
      onboarding_step = 'questionnaire_completed',
      updated_at = now()
  where id = v_uid;

  -- Store phone in private_contacts if provided
  if p_phone is not null and length(trim(p_phone)) > 0 then
    insert into public.private_contacts (user_id, phone)
    values (v_uid, trim(p_phone))
    on conflict (user_id) do update
    set phone = excluded.phone,
        updated_at = now();
  end if;

  return v_result;
end;
$$;
