import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { FavoriteMedication } from '@/hooks/useFavoriteMedications';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MedicationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectFavorite: (favorite: FavoriteMedication) => void;
  favorites: FavoriteMedication[];
  onAddToFavorites?: () => void;
  isFavorite?: boolean;
  placeholder?: string;
  id?: string;
}

export const MedicationAutocomplete: React.FC<MedicationAutocompleteProps> = ({
  value,
  onChange,
  onSelectFavorite,
  favorites,
  onAddToFavorites,
  isFavorite = false,
  placeholder,
  id,
}) => {
  const { language } = useLanguage();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteMedication[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const filtered = favorites.filter(f =>
        f.medication_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [value, favorites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectFavorite = (favorite: FavoriteMedication) => {
    onSelectFavorite(favorite);
    setShowSuggestions(false);
  };

  const getFormLabel = (form: string | null) => {
    if (!form) return '';
    const labels: Record<string, Record<string, string>> = {
      tablet: { ar: 'أقراص', fr: 'Comprimé', en: 'Tablet' },
      capsule: { ar: 'كبسولات', fr: 'Capsule', en: 'Capsule' },
      syrup: { ar: 'شراب', fr: 'Sirop', en: 'Syrup' },
      injection: { ar: 'حقنة', fr: 'Injection', en: 'Injection' },
      cream: { ar: 'كريم', fr: 'Crème', en: 'Cream' },
      drops: { ar: 'قطرات', fr: 'Gouttes', en: 'Drops' },
      suppository: { ar: 'تحاميل', fr: 'Suppositoire', en: 'Suppository' },
      inhaler: { ar: 'بخاخ', fr: 'Inhalateur', en: 'Inhaler' },
    };
    return labels[form]?.[language] || form;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="flex-1"
        />
        {value.trim() && onAddToFavorites && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onAddToFavorites}
            title={isFavorite 
              ? (language === 'ar' ? 'موجود في المفضلة' : language === 'fr' ? 'Déjà en favoris' : 'Already in favorites')
              : (language === 'ar' ? 'إضافة للمفضلة' : language === 'fr' ? 'Ajouter aux favoris' : 'Add to favorites')
            }
            className={cn(
              "shrink-0",
              isFavorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
            )}
          >
            {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {showSuggestions && filteredFavorites.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-muted-foreground font-medium border-b border-border">
            {language === 'ar' ? 'الأدوية المفضلة' : language === 'fr' ? 'Médicaments favoris' : 'Favorite medications'}
          </div>
          {filteredFavorites.map((favorite) => (
            <button
              key={favorite.id}
              type="button"
              className="w-full px-3 py-2 text-start hover:bg-accent transition-colors flex flex-col gap-0.5"
              onClick={() => handleSelectFavorite(favorite)}
            >
              <span className="font-medium">{favorite.medication_name}</span>
              <span className="text-xs text-muted-foreground">
                {[
                  favorite.dosage,
                  getFormLabel(favorite.form),
                  favorite.frequency,
                ].filter(Boolean).join(' • ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
