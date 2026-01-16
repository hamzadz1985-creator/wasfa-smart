import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Shield, 
  Trash2, 
  User,
  Stethoscope,
  Building2,
  UserCog,
  Loader2
} from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  specialty: string | null;
  role: AppRole;
}

export const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const { tenant, profile } = useProfile();
  const { canManageClinic, isSuperAdmin, isClinicAdmin } = useUserRole();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('doctor');
  const [invitePassword, setInvitePassword] = useState('');

  useEffect(() => {
    if (tenant?.id) {
      fetchTeamMembers();
    }
  }, [tenant?.id]);

  const fetchTeamMembers = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch profiles for this tenant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, specialty, tenant_id')
        .eq('tenant_id', tenant.id);

      if (profilesError) throw profilesError;

      // Fetch roles for these users
      const members: TeamMember[] = [];
      
      for (const prof of profiles || []) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', prof.id)
          .maybeSingle();

        members.push({
          id: prof.id,
          user_id: prof.id,
          full_name: prof.full_name,
          email: '', // We can't access auth.users directly
          specialty: prof.specialty,
          role: roleData?.role || 'doctor',
        });
      }

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: t.common.error,
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id || !inviteEmail || !inviteFullName || !invitePassword) return;

    setIsInviting(true);
    try {
      // Create new user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: {
          data: {
            full_name: inviteFullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Update the profile to link to this tenant
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: tenant.id })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Insert user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: inviteRole,
        });

      if (roleError) {
        console.error('Role insert error:', roleError);
      }

      toast({
        title: t.common.success,
        description: (t as any).users?.userInvited || 'User invited successfully',
      });

      // Reset form
      setInviteEmail('');
      setInviteFullName('');
      setInvitePassword('');
      setInviteRole('doctor');
      setIsDialogOpen(false);
      
      // Refresh list
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: t.common.error,
        description: error.message || 'Failed to invite user',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: t.common.success,
        description: (t as any).users?.roleUpdated || 'Role updated successfully',
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: t.common.error,
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm((t as any).users?.confirmRemove || 'Are you sure you want to remove this user?')) {
      return;
    }

    try {
      // Remove from tenant (update profile)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: null })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Remove role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error removing role:', roleError);
      }

      toast({
        title: t.common.success,
        description: (t as any).users?.userRemoved || 'User removed from clinic',
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: t.common.error,
        description: 'Failed to remove user',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case 'super_admin':
        return Shield;
      case 'clinic_admin':
        return Building2;
      case 'doctor':
        return Stethoscope;
      case 'assistant':
        return UserCog;
      default:
        return User;
    }
  };

  const getRoleLabel = (role: AppRole): string => {
    const roles = (t as any).roles || {};
    switch (role) {
      case 'super_admin':
        return roles.superAdmin || 'Super Admin';
      case 'clinic_admin':
        return roles.clinicAdmin || 'Clinic Admin';
      case 'doctor':
        return roles.doctor || 'Doctor';
      case 'assistant':
        return roles.assistant || 'Assistant';
      default:
        return role;
    }
  };

  const getRoleColor = (role: AppRole): string => {
    switch (role) {
      case 'super_admin':
        return 'text-destructive';
      case 'clinic_admin':
        return 'text-primary';
      case 'doctor':
        return 'text-info';
      case 'assistant':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  if (!canManageClinic) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {(t as any).roles?.noPermission || 'You do not have permission to access this section'}
          </p>
        </div>
      </div>
    );
  }

  const usersTranslations = (t as any).users || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {usersTranslations.teamManagement || 'Team Management'}
          </h2>
          <p className="text-muted-foreground">
            {usersTranslations.manageTeamDescription || 'Manage your clinic team members and their roles'}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <UserPlus className="h-4 w-4 me-2" />
              {usersTranslations.inviteUser || 'Invite User'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {usersTranslations.inviteNewUser || 'Invite New Team Member'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.auth.fullName}</Label>
                <Input
                  id="fullName"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{usersTranslations.role || 'Role'}</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isClinicAdmin && (
                      <SelectItem value="clinic_admin">{getRoleLabel('clinic_admin')}</SelectItem>
                    )}
                    <SelectItem value="doctor">{getRoleLabel('doctor')}</SelectItem>
                    <SelectItem value="assistant">{getRoleLabel('assistant')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={isInviting} className="flex-1">
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      {t.common.loading}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 me-2" />
                      {usersTranslations.invite || 'Invite'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members Table */}
      <div className="glass rounded-xl border border-border/30 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">
              {usersTranslations.noTeamMembers || 'No team members yet'}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <UserPlus className="h-4 w-4 me-2" />
              {usersTranslations.inviteFirstUser || 'Invite your first team member'}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.auth.fullName}</TableHead>
                <TableHead>{usersTranslations.specialty || t.settings.specialty}</TableHead>
                <TableHead>{usersTranslations.role || 'Role'}</TableHead>
                <TableHead className="text-end">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                const isCurrentUser = member.id === profile?.id;
                
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {member.full_name}
                            {isCurrentUser && (
                              <span className="ms-2 text-xs text-muted-foreground">
                                ({usersTranslations.you || 'You'})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.specialty || '---'}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${getRoleColor(member.role)}`}>
                        <RoleIcon className="h-4 w-4" />
                        <span>{getRoleLabel(member.role)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser && (isSuperAdmin || isClinicAdmin) && (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(v) => handleUpdateRole(member.id, v as AppRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {isSuperAdmin && (
                                  <SelectItem value="clinic_admin">{getRoleLabel('clinic_admin')}</SelectItem>
                                )}
                                <SelectItem value="doctor">{getRoleLabel('doctor')}</SelectItem>
                                <SelectItem value="assistant">{getRoleLabel('assistant')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveUser(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
