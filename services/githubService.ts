
import { GitHubConfig, GitHubContent } from '../types';

export const uploadToGitHub = async (
  file: File,
  config: GitHubConfig,
  path: string = ''
): Promise<{ success: boolean; url?: string; message: string }> => {
  try {
    const reader = new FileReader();
    
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Remove "data:*/*;base64," prefix
          resolve(result.split(',')[1]);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("File reader error"));
      reader.readAsDataURL(file);
    });

    const content = await base64Promise;
    const filePath = path ? `${path.replace(/^\/+|\/+$/g, '')}/${file.name}` : file.name;
    const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${filePath}`;

    // Check if file exists to get SHA for updates
    let existingSha: string | undefined;
    try {
      const existingFileResponse = await fetch(`${apiUrl}?ref=${config.branch}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${config.token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });
      
      if (existingFileResponse.ok) {
        const existingFileData = await existingFileResponse.json();
        if (!Array.isArray(existingFileData)) {
          existingSha = existingFileData.sha;
        }
      }
    } catch (e) {
      // File likely doesn't exist, proceed to create
      console.log("File does not exist or fetch failed, proceeding with creation.");
    }

    const data: any = {
      message: `${existingSha ? 'Update' : 'Upload'} ${file.name} via GitPush Web`,
      content: content,
      branch: config.branch || 'main'
    };

    if (existingSha) {
      data.sha = existingSha;
    }

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${config.token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        url: result.content.html_url,
        message: existingSha ? "File updated successfully!" : "File uploaded successfully!"
      };
    } else {
      return {
        success: false,
        message: result.message || "An error occurred during upload."
      };
    }
  } catch (error: any) {
    console.error("GitHub Upload Error:", error);
    return {
      success: false,
      message: error.message || "Network error or unexpected failure."
    };
  }
};

export const fetchRepoContents = async (
  config: GitHubConfig,
  path: string = ''
): Promise<GitHubContent[]> => {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${cleanPath}?ref=${config.branch}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `token ${config.token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch contents');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [data];
};

export const getFileContent = async (
  config: GitHubConfig,
  path: string
): Promise<GitHubContent> => {
  const apiUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/${path}?ref=${config.branch}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `token ${config.token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch file');
  }

  return await response.json();
};
