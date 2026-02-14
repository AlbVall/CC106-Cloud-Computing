
import React from 'react';
import { UploadedFile } from '../types';

interface HistoryListProps {
  history: UploadedFile[];
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onClear }) => {
  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(ts));
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl backdrop-blur-xl">
      <div className="p-8 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/10">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Audit Log</h2>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mt-1">Transaction History</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase tracking-widest px-3 py-1.5 bg-zinc-950/50 rounded-lg border border-zinc-800 hover:border-red-900/30 transition-all"
          >
            Purge
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px] p-6 space-y-4 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium italic">No active logs detected.</p>
            <p className="text-[11px] text-zinc-700 mt-2 font-mono uppercase tracking-tight">Standby for input...</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              className="bg-zinc-950/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/20 hover:bg-zinc-900/40 transition-all duration-300"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center space-x-3 mb-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${item.status === 'success' ? 'bg-green-500 shadow-green-900/20' : 'bg-red-500 shadow-red-900/20'}`}></span>
                  <h3 className="text-sm font-bold text-zinc-200 truncate leading-tight tracking-tight" title={item.name}>
                    {item.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">{formatDate(item.timestamp)}</span>
                  {item.status === 'success' ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Endpoint</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-red-500/80 truncate max-w-[150px]">
                      {item.errorMessage || 'Failure'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.status === 'success' && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                      alert('Endpoint URL copied.');
                    }}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                    title="Copy Link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-5 bg-zinc-950/60 border-t border-zinc-800 rounded-b-[2rem]">
        <div className="flex items-center space-x-2 text-[9px] text-zinc-700 uppercase tracking-[0.2em] font-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Logs are persisted locally</span>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
