'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'hmn';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.logout': 'Logout',
    'nav.fset': 'FSET Activity Logs',
    'nav.subtitle': 'FoodShare Employment & Training',

    // Dashboard Common
    'dashboard.overview': 'Overview',
    'dashboard.clients': 'My Clients',
    'dashboard.activities': 'Activities',
    'dashboard.reports': 'Reports',
    'dashboard.my.activities': 'My Activities',

    // Client Dashboard
    'client.welcome': 'Welcome back',
    'client.subtitle': 'Track your FSET progress and manage your activities',
    'client.overview': 'Overview',
    'client.activities': 'My Activities',

    'client.stats.total.hours': 'Total Hours',
    'client.stats.this.week': 'This Week',
    'client.stats.completed': 'Completed',
    'client.stats.upcoming': 'Upcoming',

    'client.fset.title': 'FSET Program',
    'client.fset.description': 'Build skills and gain work experience toward self-sufficiency.',
    'client.fset.add.activity': 'Add FSET Activity',

    // Coach Dashboard
    'coach.welcome': 'Coach Dashboard',
    'coach.subtitle': 'Manage your FSET clients and track their progress.',
    'coach.total.clients': 'Total Clients',
    'coach.active.clients': 'Active Clients',
    'coach.completed.month': 'Completed (Month)',
    'coach.avg.hours': 'Avg. Hours',
    'coach.recent.activity': 'Recent Client Activity',
    'coach.add.client': 'Add Client',
    'coach.search.clients': 'Search clients...',

    // Activity Types
    'activity.education': 'Education',
    'activity.training': 'Training',
    'activity.job.search': 'Job Search',
    'activity.job.application': 'Job Application',
    'activity.interview': 'Interview',
    'activity.workshop': 'Workshop',
    'activity.counseling': 'Counseling',
    'activity.other': 'Other',

    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.language': 'Language',
    'common.english': 'English',
    'common.spanish': 'Spanish',
    'common.hmong': 'Hmong'
  },
  es: {
    // Navigation
    'nav.logout': 'Cerrar Sesión',
    'nav.fset': 'Registros de Actividad FSET',
    'nav.subtitle': 'FoodShare Employment & Training',

    // Dashboard Common
    'dashboard.overview': 'Resumen',
    'dashboard.clients': 'Mis Clientes',
    'dashboard.activities': 'Actividades',
    'dashboard.reports': 'Reportes',
    'dashboard.my.activities': 'Mis Actividades',

    // Client Dashboard
    'client.welcome': 'Bienvenido de vuelta',
    'client.subtitle': 'Rastrea tu progreso FSET y gestiona tus actividades',
    'client.overview': 'Resumen',
    'client.activities': 'Mis Actividades',

    'client.stats.total.hours': 'Horas Totales',
    'client.stats.this.week': 'Esta Semana',
    'client.stats.completed': 'Completado',
    'client.stats.upcoming': 'Próximo',

    'client.fset.title': 'Programa FSET',
    'client.fset.description': 'Desarrolla habilidades y gana experiencia laboral hacia la autosuficiencia.',
    'client.fset.add.activity': 'Agregar Actividad FSET',

    // Coach Dashboard
    'coach.welcome': 'Panel de Entrenador',
    'coach.subtitle': 'Gestiona tus clientes FSET y rastrea su progreso.',
    'coach.total.clients': 'Total de Clientes',
    'coach.active.clients': 'Clientes Activos',
    'coach.completed.month': 'Completado (Mes)',
    'coach.avg.hours': 'Promedio de Horas',
    'coach.recent.activity': 'Actividad Reciente de Clientes',
    'coach.add.client': 'Agregar Cliente',
    'coach.search.clients': 'Buscar clientes...',

    // Activity Types
    'activity.education': 'Educación',
    'activity.training': 'Capacitación',
    'activity.job.search': 'Búsqueda de Empleo',
    'activity.job.application': 'Aplicación de Trabajo',
    'activity.interview': 'Entrevista',
    'activity.workshop': 'Taller',
    'activity.counseling': 'Asesoramiento',
    'activity.other': 'Otro',

    // Common
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.language': 'Idioma',
    'common.english': 'Inglés',
    'common.spanish': 'Español',
    'common.hmong': 'Hmong'
  },
  hmn: {
    // Navigation
    'nav.logout': 'Tawm',
    'nav.fset': 'FSET Cov Ntaub Ntawv Ua Haujlwm',
    'nav.subtitle': 'FoodShare Employment & Training',

    // Dashboard Common
    'dashboard.overview': 'Saib Tag Nrho',
    'dashboard.clients': 'Kuv Cov Neeg Siv Khoom',
    'dashboard.activities': 'Cov Haujlwm',
    'dashboard.reports': 'Cov Ntawv Qhia',
    'dashboard.my.activities': 'Kuv Cov Haujlwm',

    // Client Dashboard
    'client.welcome': 'Zoo siab tos txais koj rov qab',
    'client.subtitle': 'Soj ntsuam koj qhov kev vam meej FSET thiab tswj koj cov haujlwm',
    'client.overview': 'Saib Tag Nrho',
    'client.activities': 'Kuv Cov Haujlwm',

    'client.stats.total.hours': 'Tag Nrho Cov Sij Hawm',
    'client.stats.this.week': 'Lub Limtiam No',
    'client.stats.completed': 'Ua Tiav',
    'client.stats.upcoming': 'Yuav Los',

    'client.fset.title': 'FSET Program',
    'client.fset.description': 'Tsim kev txawj thiab tau txais kev paub dhau los ntawm kev ua haujlwm.',
    'client.fset.add.activity': 'Ntxiv FSET Haujlwm',

    // Coach Dashboard
    'coach.welcome': 'Kws Qhia Dashboard',
    'coach.subtitle': 'Tswj koj cov neeg siv khoom FSET thiab soj ntsuam lawv qhov kev vam meej.',
    'coach.total.clients': 'Tag Nrho Cov Neeg Siv Khoom',
    'coach.active.clients': 'Cov Neeg Siv Khoom Nquag',
    'coach.completed.month': 'Ua Tiav (Lub Hli)',
    'coach.avg.hours': 'Nruab Nrab Cov Sij Hawm',
    'coach.recent.activity': 'Cov Neeg Siv Khoom Cov Haujlwm Tsis Ntev Los No',
    'coach.add.client': 'Ntxiv Neeg Siv Khoom',
    'coach.search.clients': 'Nrhiav cov neeg siv khoom...',

    // Activity Types
    'activity.education': 'Kev Kawm',
    'activity.training': 'Kev Cob Qhia',
    'activity.job.search': 'Nrhiav Haujlwm',
    'activity.job.application': 'Ntawv Thov Haujlwm',
    'activity.interview': 'Kev Xam Phaj',
    'activity.workshop': 'Kev Cob Qhia',
    'activity.counseling': 'Kev Sab Laj',
    'activity.other': 'Lwm Yam',

    // Common
    'common.close': 'Kaw',
    'common.save': 'Txuag',
    'common.cancel': 'Tso Tseg',
    'common.edit': 'Kho',
    'common.delete': 'Rho Tawm',
    'common.language': 'Lus',
    'common.english': 'Askiv',
    'common.spanish': 'Mev',
    'common.hmong': 'Hmoob'
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
