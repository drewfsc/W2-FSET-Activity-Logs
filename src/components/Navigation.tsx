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
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl border-b-2 border-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onGoToLanding}
              className="text-white hover:text-blue-400 transition-all duration-200 transform hover:scale-105"
            >
              <div className="font-bold text-xl">{t('nav.fsc')}</div>
              <div className="text-sm text-gray-300">{t('nav.subtitle')}</div>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 text-white bg-gray-800 rounded-lg px-3 py-2 border border-gray-600">
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">{currentUser.name}</span>
                  <span className="text-sm text-gray-300 capitalize">({currentUser.role})</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              currentPage === 'landing' && (
                <div className="text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2 border border-gray-600">
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