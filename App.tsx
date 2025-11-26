
import React, { useState, useCallback } from 'react';
import ChatAgent from './components/ChatAgent';
import WasteGame from './components/WasteGame';
import ShootWaste from './components/ShootWaste';
import MatchWaste from './components/MatchWaste';
import InfoAndGlossary from './components/InfoAndGlossary';
import Header from './components/Header';
import { Language } from './types';
import { TRANSLATIONS } from './constants';
import { ChatBotIcon, GameIcon, InfoIcon } from './components/Icons';

type Tab = 'chat' | 'game' | 'match' | 'shoot' | 'info';

export const LanguageContext = React.createContext({
  language: 'en' as Language,
  setLanguage: (lang: Language) => { },
  // FIX: Explicitly set the return type of `t` to `string`. The type was previously inferred as `''`,
  // causing a type mismatch with the actual function provided in the component.
  t: (key: keyof typeof TRANSLATIONS['en']): string => '',
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];
  }, [language]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatAgent />;
      case 'game':
        return <WasteGame />;
      case 'match':
        return <MatchWaste />;
      case 'shoot':
        return <ShootWaste />;
      case 'info':
        return <InfoAndGlossary />;
      default:
        return <ChatAgent />;
    }
  };

  // FIX: Replaced JSX.Element with React.ReactNode to fix namespace error.
  const NavButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 p-3 text-sm sm:text-base font-bold flex items-center justify-center gap-2 rounded-t-lg transition-all duration-300 ${activeTab === tab
        ? 'bg-white text-green-600 shadow-md'
        : 'bg-green-500 text-white hover:bg-green-600'
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="min-h-screen bg-green-50 flex flex-col">
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-b-lg shadow-2xl">
            <nav className="flex bg-green-600 rounded-t-lg overflow-x-auto">
              <NavButton tab="chat" icon={<ChatBotIcon />} label={t('chatTab')} />
              <NavButton tab="game" icon={<GameIcon />} label={t('gameTab')} />
              <NavButton tab="match" icon={<span>♢</span>} label="Match Waste" />
              <NavButton tab="shoot" icon={<span>🎮</span>} label="Shoot Game" />
              <NavButton tab="info" icon={<InfoIcon />} label={t('infoTab')} />
            </nav>
            <div className="p-4 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </main>
        <footer className="text-center p-4 text-sm text-gray-500">
          {t('footer')}
        </footer>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;