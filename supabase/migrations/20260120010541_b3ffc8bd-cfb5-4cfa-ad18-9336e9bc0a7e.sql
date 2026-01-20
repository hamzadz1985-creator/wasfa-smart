-- Fix 1: Add created_by check to DELETE policy for favorite_medications
DROP POLICY IF EXISTS "Users can delete favorites in their tenant" ON public.favorite_medications;
CREATE POLICY "Users can delete their own favorites" 
ON public.favorite_medications 
FOR DELETE 
USING (tenant_id = get_user_tenant_id(auth.uid()) AND created_by = auth.uid());

-- Fix 2: Update INSERT policy to also validate created_by
DROP POLICY IF EXISTS "Users can insert favorites in their tenant" ON public.favorite_medications;
CREATE POLICY "Users can insert their own favorites" 
ON public.favorite_medications 
FOR INSERT 
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND created_by = auth.uid());

-- Fix 3: Add role-based constraints to prescriptions
-- Only doctors and clinic admins can create prescriptions, and they must use their own doctor_id
DROP POLICY IF EXISTS "Users can insert prescriptions in their tenant" ON public.prescriptions;
CREATE POLICY "Doctors can create prescriptions under their own name" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND doctor_id = auth.uid()
  AND (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'clinic_admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Update prescription UPDATE policy to only allow the prescribing doctor or admins
DROP POLICY IF EXISTS "Users can update prescriptions in their tenant" ON public.prescriptions;
CREATE POLICY "Doctors can update their own prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (doctor_id = auth.uid() OR has_role(auth.uid(), 'clinic_admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Update prescription DELETE policy to only allow the prescribing doctor or admins
DROP POLICY IF EXISTS "Users can delete prescriptions in their tenant" ON public.prescriptions;
CREATE POLICY "Doctors can delete their own prescriptions" 
ON public.prescriptions 
FOR DELETE 
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (doctor_id = auth.uid() OR has_role(auth.uid(), 'clinic_admin') OR has_role(auth.uid(), 'super_admin'))
);