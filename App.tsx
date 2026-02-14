
import React, { useState, useEffect, useCallback } from 'react';
import { GitHubConfig, UploadedFile } from './types';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import FileUploader from './components/FileUploader';
import HistoryList from './components/HistoryList';
import FileExplorer from './components/FileExplorer';

const DEFAULT_CONFIG: GitHubConfig = {
  username: '',
  repo: '',
  token: '',
  branch: 'main'
};

const App: React.FC = () => {
  const [config, setConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem('github_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [history, setHistory] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem('upload_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'explore'>('upload');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Check if config is complete
  const isConfigured = config.username && config.repo && config.token;

  useEffect(() => {
    localStorage.setItem('github_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('upload_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((file: UploadedFile) => {
    setHistory(prev => [file, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your upload history?")) {
      setHistory([]);
    }
  }, []);

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] p-6 selection:bg-indigo-500/30">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col items-center mb-10">
             <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Cloud <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Computing</span></h1>
            <p className="text-zinc-400 text-center text-lg max-w-md">The modern gateway to your GitHub infrastructure. Connect a repository to begin.</p>
          </div>
          
          <ConfigPanel 
            config={config} 
            onSave={(newConfig) => {
              setConfig(newConfig);
              setIsConfigOpen(false);
            }} 
            isInitialSetup={true}
          />
      
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#09090b] pb-20 selection:bg-indigo-500/30">
      <Header 
        onToggleConfig={() => setIsConfigOpen(!isConfigOpen)} 
        repoInfo={`${config.username}/${config.repo}`}
      />
      
      <main className="w-full max-w-7xl px-4 lg:px-8 space-y-8 mt-10">
        {isConfigOpen && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ConfigPanel 
              config={config} 
              onSave={(newConfig) => {
                setConfig(newConfig);
                setIsConfigOpen(false);
              }} 
            />
          </div>
        )}

        <div className="flex items-center space-x-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'upload' ? 'bg-zinc-800 text-white shadow-lg ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Push Files
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'explore' ? 'bg-zinc-800 text-white shadow-lg ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Fetch Files
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <FileUploader 
                config={config} 
                onUploadComplete={addToHistory} 
              />
            </div>
            <div className="lg:col-span-4">
              <HistoryList 
                history={history} 
                onClear={clearHistory}
              />
            </div>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileExplorer config={config} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
