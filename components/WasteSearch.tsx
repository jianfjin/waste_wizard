import React, { useState, useContext } from 'react';
import { LanguageContext } from '../App';
import { SEARCHABLE_WASTE_LIST, WASTE_BINS } from '../constants';
import { SearchIcon } from './Icons';

const WasteSearch: React.FC = () => {
    const { language, t } = useContext(LanguageContext);
    const [query, setQuery] = useState('');

    const filteredList = query.length > 1 
        ? SEARCHABLE_WASTE_LIST.filter(item => 
            item[language].toLowerCase().includes(query.toLowerCase())
        )
        : [];
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">{t('wasteSearchTitle')}</h2>
            <div className="relative mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('wasteSearchPlaceholder')}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {query.length > 1 && filteredList.map((item, index) => {
                    const binInfo = WASTE_BINS[item.type];
                    return (
                        <div key={`${item.nl}-${index}`} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center animate-fade-in">
                            <span className="font-semibold text-gray-800">{item[language]}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm text-gray-600 hidden sm:inline">{t('wasteTypeResult')}</span>
                                <span className={`${binInfo.color} text-white text-xs font-bold py-1 px-3 rounded-full`}>
                                    {t(binInfo.nameKey)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default WasteSearch;
