import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Prescription } from '@/hooks/usePrescriptions';
import { Patient } from '@/hooks/usePatients';
import { TrendingUp, TrendingDown, Users, FileText, Calendar, Activity } from 'lucide-react';

interface StatisticsSectionProps {
  prescriptions: Prescription[];
  patients: Patient[];
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ prescriptions, patients }) => {
  const { t, language } = useLanguage();

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Today's prescriptions
    const todayPrescriptions = prescriptions.filter(p => 
      p.created_at?.startsWith(today)
    ).length;

    // This week's prescriptions
    const weekPrescriptions = prescriptions.filter(p => {
      const date = new Date(p.created_at || '');
      return date >= thisWeekStart;
    }).length;

    // This month's prescriptions
    const monthPrescriptions = prescriptions.filter(p => {
      const date = new Date(p.created_at || '');
      return date >= thisMonthStart;
    }).length;

    // Last month's prescriptions (for comparison)
    const lastMonthPrescriptions = prescriptions.filter(p => {
      const date = new Date(p.created_at || '');
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;

    // Growth percentage
    const growth = lastMonthPrescriptions > 0 
      ? Math.round(((monthPrescriptions - lastMonthPrescriptions) / lastMonthPrescriptions) * 100)
      : 100;

    return {
      todayPrescriptions,
      weekPrescriptions,
      monthPrescriptions,
      lastMonthPrescriptions,
      growth,
      totalPatients: patients.length,
      totalPrescriptions: prescriptions.length,
    };
  }, [prescriptions, patients]);

  // Last 7 days data for line chart
  const last7DaysData = useMemo(() => {
    const data = [];
    const now = new Date();
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString(locale, { weekday: 'short' });
      
      const count = prescriptions.filter(p => 
        p.created_at?.startsWith(dateStr)
      ).length;

      data.push({
        day: dayName,
        prescriptions: count,
      });
    }

    return data;
  }, [prescriptions, language]);

  // Monthly data for bar chart
  const monthlyData = useMemo(() => {
    const data = [];
    const now = new Date();
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString(locale, { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = prescriptions.filter(p => {
        const pDate = new Date(p.created_at || '');
        return pDate >= monthStart && pDate <= monthEnd;
      }).length;

      const patientCount = patients.filter(p => {
        const pDate = new Date(p.created_at || '');
        return pDate >= monthStart && pDate <= monthEnd;
      }).length;

      data.push({
        month: monthName,
        prescriptions: count,
        patients: patientCount,
      });
    }

    return data;
  }, [prescriptions, patients, language]);

  // Gender distribution
  const genderData = useMemo(() => {
    const male = patients.filter(p => p.gender === 'male').length;
    const female = patients.filter(p => p.gender === 'female').length;
    const unknown = patients.filter(p => !p.gender).length;

    return [
      { name: t.patient.male, value: male, color: 'hsl(var(--info))' },
      { name: t.patient.female, value: female, color: 'hsl(var(--accent))' },
      { name: t.common.noData, value: unknown, color: 'hsl(var(--muted))' },
    ].filter(item => item.value > 0);
  }, [patients, t]);

  // Top medications
  const topMedications = useMemo(() => {
    const medCounts: Record<string, number> = {};
    
    prescriptions.forEach(p => {
      p.medications?.forEach(med => {
        const name = med.medication_name;
        medCounts[name] = (medCounts[name] || 0) + 1;
      });
    });

    return Object.entries(medCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [prescriptions]);

  const chartConfig = {
    prescriptions: {
      label: t.dashboard.prescriptions,
      color: 'hsl(var(--primary))',
    },
    patients: {
      label: t.dashboard.patients,
      color: 'hsl(var(--info))',
    },
  };

  const statLabels = {
    today: language === 'ar' ? 'اليوم' : language === 'fr' ? "Aujourd'hui" : 'Today',
    thisWeek: language === 'ar' ? 'هذا الأسبوع' : language === 'fr' ? 'Cette semaine' : 'This Week',
    thisMonth: language === 'ar' ? 'هذا الشهر' : language === 'fr' ? 'Ce mois' : 'This Month',
    growth: language === 'ar' ? 'النمو الشهري' : language === 'fr' ? 'Croissance mensuelle' : 'Monthly Growth',
    last7Days: language === 'ar' ? 'آخر 7 أيام' : language === 'fr' ? '7 derniers jours' : 'Last 7 Days',
    last6Months: language === 'ar' ? 'آخر 6 أشهر' : language === 'fr' ? '6 derniers mois' : 'Last 6 Months',
    genderDistribution: language === 'ar' ? 'توزيع الجنس' : language === 'fr' ? 'Répartition par sexe' : 'Gender Distribution',
    topMedications: language === 'ar' ? 'أكثر الأدوية وصفاً' : language === 'fr' ? 'Médicaments les plus prescrits' : 'Top Medications',
    prescriptionsCount: language === 'ar' ? 'عدد الوصفات' : language === 'fr' ? 'Nombre de prescriptions' : 'Prescriptions Count',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/30 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{statLabels.today}</p>
                <p className="text-3xl font-bold text-foreground">{stats.todayPrescriptions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-info/30 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{statLabels.thisWeek}</p>
                <p className="text-3xl font-bold text-foreground">{stats.weekPrescriptions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{statLabels.thisMonth}</p>
                <p className="text-3xl font-bold text-foreground">{stats.monthPrescriptions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/30 hover:border-success/30 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{statLabels.growth}</p>
                <p className={`text-3xl font-bold ${stats.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.growth >= 0 ? '+' : ''}{stats.growth}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stats.growth >= 0 ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center`}>
                {stats.growth >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Line Chart */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">{statLabels.last7Days}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="colorPrescriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-muted-foreground text-xs" />
                <YAxis className="text-muted-foreground text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="prescriptions" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorPrescriptions)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">{statLabels.last6Months}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground text-xs" />
                <YAxis className="text-muted-foreground text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="prescriptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="patients" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Pie Chart */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">{statLabels.genderDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {genderData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t.common.noData}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Medications */}
        <Card className="glass border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">{statLabels.topMedications}</CardTitle>
          </CardHeader>
          <CardContent>
            {topMedications.length > 0 ? (
              <div className="space-y-3">
                {topMedications.map((med, index) => (
                  <div key={med.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">{med.name}</span>
                        <span className="text-sm text-muted-foreground">{med.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(med.count / (topMedications[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-center">
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t.common.noData}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
