import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  X,
  CreditCard,
  Users,
  FileText
} from 'lucide-react';
import { Patient } from '@/hooks/usePatients';
import { Prescription } from '@/hooks/usePrescriptions';
import { differenceInDays, parseISO, isToday, isPast } from 'date-fns';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  icon: React.ReactNode;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  patients: Patient[];
  prescriptions: Prescription[];
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  patients, 
  prescriptions 
}) => {
  const { language } = useLanguage();
  const { status, daysRemaining, isActive } = useSubscription();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  const labels = {
    notifications: language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications',
    markAllRead: language === 'ar' ? 'تحديد الكل كمقروء' : language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read',
    noNotifications: language === 'ar' ? 'لا توجد إشعارات' : language === 'fr' ? 'Aucune notification' : 'No notifications',
    viewAll: language === 'ar' ? 'عرض الكل' : language === 'fr' ? 'Voir tout' : 'View All',
    showLess: language === 'ar' ? 'عرض أقل' : language === 'fr' ? 'Voir moins' : 'Show Less',
    trialEnding: language === 'ar' ? 'الفترة التجريبية تنتهي قريباً' : language === 'fr' ? 'Période d\'essai se termine bientôt' : 'Trial ending soon',
    trialEndingMessage: language === 'ar' 
      ? `تبقى ${daysRemaining} أيام على انتهاء الفترة التجريبية`
      : language === 'fr'
      ? `Il reste ${daysRemaining} jours d'essai`
      : `${daysRemaining} days remaining in trial`,
    subscriptionExpired: language === 'ar' ? 'الاشتراك منتهي' : language === 'fr' ? 'Abonnement expiré' : 'Subscription expired',
    subscriptionExpiredMessage: language === 'ar' 
      ? 'يرجى تجديد اشتراكك للاستمرار في إنشاء الوصفات'
      : language === 'fr'
      ? 'Veuillez renouveler votre abonnement pour continuer'
      : 'Please renew your subscription to continue creating prescriptions',
    newPatients: language === 'ar' ? 'مرضى جدد اليوم' : language === 'fr' ? 'Nouveaux patients aujourd\'hui' : 'New patients today',
    prescriptionsToday: language === 'ar' ? 'وصفات اليوم' : language === 'fr' ? 'Prescriptions aujourd\'hui' : 'Prescriptions today',
    welcomeTitle: language === 'ar' ? 'مرحباً بك في WASFA PRO' : language === 'fr' ? 'Bienvenue sur WASFA PRO' : 'Welcome to WASFA PRO',
    welcomeMessage: language === 'ar' 
      ? 'ابدأ بإضافة معلومات العيادة والمرضى'
      : language === 'fr'
      ? 'Commencez par ajouter les informations de la clinique et des patients'
      : 'Start by adding clinic and patient information',
  };

  useEffect(() => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Trial ending notification
    if (status === 'trial' && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0) {
      newNotifications.push({
        id: 'trial-ending',
        type: 'warning',
        icon: <Clock className="h-5 w-5" />,
        title: labels.trialEnding,
        message: labels.trialEndingMessage,
        timestamp: now,
        read: false,
      });
    }

    // Subscription expired notification
    if (status === 'expired' || status === 'suspended') {
      newNotifications.push({
        id: 'subscription-expired',
        type: 'urgent',
        icon: <CreditCard className="h-5 w-5" />,
        title: labels.subscriptionExpired,
        message: labels.subscriptionExpiredMessage,
        timestamp: now,
        read: false,
      });
    }

    // New patients today
    const todayPatients = patients.filter(p => 
      p.created_at && isToday(parseISO(p.created_at))
    );
    if (todayPatients.length > 0) {
      newNotifications.push({
        id: 'new-patients-today',
        type: 'info',
        icon: <Users className="h-5 w-5" />,
        title: labels.newPatients,
        message: `${todayPatients.length} ${language === 'ar' ? 'مريض جديد' : language === 'fr' ? 'nouveau(x) patient(s)' : 'new patient(s)'}`,
        timestamp: now,
        read: false,
      });
    }

    // Prescriptions today
    const todayPrescriptions = prescriptions.filter(p => 
      p.created_at && isToday(parseISO(p.created_at))
    );
    if (todayPrescriptions.length > 0) {
      newNotifications.push({
        id: 'prescriptions-today',
        type: 'success',
        icon: <FileText className="h-5 w-5" />,
        title: labels.prescriptionsToday,
        message: `${todayPrescriptions.length} ${language === 'ar' ? 'وصفة' : language === 'fr' ? 'prescription(s)' : 'prescription(s)'}`,
        timestamp: now,
        read: false,
      });
    }

    // Welcome notification for new users
    if (patients.length === 0 && prescriptions.length === 0) {
      newNotifications.push({
        id: 'welcome',
        type: 'info',
        icon: <Info className="h-5 w-5" />,
        title: labels.welcomeTitle,
        message: labels.welcomeMessage,
        timestamp: now,
        read: false,
      });
    }

    setNotifications(newNotifications);
  }, [patients, prescriptions, status, daysRemaining, language]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      case 'success':
        return 'border-success/30 bg-success/5';
      case 'info':
      default:
        return 'border-info/30 bg-info/5';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'urgent':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'info':
      default:
        return 'text-info';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <Card className="glass border-border/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          {labels.notifications}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
            {labels.markAllRead}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{labels.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border transition-all ${getTypeStyles(notification.type)} ${
                  !notification.read ? 'ring-1 ring-primary/20' : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getIconColor(notification.type)}`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="p-1 hover:bg-muted/50 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}

            {notifications.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-xs"
              >
                {showAll ? labels.showLess : `${labels.viewAll} (${notifications.length})`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
