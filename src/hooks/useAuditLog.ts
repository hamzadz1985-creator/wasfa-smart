import { supabase } from '@/integrations/supabase/client';

type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'print';
type EntityType = 'patient' | 'prescription' | 'template' | 'user' | 'settings';

interface LogAuditParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  oldData?: any;
  newData?: any;
}

export const useAuditLog = () => {
  const logAction = async ({
    action,
    entityType,
    entityId,
    entityName,
    oldData,
    newData
  }: LogAuditParams) => {
    try {
      // Use the database function to log the event
      const { error } = await supabase.rpc('log_audit_event', {
        _action: action,
        _entity_type: entityType,
        _entity_id: entityId || null,
        _entity_name: entityName || null,
        _old_data: oldData ? JSON.stringify(oldData) : null,
        _new_data: newData ? JSON.stringify(newData) : null
      });

      if (error) {
        console.error('Error logging audit event:', error);
      }
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  };

  return { logAction };
};
