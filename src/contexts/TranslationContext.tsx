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
    'nav.fsc': 'FSC Activity Logs',
    'nav.subtitle': 'W-2 and FSET',
    'nav.corporation': 'Forward Service Corporation',
    
    // Landing Page
    'landing.hero.title': 'Empowering Wisconsin',
    'landing.hero.subtitle': 'Service Participants',
    'landing.hero.description': 'Comprehensive activity tracking and support for Wisconsin Works (W-2) and FoodShare Employment & Training (FSET) participants and their coaches.',
    'landing.hero.client.access': 'Client Access',
    'landing.hero.coach.access': 'Coach Access',
    
    'landing.programs.title': 'State Service Programs',
    'landing.programs.description': 'Supporting participants in Wisconsin\'s key employment and training programs',
    
    'landing.w2.title': 'Wisconsin Works (W-2)',
    'landing.w2.description': 'Wisconsin Works (W-2) is a comprehensive program designed to help families achieve economic self-sufficiency through employment, education, and training opportunities.',
    'landing.w2.feature1': 'Employment preparation and job search assistance',
    'landing.w2.feature2': 'Skills training and educational support',
    'landing.w2.feature3': 'Childcare and transportation assistance',
    'landing.w2.state.info': 'State Program Info',
    'landing.w2.fsc.services': 'FSC W-2 Services',
    
    'landing.fset.title': 'FoodShare Employment & Training',
    'landing.fset.description': 'FoodShare Employment and Training (FSET) helps FoodShare participants gain skills, training, and work experience to move toward self-sufficiency.',
    'landing.fset.feature1': 'Job search and placement services',
    'landing.fset.feature2': 'Skills assessment and career counseling',
    'landing.fset.feature3': 'Education and vocational training',
    'landing.fset.state.info': 'State Program Info',
    'landing.fset.fsc.services': 'FSC FSET Services',
    
    'landing.features.title': 'Comprehensive Activity Management',
    'landing.features.description': 'Track progress, manage activities, and achieve your employment goals',
    'landing.features.tracking.title': 'Activity Tracking',
    'landing.features.tracking.description': 'Log and monitor all program activities, appointments, and progress milestones',
    'landing.features.jobsearch.title': 'Job Search Support',
    'landing.features.jobsearch.description': 'Access job search tools, track applications, and receive employment support',
    'landing.features.coach.title': 'Coach Collaboration',
    'landing.features.coach.description': 'Connect with your coach for guidance, support, and progress reviews',
    
    'landing.cta.title': 'Ready to Get Started?',
    'landing.cta.description': 'Join thousands of participants who are achieving their employment goals',
    'landing.cta.client': 'Start as Client',
    'landing.cta.coach': 'Access as Coach',
    
    // Login
    'login.back': 'Back to Home',
    'login.client.title': 'Client Login',
    'login.coach.title': 'Coach Login',
    'login.client.description': 'Access your activity records and program information',
    'login.coach.description': 'Manage client activities and provide support',
    'login.email': 'Email Address',
    'login.email.placeholder': 'Enter your email',
    'login.password': 'Password',
    'login.password.placeholder': 'Enter your password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.signin': 'Sign in',
    'login.demo': 'Demo credentials: Use any email and password',
    
    // Client Dashboard
    'client.welcome': 'Welcome back',
    'client.subtitle': 'Track your progress and manage your program activities',
    'client.overview': 'Overview',
    'client.activities': 'My Activities',
    'client.job.search': 'Job Search',
    
    'client.stats.total.hours': 'Total Hours',
    'client.stats.this.week': 'This Week',
    'client.stats.completed': 'Completed',
    'client.stats.upcoming': 'Upcoming',
    
    'client.w2.title': 'Wisconsin Works (W-2)',
    'client.w2.description': 'Your pathway to economic self-sufficiency through employment and training.',
    'client.w2.add.activity': 'Add W-2 Activity',
    
    'client.fset.title': 'FSET Program',
    'client.fset.description': 'Build skills and gain work experience toward self-sufficiency.',
    'client.fset.add.activity': 'Add FSET Activity',
    
    'client.activities.all.programs': 'All Programs',
    'client.activities.w2.only': 'W-2 Only',
    'client.activities.fset.only': 'FSET Only',
    'client.activities.new': 'New Activity',
    
    'client.jobsearch.title': 'Job Search Resources',
    'client.jobsearch.description': 'Access tools and resources to help you find and secure employment opportunities.',
    'client.jobsearch.activities.title': 'Job Search Activities',
    'client.jobsearch.activities.description': 'Track your job applications, interviews, and networking activities.',
    'client.jobsearch.activities.button': 'Log Job Search Activity',
    'client.jobsearch.tracker.title': 'Application Tracker',
    'client.jobsearch.tracker.description': 'Keep track of your job applications and follow-up activities.',
    'client.jobsearch.tracker.button': 'View Applications',
    
    // Dashboard Common
    'dashboard.overview': 'Overview',
    'dashboard.clients': 'My Clients',
    'dashboard.activities': 'Activities',
    'dashboard.reports': 'Reports',
    'dashboard.job.search': 'Job Search',
    'dashboard.my.activities': 'My Activities',
    
    // Coach Dashboard
    'coach.welcome': 'Coach Dashboard',
    'coach.subtitle': 'Manage your clients and track their progress.',
    'coach.total.clients': 'Total Clients',
    'coach.active.clients': 'Active Clients',
    'coach.completed.month': 'Completed (Month)',
    'coach.avg.hours': 'Avg. Hours',
    'coach.recent.activity': 'Recent Client Activity',
    'coach.add.client': 'Add Client',
    'coach.search.clients': 'Search clients...',
    'coach.client.activities': 'Client Activities',
    'coach.activities.description': 'Review client activities and add coaching comments.',
    'coach.add.comment': 'Add Comment',
    'coach.comment': 'Comment',
    'coach.comments': 'Coach Comments:',
    'coach.your.comment': 'Your Comment',
    'coach.comment.placeholder': 'Add your coaching comment here...',
    'coach.cancel': 'Cancel',
    
    // Client Management
    'client.management.title': 'Client Management',
    'client.detail.title': 'Client Details',
    'client.add.title': 'Add New Client',
    'client.name': 'Client Name',
    'client.email': 'Email',
    'client.program': 'Program',
    'client.status': 'Status',
    'client.enrollment': 'Enrollment Date',
    'client.phone': 'Phone Number',
    'client.address': 'Address',
    'client.emergency.contact': 'Emergency Contact',
    'client.emergency.phone': 'Emergency Phone',
    'client.notes': 'Notes',
    'client.save': 'Save Client',
    'client.view': 'View',
    'client.edit': 'Edit',
    'client.back': 'Back to Clients',
    'client.activity.history': 'Activity History',
    'client.progress.summary': 'Progress Summary',
    
    // Programs and Status
    'program.w2': 'W-2',
    'program.fset': 'FSET',
    'program.both': 'Both',
    'program.all': 'All Programs',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.completed': 'Completed',
    'status.scheduled': 'Scheduled',
    'status.missed': 'Missed',
    
    // Common
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.duration': 'Duration',
    'common.minutes': 'minutes',
    'common.hours': 'hours',
    'common.last.activity': 'Last Activity',
    'common.total.hours': 'Total Hours',
    'common.actions': 'Actions',
    'common.language': 'Language',
    'common.english': 'English',
    'common.spanish': 'Spanish',
    'common.hmong': 'Hmong'
  },
  es: {
    // Navigation
    'nav.logout': 'Cerrar Sesión',
    'nav.fsc': 'Registros de Actividad FSC',
    'nav.subtitle': 'W-2 y FSET',
    'nav.corporation': 'Forward Service Corporation',
    
    // Landing Page
    'landing.hero.title': 'Empoderando a Wisconsin',
    'landing.hero.subtitle': 'Participantes del Servicio',
    'landing.hero.description': 'Seguimiento integral de actividades y apoyo para participantes de Wisconsin Works (W-2) y FoodShare Employment & Training (FSET) y sus entrenadores.',
    'landing.hero.client.access': 'Acceso de Cliente',
    'landing.hero.coach.access': 'Acceso de Entrenador',
    
    'landing.programs.title': 'Programas de Servicios Estatales',
    'landing.programs.description': 'Apoyando a participantes en los programas clave de empleo y entrenamiento de Wisconsin',
    
    'landing.w2.title': 'Wisconsin Works (W-2)',
    'landing.w2.description': 'Wisconsin Works (W-2) es un programa integral diseñado para ayudar a las familias a lograr la autosuficiencia económica a través de oportunidades de empleo, educación y entrenamiento.',
    'landing.w2.feature1': 'Preparación para el empleo y asistencia en la búsqueda de trabajo',
    'landing.w2.feature2': 'Entrenamiento de habilidades y apoyo educativo',
    'landing.w2.feature3': 'Asistencia para el cuidado de niños y transporte',
    'landing.w2.state.info': 'Información del Programa Estatal',
    'landing.w2.fsc.services': 'Servicios FSC W-2',
    
    'landing.fset.title': 'FoodShare Employment & Training',
    'landing.fset.description': 'FoodShare Employment and Training (FSET) ayuda a los participantes de FoodShare a obtener habilidades, entrenamiento y experiencia laboral para avanzar hacia la autosuficiencia.',
    'landing.fset.feature1': 'Servicios de búsqueda y colocación de empleo',
    'landing.fset.feature2': 'Evaluación de habilidades y asesoramiento profesional',
    'landing.fset.feature3': 'Educación y entrenamiento vocacional',
    'landing.fset.state.info': 'Información del Programa Estatal',
    'landing.fset.fsc.services': 'Servicios FSC FSET',
    
    'landing.features.title': 'Gestión Integral de Actividades',
    'landing.features.description': 'Rastrea el progreso, gestiona actividades y logra tus objetivos de empleo',
    'landing.features.tracking.title': 'Seguimiento de Actividades',
    'landing.features.tracking.description': 'Registra y monitorea todas las actividades del programa, citas y logros de progreso',
    'landing.features.jobsearch.title': 'Apoyo en Búsqueda de Empleo',
    'landing.features.jobsearch.description': 'Accede a herramientas de búsqueda de empleo, rastrea aplicaciones y recibe apoyo laboral',
    'landing.features.coach.title': 'Colaboración con Entrenador',
    'landing.features.coach.description': 'Conéctate con tu entrenador para orientación, apoyo y revisiones de progreso',
    
    'landing.cta.title': '¿Listo para Comenzar?',
    'landing.cta.description': 'Únete a miles de participantes que están logrando sus objetivos de empleo',
    'landing.cta.client': 'Comenzar como Cliente',
    'landing.cta.coach': 'Acceder como Entrenador',
    
    // Login
    'login.back': 'Volver al Inicio',
    'login.client.title': 'Inicio de Sesión de Cliente',
    'login.coach.title': 'Inicio de Sesión de Entrenador',
    'login.client.description': 'Accede a tus registros de actividad e información del programa',
    'login.coach.description': 'Gestiona las actividades de los clientes y proporciona apoyo',
    'login.email': 'Dirección de Correo Electrónico',
    'login.email.placeholder': 'Ingresa tu correo electrónico',
    'login.password': 'Contraseña',
    'login.password.placeholder': 'Ingresa tu contraseña',
    'login.remember': 'Recordarme',
    'login.forgot': '¿Olvidaste tu contraseña?',
    'login.signin': 'Iniciar Sesión',
    'login.demo': 'Credenciales de demostración: Usa cualquier email y contraseña',
    
    // Client Dashboard
    'client.welcome': 'Bienvenido de vuelta',
    'client.subtitle': 'Rastrea tu progreso y gestiona las actividades de tu programa',
    'client.overview': 'Resumen',
    'client.activities': 'Mis Actividades',
    'client.job.search': 'Búsqueda de Empleo',
    
    'client.stats.total.hours': 'Horas Totales',
    'client.stats.this.week': 'Esta Semana',
    'client.stats.completed': 'Completado',
    'client.stats.upcoming': 'Próximo',
    
    'client.w2.title': 'Wisconsin Works (W-2)',
    'client.w2.description': 'Tu camino hacia la autosuficiencia económica a través del empleo y entrenamiento.',
    'client.w2.add.activity': 'Agregar Actividad W-2',
    
    'client.fset.title': 'Programa FSET',
    'client.fset.description': 'Desarrolla habilidades y gana experiencia laboral hacia la autosuficiencia.',
    'client.fset.add.activity': 'Agregar Actividad FSET',
    
    'client.activities.all.programs': 'Todos los Programas',
    'client.activities.w2.only': 'Solo W-2',
    'client.activities.fset.only': 'Solo FSET',
    'client.activities.new': 'Nueva Actividad',
    
    'client.jobsearch.title': 'Recursos de Búsqueda de Empleo',
    'client.jobsearch.description': 'Accede a herramientas y recursos para ayudarte a encontrar y asegurar oportunidades de empleo.',
    'client.jobsearch.activities.title': 'Actividades de Búsqueda de Empleo',
    'client.jobsearch.activities.description': 'Rastrea tus aplicaciones de trabajo, entrevistas y actividades de networking.',
    'client.jobsearch.activities.button': 'Registrar Actividad de Búsqueda de Empleo',
    'client.jobsearch.tracker.title': 'Rastreador de Aplicaciones',
    'client.jobsearch.tracker.description': 'Mantén un registro de tus aplicaciones de trabajo y actividades de seguimiento.',
    'client.jobsearch.tracker.button': 'Ver Aplicaciones',
    
    // Dashboard Common
    'dashboard.overview': 'Resumen',
    'dashboard.clients': 'Mis Clientes',
    'dashboard.activities': 'Actividades',
    'dashboard.reports': 'Reportes',
    'dashboard.job.search': 'Búsqueda de Empleo',
    'dashboard.my.activities': 'Mis Actividades',
    
    // Coach Dashboard
    'coach.welcome': 'Panel de Entrenador',
    'coach.subtitle': 'Gestiona tus clientes y rastrea su progreso.',
    'coach.total.clients': 'Total de Clientes',
    'coach.active.clients': 'Clientes Activos',
    'coach.completed.month': 'Completado (Mes)',
    'coach.avg.hours': 'Promedio de Horas',
    'coach.recent.activity': 'Actividad Reciente de Clientes',
    'coach.add.client': 'Agregar Cliente',
    'coach.search.clients': 'Buscar clientes...',
    'coach.client.activities': 'Actividades de Clientes',
    'coach.activities.description': 'Revisa las actividades de los clientes y agrega comentarios de entrenamiento.',
    'coach.add.comment': 'Agregar Comentario',
    'coach.comment': 'Comentario',
    'coach.comments': 'Comentarios del Entrenador:',
    'coach.your.comment': 'Tu Comentario',
    'coach.comment.placeholder': 'Agrega tu comentario de entrenamiento aquí...',
    'coach.cancel': 'Cancelar',
    
    // Client Management
    'client.management.title': 'Gestión de Clientes',
    'client.detail.title': 'Detalles del Cliente',
    'client.add.title': 'Agregar Nuevo Cliente',
    'client.name': 'Nombre del Cliente',
    'client.email': 'Correo Electrónico',
    'client.program': 'Programa',
    'client.status': 'Estado',
    'client.enrollment': 'Fecha de Inscripción',
    'client.phone': 'Número de Teléfono',
    'client.address': 'Dirección',
    'client.emergency.contact': 'Contacto de Emergencia',
    'client.emergency.phone': 'Teléfono de Emergencia',
    'client.notes': 'Notas',
    'client.save': 'Guardar Cliente',
    'client.view': 'Ver',
    'client.edit': 'Editar',
    'client.back': 'Volver a Clientes',
    'client.activity.history': 'Historial de Actividades',
    'client.progress.summary': 'Resumen de Progreso',
    
    // Programs and Status
    'program.w2': 'W-2',
    'program.fset': 'FSET',
    'program.both': 'Ambos',
    'program.all': 'Todos los Programas',
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.completed': 'Completado',
    'status.scheduled': 'Programado',
    'status.missed': 'Perdido',
    
    // Common
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.date': 'Fecha',
    'common.time': 'Hora',
    'common.duration': 'Duración',
    'common.minutes': 'minutos',
    'common.hours': 'horas',
    'common.last.activity': 'Última Actividad',
    'common.total.hours': 'Horas Totales',
    'common.actions': 'Acciones',
    'common.language': 'Idioma',
    'common.english': 'Inglés',
    'common.spanish': 'Español',
    'common.hmong': 'Hmong'
  },
  hmn: {
    // Navigation
    'nav.logout': 'Tawm',
    'nav.fsc': 'FSC Cov Ntaub Ntawv Ua Haujlwm',
    'nav.subtitle': 'W-2 thiab FSET',
    'nav.corporation': 'Forward Service Corporation',
    
    // Landing Page
    'landing.hero.title': 'Txhawb Wisconsin',
    'landing.hero.subtitle': 'Cov Neeg Koom Nrog Kev Pabcuam',
    'landing.hero.description': 'Kev soj ntsuam thiab kev txhawb nqa rau cov neeg koom nrog Wisconsin Works (W-2) thiab FoodShare Employment & Training (FSET) thiab lawv cov kws qhia.',
    'landing.hero.client.access': 'Neeg Siv Khoom Nkag',
    'landing.hero.coach.access': 'Kws Qhia Nkag',
    
    'landing.programs.title': 'Cov Kev Pabcuam Hauv Xeev',
    'landing.programs.description': 'Txhawb cov neeg koom nrog hauv Wisconsin cov kev pabcuam haujlwm tseem ceeb',
    
    'landing.w2.title': 'Wisconsin Works (W-2)',
    'landing.w2.description': 'Wisconsin Works (W-2) yog ib qho kev pabcuam zoo uas tsim los pab cov tsev neeg ua tiav kev khwv nyiaj txiag los ntawm kev ua haujlwm, kev kawm, thiab kev cob qhia.',
    'landing.w2.feature1': 'Kev npaj ua haujlwm thiab kev pab nrhiav haujlwm',
    'landing.w2.feature2': 'Kev cob qhia txuj ci thiab kev txhawb nqa kev kawm',
    'landing.w2.feature3': 'Kev pab saib xyuas menyuam thiab kev thauj mus los',
    'landing.w2.state.info': 'Cov Ntaub Ntawv Kev Pabcuam Hauv Xeev',
    'landing.w2.fsc.services': 'FSC W-2 Cov Kev Pabcuam',
    
    'landing.fset.title': 'FoodShare Employment & Training',
    'landing.fset.description': 'FoodShare Employment and Training (FSET) pab cov neeg koom nrog FoodShare tau txais kev txawj, kev cob qhia, thiab kev paub dhau los ntawm kev ua haujlwm.',
    'landing.fset.feature1': 'Kev nrhiav haujlwm thiab kev pab tso haujlwm',
    'landing.fset.feature2': 'Kev ntsuam xyuas kev txawj thiab kev qhia txog haujlwm',
    'landing.fset.feature3': 'Kev kawm thiab kev cob qhia ua haujlwm',
    'landing.fset.state.info': 'Cov Ntaub Ntawv Kev Pabcuam Hauv Xeev',
    'landing.fset.fsc.services': 'FSC FSET Cov Kev Pabcuam',
    
    'landing.features.title': 'Kev Tswj Xyuas Kev Ua Haujlwm',
    'landing.features.description': 'Soj ntsuam kev vam meej, tswj cov haujlwm, thiab ua tiav koj lub hom phiaj ua haujlwm',
    'landing.features.tracking.title': 'Kev Soj Ntsuam Kev Ua Haujlwm',
    'landing.features.tracking.description': 'Sau thiab soj ntsuam tag nrho cov haujlwm, kev teem caij, thiab kev vam meej',
    'landing.features.jobsearch.title': 'Kev Txhawb Nqa Nrhiav Haujlwm',
    'landing.features.jobsearch.description': 'Nkag mus rau cov cuab yeej nrhiav haujlwm, soj ntsuam cov ntawv thov, thiab tau txais kev txhawb nqa ua haujlwm',
    'landing.features.coach.title': 'Kev Koom Tes Nrog Kws Qhia',
    'landing.features.coach.description': 'Txuas nrog koj tus kws qhia rau kev qhia, kev txhawb nqa, thiab kev tshuaj xyuas kev vam meej',
    
    'landing.cta.title': 'Npaj Pib Lawm?',
    'landing.cta.description': 'Koom nrog ntau txhiab tus neeg koom nrog uas tab tom ua tiav lawv lub hom phiaj ua haujlwm',
    'landing.cta.client': 'Pib ua Neeg Siv Khoom',
    'landing.cta.coach': 'Nkag ua Kws Qhia',
    
    // Login
    'login.back': 'Rov qab mus Tsev',
    'login.client.title': 'Neeg Siv Khoom Nkag',
    'login.coach.title': 'Kws Qhia Nkag',
    'login.client.description': 'Nkag mus rau koj cov ntaub ntawv ua haujlwm thiab cov ntaub ntawv qhia',
    'login.coach.description': 'Tswj cov neeg siv khoom cov haujlwm thiab muab kev txhawb nqa',
    'login.email': 'Email Chaw Nyob',
    'login.email.placeholder': 'Sau koj email',
    'login.password': 'Tus password',
    'login.password.placeholder': 'Sau koj tus password',
    'login.remember': 'Nco kuv',
    'login.forgot': 'Tsis nco qab tus password?',
    'login.signin': 'Kos Npe Nkag',
    'login.demo': 'Demo credentials: Siv txhua email thiab password',
    
    // Client Dashboard
    'client.welcome': 'Zoo siab tos txais koj rov qab',
    'client.subtitle': 'Soj ntsuam koj qhov kev vam meej thiab tswj koj cov haujlwm',
    'client.overview': 'Saib Tag Nrho',
    'client.activities': 'Kuv Cov Haujlwm',
    'client.job.search': 'Nrhiav Haujlwm',
    
    'client.stats.total.hours': 'Tag Nrho Cov Sij Hawm',
    'client.stats.this.week': 'Lub Limtiam No',
    'client.stats.completed': 'Ua Tiav',
    'client.stats.upcoming': 'Yuav Los',
    
    'client.w2.title': 'Wisconsin Works (W-2)',
    'client.w2.description': 'Koj txoj kev mus rau kev khwv nyiaj txiag los ntawm kev ua haujlwm thiab kev cob qhia.',
    'client.w2.add.activity': 'Ntxiv W-2 Haujlwm',
    
    'client.fset.title': 'FSET Program',
    'client.fset.description': 'Tsim kev txawj thiab tau txais kev paub dhau los ntawm kev ua haujlwm.',
    'client.fset.add.activity': 'Ntxiv FSET Haujlwm',
    
    'client.activities.all.programs': 'Tag Nrho Cov Kev Pabcuam',
    'client.activities.w2.only': 'W-2 Xwb',
    'client.activities.fset.only': 'FSET Xwb',
    'client.activities.new': 'Haujlwm Tshiab',
    
    'client.jobsearch.title': 'Cov Khoom Siv Nrhiav Haujlwm',
    'client.jobsearch.description': 'Nkag mus rau cov cuab yeej thiab cov khoom siv los pab koj nrhiav thiab tau txais haujlwm.',
    'client.jobsearch.activities.title': 'Cov Haujlwm Nrhiav Haujlwm',
    'client.jobsearch.activities.description': 'Soj ntsuam koj cov ntawv thov haujlwm, kev xam phaj, thiab kev sib tham.',
    'client.jobsearch.activities.button': 'Sau Haujlwm Nrhiav Haujlwm',
    'client.jobsearch.tracker.title': 'Kev Soj Ntsuam Ntawv Thov',
    'client.jobsearch.tracker.description': 'Khaws koj cov ntawv thov haujlwm thiab cov haujlwm ua raws.',
    'client.jobsearch.tracker.button': 'Saib Cov Ntawv Thov',
    
    // Dashboard Common
    'dashboard.overview': 'Saib Tag Nrho',
    'dashboard.clients': 'Kuv Cov Neeg Siv Khoom',
    'dashboard.activities': 'Cov Haujlwm',
    'dashboard.reports': 'Cov Ntawv Qhia',
    'dashboard.job.search': 'Nrhiav Haujlwm',
    'dashboard.my.activities': 'Kuv Cov Haujlwm',
    
    // Coach Dashboard
    'coach.welcome': 'Kws Qhia Dashboard',
    'coach.subtitle': 'Tswj koj cov neeg siv khoom thiab soj ntsuam lawv qhov kev vam meej.',
    'coach.total.clients': 'Tag Nrho Cov Neeg Siv Khoom',
    'coach.active.clients': 'Cov Neeg Siv Khoom Nquag',
    'coach.completed.month': 'Ua Tiav (Lub Hli)',
    'coach.avg.hours': 'Nruab Nrab Cov Sij Hawm',
    'coach.recent.activity': 'Cov Neeg Siv Khoom Cov Haujlwm Tsis Ntev Los No',
    'coach.add.client': 'Ntxiv Neeg Siv Khoom',
    'coach.search.clients': 'Nrhiav cov neeg siv khoom...',
    'coach.client.activities': 'Cov Neeg Siv Khoom Cov Haujlwm',
    'coach.activities.description': 'Xyuas cov neeg siv khoom cov haujlwm thiab ntxiv cov lus qhia.',
    'coach.add.comment': 'Ntxiv Lus Qhia',
    'coach.comment': 'Lus Qhia',
    'coach.comments': 'Kws Qhia Cov Lus Qhia:',
    'coach.your.comment': 'Koj Cov Lus Qhia',
    'coach.comment.placeholder': 'Ntxiv koj cov lus qhia ntawm no...',
    'coach.cancel': 'Tso Tseg',
    
    // Client Management
    'client.management.title': 'Kev Tswj Neeg Siv Khoom',
    'client.detail.title': 'Cov Ntsiab Lus Neeg Siv Khoom',
    'client.add.title': 'Ntxiv Neeg Siv Khoom Tshiab',
    'client.name': 'Neeg Siv Khoom Lub Npe',
    'client.email': 'Email',
    'client.program': 'Kev Pabcuam',
    'client.status': 'Cov Xwm Txheej',
    'client.enrollment': 'Hnub Sau Npe',
    'client.phone': 'Xov Tooj',
    'client.address': 'Chaw Nyob',
    'client.emergency.contact': 'Kev Sib Tham Xwm Txheej Ceev',
    'client.emergency.phone': 'Xov Tooj Xwm Txheej Ceev',
    'client.notes': 'Cov Ntawv Sau',
    'client.save': 'Txuag Neeg Siv Khoom',
    'client.view': 'Saib',
    'client.edit': 'Kho',
    'client.back': 'Rov Qab Mus Rau Cov Neeg Siv Khoom',
    'client.activity.history': 'Keeb Kwm Haujlwm',
    'client.progress.summary': 'Cov Ntsiab Lus Kev Vam Meej',
    
    // Programs and Status
    'program.w2': 'W-2',
    'program.fset': 'FSET',
    'program.both': 'Ob Leeg',
    'program.all': 'Tag Nrho Cov Kev Pabcuam',
    'status.active': 'Nquag',
    'status.inactive': 'Tsis Nquag',
    'status.completed': 'Ua Tiav',
    'status.scheduled': 'Tau Teem Tseg',
    'status.missed': 'Tsis Tau',
    
    // Common
    'common.close': 'Kaw',
    'common.save': 'Txuag',
    'common.cancel': 'Tso Tseg',
    'common.edit': 'Kho',
    'common.delete': 'Rho Tawm',
    'common.search': 'Nrhiav',
    'common.filter': 'Lim',
    'common.date': 'Hnub',
    'common.time': 'Sijhawm',
    'common.duration': 'Lub Sijhawm',
    'common.minutes': 'feeb',
    'common.hours': 'teev',
    'common.last.activity': 'Lub Sijhawm Kawg',
    'common.total.hours': 'Tag Nrho Cov Sij Hawm',
    'common.actions': 'Cov Haujlwm',
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
    return translations[language][key] || key;
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