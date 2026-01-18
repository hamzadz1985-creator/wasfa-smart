import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  User, 
  FileText, 
  UserPlus, 
  Pencil, 
  Trash2,
  LogIn,
  LogOut,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

export const AuditLogsPanel: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const auditT = (t as any).audit || {};
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }
      if (searchTerm) {
        query = query.or(`user_name.ilike.%${searchTerm}%,entity_name.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query;
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }
      
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, searchTerm]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <UserPlus className="h-4 w-4" />;
      case 'update': return <Pencil className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'login': return <LogIn className="h-4 w-4" />;
      case 'logout': return <LogOut className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'print': return <Printer className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'login': return 'outline';
      case 'logout': return 'outline';
      default: return 'secondary';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'patient': return <User className="h-4 w-4" />;
      case 'prescription': return <FileText className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getLocale = () => {
    switch (language) {
      case 'ar': return ar;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPpp', { locale: getLocale() });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, Record<string, string>> = {
      create: { fr: 'Créer', ar: 'إنشاء', en: 'Create' },
      update: { fr: 'Modifier', ar: 'تعديل', en: 'Update' },
      delete: { fr: 'Supprimer', ar: 'حذف', en: 'Delete' },
      login: { fr: 'Connexion', ar: 'تسجيل دخول', en: 'Login' },
      logout: { fr: 'Déconnexion', ar: 'تسجيل خروج', en: 'Logout' },
      export: { fr: 'Exporter', ar: 'تصدير', en: 'Export' },
      print: { fr: 'Imprimer', ar: 'طباعة', en: 'Print' },
    };
    return labels[action]?.[language] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, Record<string, string>> = {
      patient: { fr: 'Patient', ar: 'مريض', en: 'Patient' },
      prescription: { fr: 'Ordonnance', ar: 'وصفة', en: 'Prescription' },
      template: { fr: 'Modèle', ar: 'قالب', en: 'Template' },
      user: { fr: 'Utilisateur', ar: 'مستخدم', en: 'User' },
    };
    return labels[entityType]?.[language] || entityType;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity Name'];
    const csvData = logs.map(log => [
      formatDateTime(log.created_at),
      log.user_name || 'System',
      getActionLabel(log.action),
      getEntityLabel(log.entity_type),
      log.entity_name || '-'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {auditT.title || 'Activity Log'}
            </h2>
            <p className="text-muted-foreground">
              {auditT.description || 'Track all operations in your clinic'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 me-2" />
            {t.common?.loading ? t.common.loading.replace('...', '') : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 me-2" />
            {auditT.exportCSV || 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl border border-border/30 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={auditT.searchPlaceholder || 'Search by user or entity...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="ps-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 me-2" />
              <SelectValue placeholder={auditT.filterByAction || 'Filter by action'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{auditT.allActions || 'All Actions'}</SelectItem>
              <SelectItem value="create">{getActionLabel('create')}</SelectItem>
              <SelectItem value="update">{getActionLabel('update')}</SelectItem>
              <SelectItem value="delete">{getActionLabel('delete')}</SelectItem>
              <SelectItem value="login">{getActionLabel('login')}</SelectItem>
              <SelectItem value="logout">{getActionLabel('logout')}</SelectItem>
              <SelectItem value="export">{getActionLabel('export')}</SelectItem>
              <SelectItem value="print">{getActionLabel('print')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={auditT.filterByEntity || 'Filter by entity'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{auditT.allEntities || 'All Entities'}</SelectItem>
              <SelectItem value="patient">{getEntityLabel('patient')}</SelectItem>
              <SelectItem value="prescription">{getEntityLabel('prescription')}</SelectItem>
              <SelectItem value="template">{getEntityLabel('template')}</SelectItem>
              <SelectItem value="user">{getEntityLabel('user')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-xl border border-border/30 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <p>{t.common?.loading || 'Loading...'}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{auditT.noLogs || 'No activity logs found'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{auditT.date || 'Date'}</TableHead>
                <TableHead>{auditT.user || 'User'}</TableHead>
                <TableHead>{auditT.action || 'Action'}</TableHead>
                <TableHead>{auditT.entityType || 'Entity Type'}</TableHead>
                <TableHead>{auditT.entityName || 'Entity Name'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDateTime(log.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{log.user_name || 'System'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)} className="gap-1">
                      {getActionIcon(log.action)}
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntityIcon(log.entity_type)}
                      <span>{getEntityLabel(log.entity_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.entity_name || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {auditT.showing || 'Showing'} {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} {auditT.of || 'of'} {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {dir === 'rtl' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <span className="flex items-center px-3 text-sm">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {dir === 'rtl' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
