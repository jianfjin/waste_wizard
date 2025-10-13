import React, { useContext } from 'react';
import { LanguageContext } from '../App';
// FIX: Import TRANSLATIONS to get the type of its keys for type assertion.
import { GLOSSARY_TERMS, TRANSLATIONS } from '../constants';
import Tooltip from './Tooltip';
import { LinkIcon } from './Icons';
import WasteSearch from './WasteSearch';

const InfoAndGlossary: React.FC = () => {
    const { t } = useContext(LanguageContext);

    const InfoCard = ({ title, description, link }: { title: string, description: string, link: string }) => (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block bg-green-50 p-4 rounded-lg hover:shadow-lg hover:bg-green-100 transition-all">
            <h3 className="font-bold text-green-800 flex items-center gap-2">{title} <LinkIcon /></h3>
            <p className="text-sm text-gray-700">{description}</p>
        </a>
    );

    return (
        <div className="space-y-8">
            <WasteSearch />

            <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">{t('infoTitle')}</h2>
                <p className="text-gray-600 mb-4">{t('infoIntro')}</p>
                <div className="space-y-4">
                    <InfoCard 
                        title={t('gemeenteContact')} 
                        description={t('gemeenteDesc')} 
                        link="https://www.overheid.nl/contact/gemeenten"
                    />
                    <InfoCard 
                        title={t('milieuCentraal')} 
                        description={t('milieuCentraalDesc')} 
                        link="https://www.milieucentral.nl/"
                    />
                     <InfoCard 
                        title={t('afvalscheidingswijzer')} 
                        description={t('afvalscheidingswijzerDesc')} 
                        link="https://www.afvalscheidingswijzer.nl/"
                    />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-green-700 mb-4">{t('glossaryTitle')}</h2>
                <div className="space-y-4">
                    {GLOSSARY_TERMS.map(({ termKey, definitionKey }) => (
                         <div key={termKey} className="p-4 bg-gray-50 rounded-lg">
                            <dt className="font-semibold text-gray-800">
                                {/* FIX: Cast definitionKey to a key of TRANSLATIONS['en'] because its type is inferred as a generic 'string', which is not assignable to the specific keys expected by the 't' function. */}
                                <Tooltip text={t(definitionKey as keyof typeof TRANSLATIONS['en'])}>
                                    {/* FIX: Cast termKey to a key of TRANSLATIONS['en'] to resolve a type mismatch error, ensuring compatibility with the 't' function's parameter type. */}
                                    <span className="border-b-2 border-dotted border-green-500 cursor-help">{t(termKey as keyof typeof TRANSLATIONS['en'])}</span>
                                </Tooltip>
                            </dt>
                            {/* FIX: Cast definitionKey to a key of TRANSLATIONS['en'] to fix a type error. The 't' function requires a specific translation key, not a generic string. */}
                            <dd className="text-gray-600 mt-1">{t(definitionKey as keyof typeof TRANSLATIONS['en'])}</dd>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InfoAndGlossary;