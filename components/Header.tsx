
import React, { useContext } from 'react';
import { LanguageContext } from '../App';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useContext(LanguageContext);

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">
          ♻️ {t('appTitle')}
        </h1>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as Language)}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-300 ${
                language === lang.id ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={`Switch to ${lang.name}`}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
