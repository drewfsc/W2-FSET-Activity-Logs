import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation, Language } from '../contexts/TranslationContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en' as Language, name: t('common.english') },
    { code: 'es' as Language, name: t('common.spanish') },
    { code: 'hmn' as Language, name: t('common.hmong') }
  ];

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-8 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <Languages className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default LanguageSelector;