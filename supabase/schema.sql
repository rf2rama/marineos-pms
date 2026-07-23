-- =========================================================================
-- MARINEOS PMS MASTER POSTGRESQL SCHEMA & ROW-LEVEL SECURITY (RLS)
-- Supports Multi-Device Cloud Sync, User Auth, and 11 Maritime Roles
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE (Links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'chief_engineer',
  vessel_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VESSELS TABLE
CREATE TABLE IF NOT EXISTS public.vessels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  imo_number TEXT NOT NULL UNIQUE,
  flag TEXT NOT NULL,
  vessel_type TEXT NOT NULL,
  built_year INT NOT NULL,
  class_society TEXT NOT NULL,
  status TEXT NOT NULL,
  current_location TEXT NOT NULL,
  total_running_hours NUMERIC DEFAULT 0,
  dimensions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS public.equipment (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  maker TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  location TEXT NOT NULL,
  initial_running_hours NUMERIC DEFAULT 0,
  running_hours NUMERIC DEFAULT 0,
  criticality TEXT NOT NULL,
  last_overhaul_date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SPARE PARTS & CONSUMABLES INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id TEXT PRIMARY KEY,
  vessel_id TEXT REFERENCES public.vessels(id) ON DELETE CASCADE,
  equipment_id TEXT REFERENCES public.equipment(id) ON DELETE SET NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  item_category TEXT NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  min_stock_qty INT NOT NULL DEFAULT 0,
  unit_cost_usd NUMERIC NOT NULL DEFAULT 0,
  location_type TEXT NOT NULL,
  location_name TEXT NOT NULL,
  condition_status TEXT NOT NULL DEFAULT 'Good / Ready',
  condition_notes TEXT,
  offloaded_from_vessel_name TEXT,
  status_updated_date DATE,
  installed_at_running_hours NUMERIC,
  installed_date DATE,
  is_currently_installed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SPARE PART REPLACEMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.replacement_history (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  qty_replaced INT NOT NULL,
  date_replaced DATE NOT NULL,
  running_hours_at_change NUMERIC NOT NULL,
  replaced_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MACHINERY RUN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.run_sessions (
  id TEXT PRIMARY KEY,
  equipment_id TEXT NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  stop_time TEXT NOT NULL,
  hours_calculated NUMERIC NOT NULL,
  logged_by TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REQUISITION ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.requisitions (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  requisition_no TEXT NOT NULL UNIQUE,
  requested_by TEXT NOT NULL,
  date_requested DATE NOT NULL,
  supplier_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_cost_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Vessel Requested',
  origin_location_type TEXT NOT NULL,
  origin_location_name TEXT NOT NULL,
  delivery_port TEXT NOT NULL,
  estimated_delivery_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUPPLIERS & VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  contact_email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Approved Supplier',
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREW MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.crew_members (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  nationality TEXT NOT NULL,
  seaman_book_no TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  current_vessel_id TEXT REFERENCES public.vessels(id) ON DELETE SET NULL,
  current_vessel_name TEXT,
  sign_on_date DATE,
  sign_off_date_planned DATE,
  certificates JSONB DEFAULT '[]'::jsonb,
  assignment_history JSONB DEFAULT '[]'::jsonb,
  medical_records JSONB DEFAULT '[]'::jsonb,
  accident_records JSONB DEFAULT '[]'::jsonb,
  personal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INCIDENTS & NEAR-MISSES TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  vessel_name TEXT,
  title TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  date_reported DATE NOT NULL,
  location_onboard TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  crew_involved_ids JSONB DEFAULT '[]'::jsonb,
  crew_involved_names TEXT,
  handled_by_crew_name TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EMERGENCY DRILLS TABLE
CREATE TABLE IF NOT EXISTS public.drills (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  vessel_name TEXT,
  drill_type TEXT NOT NULL,
  date_conducted DATE NOT NULL,
  drilled_by TEXT NOT NULL,
  attendees_count INT NOT NULL,
  evaluation TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NON-CONFORMITIES (NCs) TABLE
CREATE TABLE IF NOT EXISTS public.non_conformities (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  vessel_name TEXT,
  audit_type TEXT NOT NULL,
  finding_description TEXT NOT NULL,
  finding_type TEXT NOT NULL,
  date_found DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PMS MAINTENANCE JOBS TABLE
CREATE TABLE IF NOT EXISTS public.maintenance_jobs (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  vessel_name TEXT,
  equipment_id TEXT NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  interval_type TEXT NOT NULL,
  interval_days INT,
  interval_hours NUMERIC,
  completion_window_days INT,
  last_done_date DATE,
  last_done_hours NUMERIC,
  next_due_date DATE NOT NULL,
  next_due_hours NUMERIC,
  class_survey_required BOOLEAN DEFAULT FALSE,
  class_society_ref TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  estimated_man_hours NUMERIC NOT NULL,
  required_parts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PMS JOB EXECUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_executions (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES public.maintenance_jobs(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  date_completed DATE NOT NULL,
  running_hours_at_execution NUMERIC NOT NULL,
  completed_by TEXT NOT NULL,
  findings TEXT NOT NULL,
  parts_used JSONB DEFAULT '[]'::jsonb,
  actual_man_hours NUMERIC NOT NULL,
  estimated_man_hours NUMERIC NOT NULL,
  days_late_or_early INT NOT NULL DEFAULT 0,
  signed_off_by_chief BOOLEAN DEFAULT FALSE,
  signed_off_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ENGINE DAILY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  logged_by TEXT NOT NULL,
  main_engine_rpm NUMERIC NOT NULL,
  main_engine_load_percent NUMERIC NOT NULL,
  exhaust_temp_avg NUMERIC NOT NULL,
  lube_oil_pressure_bar NUMERIC NOT NULL,
  fuel_consumption_tons_per_day NUMERIC NOT NULL,
  aux_gen1_hours NUMERIC NOT NULL,
  aux_gen2_hours NUMERIC NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DRYDOCK PROJECTS & WORK ORDERS TABLES
CREATE TABLE IF NOT EXISTS public.drydock_projects (
  id TEXT PRIMARY KEY,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  shipyard_name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_planned_budget_usd NUMERIC NOT NULL DEFAULT 0,
  total_actual_cost_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planning',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_orders (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.drydock_projects(id) ON DELETE CASCADE,
  vessel_id TEXT NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  equipment_ref TEXT NOT NULL,
  scope_description TEXT NOT NULL,
  contractor_name TEXT,
  contractor_quote_usd NUMERIC,
  actual_cost_usd NUMERIC,
  planned_budget_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  public_token TEXT NOT NULL UNIQUE,
  deadline DATE NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replacement_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drydock_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for authenticated/anon client key (Permissive for PMS staff)
CREATE POLICY "Allow anon read all" ON public.vessels FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.spare_parts FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.replacement_history FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.run_sessions FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.requisitions FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.crew_members FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.drills FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.non_conformities FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.maintenance_jobs FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.job_executions FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.drydock_projects FOR SELECT USING (true);
CREATE POLICY "Allow anon read all" ON public.work_orders FOR SELECT USING (true);

CREATE POLICY "Allow anon insert all" ON public.vessels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.spare_parts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.replacement_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.run_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.requisitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.crew_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.drills FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.non_conformities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.maintenance_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.job_executions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.drydock_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert all" ON public.work_orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update all" ON public.vessels FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.equipment FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.spare_parts FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.replacement_history FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.run_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.requisitions FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.crew_members FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.incidents FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.drills FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.non_conformities FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.maintenance_jobs FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.job_executions FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.daily_logs FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.drydock_projects FOR UPDATE USING (true);
CREATE POLICY "Allow anon update all" ON public.work_orders FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete all" ON public.vessels FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.equipment FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.spare_parts FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.replacement_history FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.run_sessions FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.requisitions FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.suppliers FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.crew_members FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.incidents FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.drills FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.non_conformities FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.maintenance_jobs FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.job_executions FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.daily_logs FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.drydock_projects FOR DELETE USING (true);
CREATE POLICY "Allow anon delete all" ON public.work_orders FOR DELETE USING (true);
