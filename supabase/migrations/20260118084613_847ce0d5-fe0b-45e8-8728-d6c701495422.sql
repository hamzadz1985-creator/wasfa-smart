-- Create audit_logs table for tracking all operations
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout', 'export', 'print')),
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only clinic admins and super admins can view logs
CREATE POLICY "Admins can view audit logs in their tenant"
ON public.audit_logs
FOR SELECT
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'clinic_admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow inserting logs for authenticated users in their tenant
CREATE POLICY "Users can insert audit logs in their tenant"
ON public.audit_logs
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _entity_name text DEFAULT NULL,
  _old_data jsonb DEFAULT NULL,
  _new_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
  _tenant_id uuid;
  _user_name text;
BEGIN
  -- Get user's tenant_id
  SELECT tenant_id INTO _tenant_id FROM public.profiles WHERE id = auth.uid();
  
  -- Get user's name
  SELECT full_name INTO _user_name FROM public.profiles WHERE id = auth.uid();
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    entity_name,
    old_data,
    new_data
  ) VALUES (
    _tenant_id,
    auth.uid(),
    _user_name,
    _action,
    _entity_type,
    _entity_id,
    _entity_name,
    _old_data,
    _new_data
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Trigger function for patients table
CREATE OR REPLACE FUNCTION public.audit_patients_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_name text;
BEGIN
  SELECT full_name INTO _user_name FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, new_data)
    VALUES (NEW.tenant_id, auth.uid(), _user_name, 'create', 'patient', NEW.id, NEW.full_name, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, old_data, new_data)
    VALUES (NEW.tenant_id, auth.uid(), _user_name, 'update', 'patient', NEW.id, NEW.full_name, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, old_data)
    VALUES (OLD.tenant_id, auth.uid(), _user_name, 'delete', 'patient', OLD.id, OLD.full_name, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for prescriptions table
CREATE OR REPLACE FUNCTION public.audit_prescriptions_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_name text;
  _patient_name text;
BEGIN
  SELECT full_name INTO _user_name FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO _patient_name FROM public.patients WHERE id = NEW.patient_id;
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, new_data)
    VALUES (NEW.tenant_id, auth.uid(), _user_name, 'create', 'prescription', NEW.id, _patient_name, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    SELECT full_name INTO _patient_name FROM public.patients WHERE id = NEW.patient_id;
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, old_data, new_data)
    VALUES (NEW.tenant_id, auth.uid(), _user_name, 'update', 'prescription', NEW.id, _patient_name, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT full_name INTO _patient_name FROM public.patients WHERE id = OLD.patient_id;
    INSERT INTO public.audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_name, old_data)
    VALUES (OLD.tenant_id, auth.uid(), _user_name, 'delete', 'prescription', OLD.id, _patient_name, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_patients_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.audit_patients_changes();

CREATE TRIGGER audit_prescriptions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_prescriptions_changes();