
import React, { useState, useRef, useCallback } from 'react';
import { GitHubConfig, UploadedFile, UploadStatus } from '../types';
import { uploadToGitHub } from '../services/githubService';

interface FileUploaderProps {
  config: GitHubConfig;
  onUploadComplete: (file: UploadedFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ config, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [path, setPath] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(UploadStatus.IDLE);
      setErrorMessage(null);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus(UploadStatus.IDLE);
      setErrorMessage(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setStatus(UploadStatus.UPLOADING);
    setErrorMessage(null);

    const result = await uploadToGitHub(file, config, path);

    const historyItem: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      url: result.url || '',
      timestamp: Date.now(),
      status: result.success ? 'success' : 'error',
      errorMessage: result.success ? undefined : result.message
    };

    onUploadComplete(historyItem);

    if (result.success) {
      setStatus(UploadStatus.SUCCESS);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setStatus(UploadStatus.ERROR);
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-xl group">
      <div className="p-8 border-b border-zinc-800/80 bg-zinc-900/20">
        <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Upload Files</h2>
        <p className="text-sm text-zinc-500">Push data into <span className="text-zinc-200 font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wider">{config.repo}</span></p>
      </div>

      <div className="p-8 flex-1 flex flex-col space-y-8">
        <div className="space-y-2.5">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Destination Path</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-zinc-800 bg-zinc-950/50 text-zinc-600 text-sm">
              /
            </span>
            <input 
              type="text" 
              placeholder="Internal namespace (e.g. static/docs)"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-r-2xl px-5 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-800"
            />
          </div>
        </div>

        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group/drop
            ${file ? 'border-indigo-500/50 bg-indigo-500/5 shadow-inner' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/20'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
          />
          
          <div className="w-16 h-16 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-center mb-6 group-hover/drop:scale-110 group-hover/drop:border-indigo-500/30 transition-all duration-500">
            {file ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-zinc-600 group-hover/drop:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>

          <p className="text-zinc-200 font-semibold tracking-tight text-center">
            {file ? file.name : 'Choose assets or drop them here'}
          </p>
          <p className="text-[11px] text-zinc-500 font-mono mt-2 bg-zinc-950/50 px-3 py-1 rounded-full border border-zinc-800">
            {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Ready'}
          </p>
        </div>

        {status === UploadStatus.ERROR && errorMessage && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {status === UploadStatus.SUCCESS && (
          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl text-green-400 text-xs flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="leading-relaxed font-medium">Files Upload successful.</span>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || status === UploadStatus.UPLOADING}
          className={`group w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl
            ${!file || status === UploadStatus.UPLOADING 
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50 shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 active:scale-95 ring-1 ring-white/10'}`}
        >
          {status === UploadStatus.UPLOADING ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="tracking-tight">Uploading...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="tracking-tight">Push</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
