import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FileText,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import { usePatients, Patient } from '@/hooks/usePatients';
import { PatientDialog } from './PatientDialog';
import { toast } from '@/hooks/use-toast';

interface PatientsListProps {
  onSelectPatient?: (patient: Patient) => void;
  onCreatePrescription?: (patient: Patient) => void;
  onViewPatient?: (patient: Patient) => void;
}

export const PatientsList: React.FC<PatientsListProps> = ({ 
  onSelectPatient,
  onCreatePrescription,
  onViewPatient
}) => {
  const { t, dir, language } = useLanguage();
  const { patients, loading, addPatient, updatePatient, archivePatient, searchPatients } = usePatients();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchPatients(query);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    
    const { error } = await archivePatient(patientToDelete.id);
    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.common.delete,
      });
    }
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleSavePatient = async (data: any) => {
    if (dialogMode === 'add') {
      return addPatient(data);
    } else if (selectedPatient) {
      return updatePatient(selectedPatient.id, data);
    }
    return { error: { message: 'Invalid state' } };
  };

  const calculateAge = (dateOfBirth: string | null): string => {
    if (!dateOfBirth) return '-';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ${t.patient.years}`;
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">{t.dashboard.patients}</h2>
        <Button onClick={handleAddPatient} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.patient.add}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={t.patient.search}
          value={searchQuery}
          onChange={handleSearch}
          className="ps-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t.patient.noPatients}</p>
          <p className="text-sm mt-2">{t.dashboard.startAddPatient}</p>
          <Button onClick={handleAddPatient} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            {t.patient.add}
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">{t.patient.fullName}</TableHead>
                <TableHead className="font-semibold">{t.patient.age}</TableHead>
                <TableHead className="font-semibold">{t.patient.gender}</TableHead>
                <TableHead className="font-semibold">{t.patient.phone}</TableHead>
                <TableHead className="font-semibold">{t.patient.allergies}</TableHead>
                <TableHead className="font-semibold text-center">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow 
                  key={patient.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onViewPatient?.(patient)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.full_name}</p>
                        {patient.date_of_birth && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(patient.date_of_birth)}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                  <TableCell>
                    {patient.gender ? (
                      <Badge variant="secondary">
                        {patient.gender === 'male' ? t.patient.male : t.patient.female}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {patient.phone ? (
                      <span className="flex items-center gap-1 text-sm" dir="ltr">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {patient.allergies ? (
                      <Badge variant="destructive" className="text-xs">
                        {patient.allergies.substring(0, 30)}
                        {patient.allergies.length > 30 ? '...' : ''}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                          {onCreatePrescription && (
                            <DropdownMenuItem onClick={() => onCreatePrescription(patient)}>
                              <FileText className="h-4 w-4 me-2" />
                              {t.prescription.new}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                            <Edit className="h-4 w-4 me-2" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePatient(patient)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 me-2" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Patient Dialog */}
      <PatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSavePatient}
        initialData={selectedPatient || undefined}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.delete} "{patientToDelete?.full_name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
