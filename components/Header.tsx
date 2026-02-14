
import React from 'react';

interface HeaderProps {
  onToggleConfig: () => void;
  repoInfo?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleConfig, repoInfo }) => {
  return (
    <header className="w-full border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/10 transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">Cloud <span className="text-indigo-400">Computing</span></h1>
            {repoInfo && (
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">
                  Live: {repoInfo}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={onToggleConfig}
          className="group flex items-center space-x-2.5 px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all border border-zinc-800 shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-zinc-500 group-hover:rotate-45 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-semibold text-sm hidden sm:inline">Preferences</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
