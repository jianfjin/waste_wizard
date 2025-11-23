import React, { useEffect, useRef, useContext, useState } from 'react';
import { LanguageContext } from '../App';

const MatchWaste: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // When language changes, reload the iframe with the language parameter
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      const url = new URL(currentSrc || window.location.href);
      url.searchParams.set('lang', language);
      iframeRef.current.src = url.href;
      setIsLoading(true);
      setError(null);
    }
  }, [language]);

  const handleLoad = () => {
    console.log('Match game iframe loaded successfully');
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    console.error('Match game iframe failed to load');
    setError('Failed to load the Match Game. Please try refreshing the page.');
    setIsLoading(false);
  };

  return (
    <div className="w-full h-[calc((100vh-200px)*3/4)] min-h-[450px] md:h-[calc(100vh-200px)] md:min-h-[600px] max-md:w-[110%] max-md:h-[calc((100vh-200px)*3/4*1.1)] max-md:-ml-[5%]">
      {isLoading && (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Match Game...</p>
            <p className="text-sm text-gray-500 mt-2">Language: {language}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-full bg-red-50 rounded-lg">
          <div className="text-center p-6">
            <div className="text-red-600 text-xl mb-2">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
            <p className="text-sm text-red-600 mt-2">Target URL: /matchwaste.html?lang={language}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`/matchwaste.html?lang=${language}&v=${Date.now()}`}
        className={`w-full h-full border-0 rounded-lg shadow-lg ${isLoading || error ? 'hidden' : ''}`}
        title="Match Waste Game"
        allow="autoplay"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default MatchWaste;
