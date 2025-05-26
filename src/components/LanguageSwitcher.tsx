import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Toggle between 'en' and 'lo'
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'lo' : 'en');
  };

  // Show the current language label
  const currentLabel = i18n.language === 'en' ? 'English' : 'ພາສາລາວ';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('lang', lng);
  };

  // Add this effect
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, []);

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-insurance-primary"
      aria-label="Switch language"
    >
      <Globe className="w-5 h-5" />
      <span>{currentLabel}</span>
    </button>
  );
}
