
import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 z-20 w-64 p-2 mb-2 text-sm text-white bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-1/2">
        {text}
        <svg className="absolute left-1/2 top-full h-2 w-full text-black transform -translate-x-1/2" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default Tooltip;
