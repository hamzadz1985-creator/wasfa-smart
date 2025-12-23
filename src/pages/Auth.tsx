import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

const Auth: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 dark">
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Link>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-8 border border-border/50">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold text-foreground">WASFA PRO</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">
            {isSignup ? t.auth.signup : t.auth.login}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {isSignup ? 'Créez votre compte pour commencer' : 'Connectez-vous à votre compte'}
          </p>

          {/* Form */}
          <form className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Dr. Jean Dupont" className="pl-10" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="docteur@exemple.com" className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
              </div>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10" />
                </div>
              </div>
            )}

            {!isSignup && (
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">
                  {t.auth.forgotPassword}
                </a>
              </div>
            )}

            <Button variant="hero" className="w-full" size="lg">
              {isSignup ? t.auth.createAccount : t.auth.login}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? t.auth.hasAccount : t.auth.noAccount}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover:underline font-medium"
            >
              {isSignup ? t.auth.loginHere : t.auth.signupHere}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
