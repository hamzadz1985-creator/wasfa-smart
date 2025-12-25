
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'clinic_admin', 'doctor', 'assistant');

-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'expired', 'suspended');

-- ============================================
-- TENANTS TABLE (Clinics)
-- ============================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  footer_note TEXT,
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE (Users - Doctors/Staff)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialty TEXT,
  license_number TEXT,
  phone TEXT,
  signature_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER ROLES TABLE (Separate for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'doctor',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender gender_type,
  phone TEXT,
  allergies TEXT,
  chronic_diseases TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRESCRIPTION MEDICATIONS TABLE
-- ============================================
CREATE TABLE public.prescription_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  form TEXT,
  frequency TEXT,
  duration TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.prescription_medications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRESCRIPTION TEMPLATES TABLE
-- ============================================
CREATE TABLE public.prescription_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEMPLATE MEDICATIONS TABLE
-- ============================================
CREATE TABLE public.template_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.prescription_templates(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  form TEXT,
  frequency TEXT,
  duration TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.template_medications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FAVORITE MEDICATIONS TABLE
-- ============================================
CREATE TABLE public.favorite_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  form TEXT,
  frequency TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.favorite_medications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view their tenant"
ON public.tenants FOR SELECT
TO authenticated
USING (id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Clinic admins can update their tenant"
ON public.tenants FOR UPDATE
TO authenticated
USING (id = public.get_user_tenant_id(auth.uid()) AND 
       (public.has_role(auth.uid(), 'clinic_admin') OR public.has_role(auth.uid(), 'super_admin')));

-- Profiles: Users in same tenant can view profiles
CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- User Roles: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Patients: Tenant isolation
CREATE POLICY "Users can view patients in their tenant"
ON public.patients FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert patients in their tenant"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update patients in their tenant"
ON public.patients FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete patients in their tenant"
ON public.patients FOR DELETE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Prescriptions: Tenant isolation
CREATE POLICY "Users can view prescriptions in their tenant"
ON public.prescriptions FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert prescriptions in their tenant"
ON public.prescriptions FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update prescriptions in their tenant"
ON public.prescriptions FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete prescriptions in their tenant"
ON public.prescriptions FOR DELETE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Prescription Medications: Through prescription tenant
CREATE POLICY "Users can view prescription medications"
ON public.prescription_medications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can insert prescription medications"
ON public.prescription_medications FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can update prescription medications"
ON public.prescription_medications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can delete prescription medications"
ON public.prescription_medications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions p
    WHERE p.id = prescription_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- Prescription Templates: Tenant isolation
CREATE POLICY "Users can view templates in their tenant"
ON public.prescription_templates FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert templates in their tenant"
ON public.prescription_templates FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update templates in their tenant"
ON public.prescription_templates FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete templates in their tenant"
ON public.prescription_templates FOR DELETE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Template Medications: Through template tenant
CREATE POLICY "Users can view template medications"
ON public.template_medications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescription_templates t
    WHERE t.id = template_id
    AND t.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can insert template medications"
ON public.template_medications FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.prescription_templates t
    WHERE t.id = template_id
    AND t.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can update template medications"
ON public.template_medications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescription_templates t
    WHERE t.id = template_id
    AND t.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can delete template medications"
ON public.template_medications FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prescription_templates t
    WHERE t.id = template_id
    AND t.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- Favorite Medications: Tenant isolation
CREATE POLICY "Users can view favorites in their tenant"
ON public.favorite_medications FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert favorites in their tenant"
ON public.favorite_medications FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete favorites in their tenant"
ON public.favorite_medications FOR DELETE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.prescription_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER: Create tenant and profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create a new tenant for this user
  INSERT INTO public.tenants (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'عيادة جديدة'))
  RETURNING id INTO new_tenant_id;
  
  -- Create profile linked to tenant
  INSERT INTO public.profiles (id, tenant_id, full_name)
  VALUES (
    NEW.id,
    new_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign doctor role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX idx_patients_full_name ON public.patients(full_name);
CREATE INDEX idx_prescriptions_tenant_id ON public.prescriptions(tenant_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX idx_prescription_templates_tenant_id ON public.prescription_templates(tenant_id);
