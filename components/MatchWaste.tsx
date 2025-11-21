import React, { useEffect, useRef, useContext } from 'react';
import { LanguageContext } from '../App';

const MatchWaste: React.FC = () => {
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
    <div className="w-full h-[calc(100vh-200px)] min-h-[600px] flex justify-center items-center">
      <iframe
        ref={iframeRef}
        src={`/matchwaste.html?lang=${language}&v=${Date.now()}`}
        className="w-full h-full border-0 rounded-lg shadow-lg"
        title="Match Waste Game"
        allow="autoplay"
      />
    </div>
  );
};

export default MatchWaste;
