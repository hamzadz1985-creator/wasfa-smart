import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/LanguageSelector';
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
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Building2
} from 'lucide-react';

type ActiveSection = 'overview' | 'patients' | 'prescriptions' | 'templates' | 'settings';

const Dashboard: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const stats = [
    { label: t.dashboard.patients, value: '0', icon: Users, color: 'text-info', bgColor: 'bg-info/10' },
    { label: t.dashboard.prescriptions, value: '0', icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: t.dashboard.templates, value: '0', icon: LayoutTemplate, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: t.dashboard.today, value: '0', icon: Calendar, color: 'text-success', bgColor: 'bg-success/10' },
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
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    activeSection === item.key 
                      ? 'bg-sidebar-accent text-sidebar-primary' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
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
                  {user?.user_metadata?.full_name || t.dashboard.user}
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
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {t.dashboard.welcome}، {user?.user_metadata?.full_name || t.dashboard.doctor}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t.common.search + '...'}
                className="ps-10 w-64"
              />
            </div>
            <LanguageSelector />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="hero">
              <Plus className="h-4 w-4 me-2" />
              {t.dashboard.newPrescription}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeSection === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="glass rounded-xl p-5 border border-border/30 hover:border-primary/30 transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <button className="glass rounded-xl p-6 border border-border/30 hover:border-primary/50 transition-all text-start group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.prescription.new}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.createNewPrescription}</p>
                </button>
                
                <button className="glass rounded-xl p-6 border border-border/30 hover:border-info/50 transition-all text-start group">
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                    <Users className="h-6 w-6 text-info" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{t.patient.add}</h3>
                  <p className="text-sm text-muted-foreground">{t.dashboard.addNewPatient}</p>
                </button>
                
                <button className="glass rounded-xl p-6 border border-border/30 hover:border-accent/50 transition-all text-start group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
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
                    <Button variant="ghost" size="sm" className="text-primary">
                      {t.dashboard.viewAll}
                    </Button>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t.patient.noPatients}</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 me-2" />
                      {t.patient.add}
                    </Button>
                  </div>
                </div>

                {/* Recent Prescriptions */}
                <div className="glass rounded-xl border border-border/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{t.dashboard.recentPrescriptions}</h3>
                    <Button variant="ghost" size="sm" className="text-primary">
                      {t.dashboard.viewAll}
                    </Button>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t.common.noData}</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 me-2" />
                      {t.prescription.new}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Doctor Info Card */}
              <div className="mt-6 glass rounded-xl border border-border/30 p-6">
                <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {user?.user_metadata?.full_name || t.settings.fullName}
                    </h3>
                    <p className="text-muted-foreground mb-4">{t.dashboard.generalDoctor}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t.dashboard.clinic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{t.dashboard.licenseNumber}: ---</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    {t.dashboard.editProfile}
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'patients' && (
            <div className="glass rounded-xl border border-border/30 p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-foreground">{t.dashboard.patients}</h2>
                <Button variant="hero">
                  <Plus className="h-4 w-4 me-2" />
                  {t.patient.add}
                </Button>
              </div>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t.patient.search} className="ps-10" />
                </div>
              </div>
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t.patient.noPatients}</p>
                <p className="text-sm mt-2">{t.dashboard.startAddPatient}</p>
              </div>
            </div>
          )}

          {activeSection === 'prescriptions' && (
            <div className="glass rounded-xl border border-border/30 p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-foreground">{t.dashboard.prescriptions}</h2>
                <Button variant="hero">
                  <Plus className="h-4 w-4 me-2" />
                  {t.prescription.new}
                </Button>
              </div>
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t.common.noData}</p>
                <p className="text-sm mt-2">{t.dashboard.startCreatePrescription}</p>
              </div>
            </div>
          )}

          {activeSection === 'templates' && (
            <div className="glass rounded-xl border border-border/30 p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-foreground">{t.dashboard.templates}</h2>
                <Button variant="hero">
                  <Plus className="h-4 w-4 me-2" />
                  {t.dashboard.newTemplate}
                </Button>
              </div>
              <div className="text-center py-16 text-muted-foreground">
                <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t.dashboard.noTemplates}</p>
                <p className="text-sm mt-2">{t.dashboard.createTemplatesHint}</p>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="glass rounded-xl border border-border/30 p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{t.dashboard.settings}</h2>
              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.doctorInfo}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.fullName}</label>
                      <Input defaultValue={user?.user_metadata?.full_name || ''} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.specialty}</label>
                      <Input placeholder={t.dashboard.generalDoctor} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.licenseNumber}</label>
                      <Input placeholder={t.settings.licenseNumber} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.phone}</label>
                      <Input placeholder="+966 50 000 0000" />
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-border pb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.clinicInfo}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.clinicName}</label>
                      <Input placeholder={t.settings.clinicName} />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.address}</label>
                      <Input placeholder={t.settings.address} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-muted-foreground mb-2">{t.settings.prescriptionFooter}</label>
                      <Input placeholder={t.settings.prescriptionFooterHint} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">{t.common.cancel}</Button>
                  <Button variant="hero">{t.common.save}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;