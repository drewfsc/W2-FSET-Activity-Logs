import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from './LanguageSelector';
import type { User as AppUser } from '../App';

interface NavigationProps {
  currentUser: AppUser | null;
  onLogout: () => void;
  onGoToLanding: () => void;
  currentPage: string;
}

const Navigation: React.FC<NavigationProps> = ({
  currentUser,
  onLogout,
  onGoToLanding,
  currentPage,
}) => {
  const { t } = useTranslation();
  
  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onGoToLanding}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="font-bold text-xl">{t('nav.fsc')}</div>
              <div className="text-sm text-gray-600">{t('nav.subtitle')}</div>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{currentUser.name}</span>
                  <span className="text-sm text-gray-500 capitalize">({currentUser.role})</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              currentPage === 'landing' && (
                <div className="text-sm text-gray-600">
                  {t('nav.corporation')}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;