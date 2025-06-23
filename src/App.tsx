import React, { useState, useEffect } from 'react';
import { Users, FileText, Search, LogIn, Home, User, BookOpen, Target } from 'lucide-react';
import { TranslationProvider } from './contexts/TranslationContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ClientDashboard from './components/ClientDashboard';
import CoachDashboard from './components/CoachDashboard';

export type UserRole = 'client' | 'coach' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [loginType, setLoginType] = useState<UserRole>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('landing');
    setLoginType(null);
  };

  const showLogin = (type: UserRole) => {
    setLoginType(type);
    setCurrentPage('login');
  };

  const goToLanding = () => {
    setCurrentPage('landing');
  };

  return (
    <TranslationProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentUser={currentUser}
          onLogout={handleLogout}
          onGoToLanding={goToLanding}
          currentPage={currentPage}
        />
        
        {currentPage === 'landing' && (
          <LandingPage onShowLogin={showLogin} />
        )}
        
        {currentPage === 'login' && (
          <LoginPage
            loginType={loginType}
            onLogin={handleLogin}
            onBack={goToLanding}
          />
        )}
        
        {currentPage === 'dashboard' && currentUser && (
          <>
            {currentUser.role === 'client' && (
              <ClientDashboard user={currentUser} />
            )}
            {currentUser.role === 'coach' && (
              <CoachDashboard user={currentUser} />
            )}
          </>
        )}
      </div>
    </TranslationProvider>
  );
}

export default App;