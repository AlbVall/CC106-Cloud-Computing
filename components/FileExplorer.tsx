
import React, { useState, useEffect } from 'react';
import { GitHubConfig, GitHubContent } from '../types';
import { fetchRepoContents, getFileContent } from '../services/githubService';

interface FileExplorerProps {
  config: GitHubConfig;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ config }) => {
  const [inputPath, setInputPath] = useState('');
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; html_url: string; isText?: boolean; text?: string; path: string } | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [copied, setCopied] = useState(false);

  const performFetch = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepoContents(config, path);
      if (!Array.isArray(data)) {
        // If it's a single file, we show it in the preview area
        handleFileProcessing(data as any as GitHubContent);
        setContents([]);
      } else {
        setContents(data);
        setCurrentPath(path);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync contents.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileProcessing = async (item: GitHubContent) => {
    setPreviewLoading(true);
    setError(null);
    try {
      const fileData = await getFileContent(config, item.path);
      if (fileData.content !== undefined) {
        const cleanBase64 = fileData.content.replace(/\s/g, '');
        const extension = item.name.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '');
        
        if (isImage) {
          const imageUrl = `data:image/${extension};base64,${cleanBase64}`;
          setSelectedFile({ name: item.name, url: imageUrl, html_url: item.html_url, path: item.path });
        } else {
          try {
            const decodedText = decodeURIComponent(escape(atob(cleanBase64)));
            setSelectedFile({ name: item.name, url: '', html_url: item.html_url, isText: true, text: decodedText, path: item.path });
          } catch (e) {
            try {
              setSelectedFile({ name: item.name, url: '', html_url: item.html_url, isText: true, text: atob(cleanBase64), path: item.path });
            } catch (err) {
              setError("Analysis failed: unsupported content format.");
            }
          }
        }
      } else {
        setSelectedFile({ name: item.name, url: '', html_url: item.html_url, isText: true, text: '', path: item.path });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleItemClick = (item: GitHubContent) => {
    if (item.type === 'dir') {
      const newPath = item.path;
      setInputPath(newPath);
      performFetch(newPath);
    } else {
      handleFileProcessing(item);
    }
  };

  const handleCopy = () => {
    if (selectedFile?.text) {
      navigator.clipboard.writeText(selectedFile.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col h-[750px] backdrop-blur-2xl">
      {/* Search Header */}
      <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center space-x-6">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Fetch by path (e.g. assets/main)..."
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performFetch(inputPath)}
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-800"
          />
        </div>
        <button 
          onClick={() => performFetch(inputPath)}
          disabled={loading}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/10 active:scale-95 flex items-center space-x-2 ring-1 ring-white/10"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span>Fetch File</span>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: File List */}
        <div className="w-1/3 border-r border-zinc-800/80 overflow-y-auto p-4 bg-zinc-950/20">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Namespace Contents</span>
            <span className="text-[10px] font-mono text-zinc-800 px-1.5 py-0.5 border border-zinc-900 rounded">{contents.length} files</span>
          </div>

          {contents.length === 0 && !loading && !error && (
            <div className="h-40 flex flex-col items-center justify-center text-zinc-700 text-[11px] font-bold uppercase tracking-wider text-center p-8">
              <div className="w-10 h-10 border border-zinc-800 rounded-lg flex items-center justify-center mb-4 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              Waiting for entry
            </div>
          )}

          <div className="space-y-1">
            {contents.map((item) => (
              <button
                key={item.sha}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left group transition-all border border-transparent
                  ${selectedFile?.path === item.path ? 'bg-indigo-600/10 border-indigo-500/20 ring-1 ring-indigo-500/10' : 'hover:bg-zinc-800/50'}`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`p-2 rounded-lg ${item.type === 'dir' ? 'bg-indigo-500/5 text-indigo-400' : 'bg-zinc-900 text-zinc-500'}`}>
                    {item.type === 'dir' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 012 2H4a2 2 0 012-2V6z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm truncate font-medium ${selectedFile?.path === item.path ? 'text-indigo-300' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                    {item.name}
                  </span>
                </div>
                {item.type === 'dir' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main: Preview Area */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
          {previewLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-[3px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Analyzing Resource</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-500/5 border border-red-500/10 rounded-3xl flex items-center justify-center mb-8 text-red-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-zinc-200 text-xl font-bold tracking-tight mb-3">Sync Interrupted</p>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">{error}</p>
              <button 
                onClick={() => performFetch(inputPath)}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all border border-zinc-800"
              >
                Reconnect
              </button>
            </div>
          ) : selectedFile ? (
            <>
              <div className="p-6 border-b border-zinc-900/80 bg-zinc-950/40 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-none mb-1.5">{selectedFile.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] bg-zinc-900 text-zinc-600 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-zinc-800">Resource</span>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{selectedFile.path}</p>
                    </div>
                  </div>
                </div>
                {selectedFile.isText && selectedFile.text?.trim() && (
                  <button 
                    onClick={handleCopy}
                    className="text-[11px] font-bold uppercase tracking-widest px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-zinc-800 active:scale-95"
                  >
                    {copied ? 'Captured' : 'Capture Buffer'}
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-auto p-10 flex items-start justify-center pattern-grid bg-[#09090b]">
                {selectedFile.isText ? (
                  selectedFile.text?.trim() ? (
                    <div className="w-full relative">
                      {/* Code block decoration */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
                      <pre className="text-sm font-mono text-zinc-400 bg-zinc-950/40 p-10 rounded-[2rem] border border-zinc-900 w-full overflow-auto whitespace-pre-wrap leading-relaxed select-text shadow-2xl backdrop-blur-xl">
                        {selectedFile.text}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 italic space-y-6 py-32">
                      <div className="w-24 h-24 bg-zinc-900/50 rounded-full border border-zinc-800 flex items-center justify-center opacity-20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">Null Data Segment</p>
                    </div>
                  )
                ) : (
                  <div className="relative group/img">
                    <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-700"></div>
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.name} 
                      className="max-w-full h-auto shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)] rounded-3xl border border-zinc-800 relative z-10 animate-in zoom-in duration-500" 
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-900/80 bg-zinc-950/60 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{config.username} / {config.repo}</span>
                </div>
                <a 
                  href={selectedFile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-white/5 flex items-center space-x-3 active:scale-[0.98]"
                >
                  <span className="uppercase tracking-widest">Source Core</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-30">
              <div className="w-24 h-24 mb-8 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-white">System Idle</p>
              <p className="text-[11px] mt-2 text-zinc-500 uppercase tracking-widest">Select resource for visualization</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pattern-grid {
          background-image: radial-gradient(circle, #18181b 1.5px, transparent 1.5px);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
};

export default FileExplorer;
