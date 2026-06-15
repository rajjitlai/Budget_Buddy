
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const GITHUB_OWNER = 'rajjitlai';
const GITHUB_REPO = 'Budget_Buddy';
const CURRENT_VERSION = Constants.expoConfig?.version || '2.2.1';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  publishedAt?: string;
}

/**
 * Check for updates from GitHub Releases
 */
export async function checkForUpdates(): Promise<UpdateInfo> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { hasUpdate: false, latestVersion: CURRENT_VERSION };
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release = await response.json();
    const latestVersion = release.tag_name.replace('v', '');
    
    // Simple version comparison (semver)
    const hasUpdate = compareVersions(latestVersion, CURRENT_VERSION) > 0;

    return {
      hasUpdate,
      latestVersion,
      releaseNotes: release.body,
      downloadUrl: Platform.OS === 'android' 
        ? release.assets.find((a: any) => a.name.endsWith('.apk'))?.browser_download_url || release.html_url
        : release.html_url,
      publishedAt: release.published_at,
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { hasUpdate: false, latestVersion: CURRENT_VERSION };
  }
}

/**
 * Simple semver comparison
 * Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}
