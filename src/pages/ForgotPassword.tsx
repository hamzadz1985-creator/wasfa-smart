import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast({
          title: t.common.error,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setEmailSent(true);
        toast({
          title: t.common.success,
          description: t.auth.resetEmailSent || 'تم إرسال رابط إعادة تعيين كلمة المرور',
        });
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.auth.unexpectedError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 dark" dir={dir}>
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <BackArrow className="h-4 w-4" />
          {t.common.back}
        </Link>

        <div className="glass rounded-2xl p-8 border border-border/50">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold text-foreground">WASFA PRO</span>
          </div>

          {emailSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">
                {t.auth.checkEmail || 'تحقق من بريدك الإلكتروني'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t.auth.resetEmailSentDescription || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'}
              </p>
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  {t.auth.backToLogin || 'العودة لتسجيل الدخول'}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
                {t.auth.forgotPassword}
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                {t.auth.forgotPasswordSubtitle || 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">{t.auth.email}</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="doctor@example.com" 
                      className="ps-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button variant="hero" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    t.auth.sendResetLink || 'إرسال رابط إعادة التعيين'
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {t.auth.rememberPassword || 'تتذكر كلمة المرور؟'}{' '}
                <Link to="/auth" className="text-primary hover:underline font-medium">
                  {t.auth.loginHere}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
