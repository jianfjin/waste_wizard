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
    <div className="w-full h-[calc((100vh-200px)*3/4)] min-h-[450px] md:h-[calc(100vh-200px)] md:min-h-[600px] max-md:w-[110%] max-md:h-[calc((100vh-200px)*3/4*1.1)] max-md:-ml-[5%]">
      <iframe
        ref={iframeRef}
        src={`/matchwaste.html?lang=${language}`}
        className="w-full h-full border-0 rounded-lg"
        title="Match Waste Game"
        allow="autoplay"
      />
    </div>
  );
};

export default MatchWaste;
