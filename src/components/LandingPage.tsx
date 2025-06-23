import React from 'react';
import { Users, FileText, Search, ExternalLink, ArrowRight, Target, BookOpen } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import type { UserRole } from '../App';

interface LandingPageProps {
  onShowLogin: (type: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('landing.hero.title')}
            <span className="text-blue-400 block">{t('landing.hero.subtitle')}</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => onShowLogin('client')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center space-x-2"
            >
              <Users className="h-6 w-6" />
              <span>{t('landing.hero.client.access')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onShowLogin('coach')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center space-x-2"
            >
              <Target className="h-6 w-6" />
              <span>{t('landing.hero.coach.access')}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('landing.programs.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('landing.programs.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* W-2 Program */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl p-8 border border-gray-500 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-6">
                <BookOpen className="h-12 w-12 text-blue-400 mr-4" />
                <h3 className="text-3xl font-bold text-white">{t('landing.w2.title')}</h3>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {t('landing.w2.description')}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>{t('landing.w2.feature1')}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>{t('landing.w2.feature2')}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>{t('landing.w2.feature3')}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://dcf.wisconsin.gov/w2/parents/w2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('landing.w2.state.info')}
                </a>
                <a
                  href="https://fsc-corp.org/program/wisconsin-works-w-2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center border-2 border-blue-400 text-blue-400 px-6 py-3 rounded-lg hover:bg-blue-400 hover:text-white transition-all duration-200 transform hover:scale-105"
                >
                  {t('landing.w2.fsc.services')}
                </a>
              </div>
            </div>

            {/* FSET Program */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl p-8 border border-gray-500 hover:shadow-2xl hover:border-green-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-6">
                <Target className="h-12 w-12 text-green-400 mr-4" />
                <h3 className="text-3xl font-bold text-white">{t('landing.fset.title')}</h3>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {t('landing.fset.description')}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>{t('landing.fset.feature1')}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>{t('landing.fset.feature2')}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>{t('landing.fset.feature3')}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.dhs.wisconsin.gov/fset/index.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('landing.fset.state.info')}
                </a>
                <a
                  href="https://fsc-corp.org/program/foodshare-employment-and-training-fset/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center border-2 border-green-400 text-green-400 px-6 py-3 rounded-lg hover:bg-green-400 hover:text-white transition-all duration-200 transform hover:scale-105"
                >
                  {t('landing.fset.fsc.services')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('landing.features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-600 hover:border-blue-400">
              <FileText className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">{t('landing.features.tracking.title')}</h3>
              <p className="text-gray-300">
                {t('landing.features.tracking.description')}
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-600 hover:border-green-400">
              <Search className="h-16 w-16 text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">{t('landing.features.jobsearch.title')}</h3>
              <p className="text-gray-300">
                {t('landing.features.jobsearch.description')}
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-gray-600 hover:border-purple-400">
              <Users className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">{t('landing.features.coach.title')}</h3>
              <p className="text-gray-300">
                {t('landing.features.coach.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            {t('landing.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => onShowLogin('client')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              {t('landing.cta.client')}
            </button>
            <button
              onClick={() => onShowLogin('coach')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              {t('landing.cta.coach')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;