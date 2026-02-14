
import React, { useState } from 'react';
import { GitHubConfig } from '../types';

interface ConfigPanelProps {
  config: GitHubConfig;
  onSave: (config: GitHubConfig) => void;
  isInitialSetup?: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave, isInitialSetup = false }) => {
  const [localConfig, setLocalConfig] = useState<GitHubConfig>({ ...config });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSave = () => {
    if (!localConfig.username || !localConfig.repo || !localConfig.token) {
      setError("Please complete all integration fields.");
      return;
    }
    onSave(localConfig);
  };

  return (
    <div className={`bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 lg:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group ${!isInitialSetup ? 'mb-8' : ''}`}>
      {/* Decorative Gradient Flare */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none transition-all group-hover:bg-indigo-500/15 duration-1000"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center ring-1 ring-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{isInitialSetup ? 'Repository Push and Fetch' : 'System Settings'}</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Configure your GitHub endpoint connection.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Github Username</label>
            <input 
              type="text" 
              name="username"
              placeholder="Username"
              value={localConfig.username}
              onChange={handleChange}
              className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl px-5 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-800"
            />
          </div>
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Github Repository</label>
            <input 
              type="text" 
              name="repo"
              placeholder="Repository"
              value={localConfig.repo}
              onChange={handleChange}
              className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl px-5 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-2.5">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Github Personal Token</label>
            <div className="relative">
              <input 
                type="password" 
                name="token"
                value={localConfig.token}
                onChange={handleChange}
                placeholder="ghp_****************"
                className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl pl-12 pr-5 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-800 font-mono"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-700 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Repository Branch</label>
            <input 
              type="text" 
              name="branch"
              value={localConfig.branch}
              onChange={handleChange}
              className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl px-5 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center space-x-3 animate-in fade-in duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium tracking-wide">{error}</span>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl shadow-indigo-600/10 active:scale-[0.98] ring-1 ring-white/10"
          >
            {isInitialSetup ? 'Deploy Connection' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
