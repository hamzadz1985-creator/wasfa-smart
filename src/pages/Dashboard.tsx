import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { PatientsList } from '@/components/patients/PatientsList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PrescriptionsList } from '@/components/prescriptions/PrescriptionsList';
import { TemplatesList } from '@/components/templates/TemplatesList';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { usePatients, Patient } from '@/hooks/usePatients';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useTemplates } from '@/hooks/useTemplates';
import { useProfile } from '@/hooks/useProfile';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LayoutTemplate, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Building2,
  Activity
} from 'lucide-react';

type ActiveSection = 'overview' | 'patients' | 'prescriptions' | 'templates' | 'settings' | 'patient-details';

const Dashboard: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { patients } = usePatients();
  const { prescriptions } = usePrescriptions();
  const { templates } = useTemplates();
  const { profile, tenant } = useProfile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Calculate today's prescriptions
  const today = new Date().toISOString().split('T')[0];
  const todayPrescriptions = prescriptions.filter(p => 
    p.created_at?.startsWith(today)
  ).length;

  const stats = [
    { label: t.dashboard.patients, value: patients.length.toString(), icon: Users, color: 'text-info', bgColor: 'bg-info/10' },
    { label: t.dashboard.prescriptions, value: prescriptions.length.toString(), icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: t.dashboard.templates, value: templates.length.toString(), icon: LayoutTemplate, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: t.dashboard.today, value: todayPrescriptions.toString(), icon: Calendar, color: 'text-success', bgColor: 'bg-success/10' },
  ];

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard.overview, key: 'overview' as ActiveSection },
    { icon: Users, label: t.dashboard.patients, key: 'patients' as ActiveSection },
    { icon: FileText, label: t.dashboard.prescriptions, key: 'prescriptions' as ActiveSection },
    { icon: LayoutTemplate, label: t.dashboard.templates, key: 'templates' as ActiveSection },
    { icon: Settings, label: t.dashboard.settings, key: 'settings' as ActiveSection },
  ];

  const CollapseIcon = dir === 'rtl' 
    ? (sidebarCollapsed ? ChevronLeft : ChevronRight)
    : (sidebarCollapsed ? ChevronRight : ChevronLeft);

  const formatDate = () => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date().toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const doctorName = profile?.full_name || user?.user_metadata?.full_name || t.dashboard.doctor;
  const clinicName = tenant?.name || t.dashboard.clinic;

  return (
    <div className="min-h-screen bg-background dark flex" dir={dir}>
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-sidebar border-e border-sidebar-border flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground">WASFA PRO</span>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 -end-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors z-10"
        >
          <CollapseIcon className="h-4 w-4" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.key 
                      ? 'bg-sidebar-accent text-sidebar-primary shadow-md' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {doctorName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} text-sidebar-foreground hover:text-destructive`}
            onClick={handleLogout}
            title={sidebarCollapsed ? t.nav.logout : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ms-2">{t.nav.logout}</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-lg sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {t.dashboard.welcome}، {doctorName}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="hero" onClick={() => setActiveSection('prescriptions')}>
              <Plus className="h-4 w-4 me-2" />
              {t.dashboard.newPrescription}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 animate-fade-in">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="glass rounded-xl p-5 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveSection('prescriptions')}
                  className="glass rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all duration-300 text-start group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.prescription.new}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.createNewPrescription}</p>
                </button>
                
                <button 
                  onClick={() => setActiveSection('patients')}
                  className="glass rounded-xl p-6 border border-border/30 hover:border-info/50 transition-all duration-300 text-start group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 group-hover:scale-110 transition-all">
                    <Users className="h-6 w-6 text-info" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.patient.add}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.addNewPatient}</p>
                </button>
                
                <button 
                  onClick={() => setActiveSection('templates')}
                  className="glass rounded-xl p-6 border border-border/30 hover:border-accent/50 transition-all duration-300 text-start group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                    <LayoutTemplate className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.dashboard.newTemplate}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.createPrescriptionTemplate}</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <div className="glass rounded-xl border border-border/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{t.dashboard.recentPatients}</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveSection('patients')}>
                      {t.dashboard.viewAll}
                    </Button>
                  </div>
                  {patients.length > 0 ? (
                    <div className="space-y-3">
                      {patients.slice(0, 5).map((patient) => (
                        <div key={patient.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-info" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{patient.full_name}</p>
                            <p className="text-xs text-muted-foreground">{patient.phone || '---'}</p>
                          </div>
                          {patient.gender && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {patient.gender === 'male' ? t.patient.male : t.patient.female}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.patient.noPatients}</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveSection('patients')}>
                        <Plus className="h-4 w-4 me-2" />
                        {t.patient.add}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recent Prescriptions */}
                <div className="glass rounded-xl border border-border/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{t.dashboard.recentPrescriptions}</h3>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveSection('prescriptions')}>
                      {t.dashboard.viewAll}
                    </Button>
                  </div>
                  {prescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {prescriptions.slice(0, 5).map((prescription) => (
                        <div key={prescription.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {prescription.patient?.full_name || t.common.noData}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(prescription.created_at || '').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                            {prescription.medications?.length || 0} {t.prescription.medications}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.common.noData}</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveSection('prescriptions')}>
                        <Plus className="h-4 w-4 me-2" />
                        {t.prescription.new}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Doctor Info Card */}
              <div className="glass rounded-xl border border-border/30 p-6">
                <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {doctorName}
                    </h3>
                    <p className="text-muted-foreground mb-4">{profile?.specialty || t.dashboard.generalDoctor}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{clinicName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{t.dashboard.licenseNumber}: {profile?.license_number || '---'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>{prescriptions.length} {t.dashboard.prescriptions}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setActiveSection('settings')}>
                    {t.dashboard.editProfile}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'patients' && (
            <PatientsList 
              onCreatePrescription={() => setActiveSection('prescriptions')}
              onViewPatient={(patient) => {
                setSelectedPatient(patient);
                setActiveSection('patient-details');
              }}
            />
          )}

          {activeSection === 'patient-details' && selectedPatient && (
            <PatientDetails
              patient={selectedPatient}
              onBack={() => {
                setSelectedPatient(null);
                setActiveSection('patients');
              }}
              onCreatePrescription={() => setActiveSection('prescriptions')}
            />
          )}

          {activeSection === 'prescriptions' && (
            <PrescriptionsList />
          )}

          {activeSection === 'templates' && (
            <TemplatesList />
          )}

          {activeSection === 'settings' && (
            <SettingsPanel />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
