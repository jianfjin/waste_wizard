import React, { useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '../App';

const ShootWaste: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { language } = useContext(LanguageContext);

    useEffect(() => {
        // When language changes, reload the iframe with the language parameter
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            const url = new URL(currentSrc || window.location.href);
            url.searchParams.set('lang', language);
            iframeRef.current.src = url.href;
        }
    }, [language]);

    return (
        <div className="w-full h-[calc(100vh-200px)] min-h-[600px]">
            <iframe
                ref={iframeRef}
                src={`/shootwaste.html?lang=${language}`}
                className="w-full h-full border-0 rounded-lg"
                title="Shoot Waste Game"
                allow="autoplay"
            />
        </div>
    );
};

export default ShootWaste;
