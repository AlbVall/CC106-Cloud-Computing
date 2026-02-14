
export interface GitHubConfig {
  username: string;
  repo: string;
  token: string;
  branch: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  status: 'success' | 'error' | 'uploading';
  errorMessage?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export enum UploadStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
