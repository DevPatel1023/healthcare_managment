-- This SQL script creates the necessary tables and RLS policies for the Healthcare Management System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  phone TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT DEFAULT NULL,
  specialization TEXT DEFAULT NULL,
  department TEXT DEFAULT NULL,
  enable_notifications BOOLEAN DEFAULT TRUE
);

-- Create doctors table with additional doctor-specific information
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id TEXT UNIQUE GENERATED ALWAYS AS ('DOC-' || substr(md5(random()::text), 1, 5)) STORED,
  specialization TEXT NOT NULL,
  department TEXT DEFAULT NULL,
  available BOOLEAN DEFAULT TRUE
);

-- Create patients table with additional patient-specific information
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id TEXT UNIQUE GENERATED ALWAYS AS ('PAT-' || substr(md5(random()::text), 1, 5)) STORED,
  date_of_birth DATE DEFAULT NULL,
  blood_group TEXT DEFAULT NULL,
  allergies TEXT[] DEFAULT NULL
);

-- Create conditions table
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Create patient conditions junction table
CREATE TABLE IF NOT EXISTS patient_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  condition_id UUID REFERENCES conditions(id) ON DELETE CASCADE,
  diagnosed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT DEFAULT NULL,
  UNIQUE(patient_id, condition_id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  reason TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  file_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL
);

-- Insert some common medical conditions
INSERT INTO conditions (name) VALUES
  ('Diabetes'),
  ('Hypertension'),
  ('Asthma'),
  ('Arthritis'),
  ('Migraine'),
  ('High Cholesterol'),
  ('Anxiety'),
  ('Heart Disease'),
  ('Depression'),
  ('Thyroid Disorder'),
  ('Sleep Apnea'),
  ('Obesity')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: First, create a policy that allows authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for doctors
CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  USING (true);

CREATE POLICY "Doctors can update their own record"
  ON doctors FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Doctors can insert their own record"
  ON doctors FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for patients
CREATE POLICY "Patients can view their own record"
  ON patients FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Doctors can view all patients"
  ON patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor'));

CREATE POLICY "Patients can update their own record"
  ON patients FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Patients can insert their own record"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for appointments
CREATE POLICY "Patients can view their own appointments"
  ON appointments FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update appointments"
  ON appointments FOR UPDATE
  USING (doctor_id = auth.uid());

-- Create policies for reports
CREATE POLICY "Patients can view their own reports"
  ON reports FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view and create reports for their patients"
  ON reports FOR ALL
  USING (doctor_id = auth.uid() OR 
        (EXISTS (SELECT 1 FROM appointments WHERE appointments.doctor_id = auth.uid() AND appointments.patient_id = reports.patient_id)));

-- Create policies for invoices
CREATE POLICY "Patients can view their own invoices"
  ON invoices FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view and create invoices"
  ON invoices FOR ALL
  USING (doctor_id = auth.uid());

-- Create policies for invoice items
CREATE POLICY "Anyone can view invoice items"
  ON invoice_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND 
                (invoices.patient_id = auth.uid() OR invoices.doctor_id = auth.uid())));

CREATE POLICY "Doctors can create invoice items"
  ON invoice_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.doctor_id = auth.uid()));

-- Create policies for conditions
CREATE POLICY "Anyone can view conditions"
  ON conditions FOR SELECT
  USING (true);

-- Create policies for patient_conditions
CREATE POLICY "Patients can view their own conditions"
  ON patient_conditions FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient conditions"
  ON patient_conditions FOR SELECT
  USING (EXISTS (SELECT 1 FROM appointments WHERE appointments.doctor_id = auth.uid() AND appointments.patient_id = patient_conditions.patient_id));

CREATE POLICY "Doctors can create patient conditions"
  ON patient_conditions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM appointments WHERE appointments.doctor_id = auth.uid() AND appointments.patient_id = patient_conditions.patient_id));
