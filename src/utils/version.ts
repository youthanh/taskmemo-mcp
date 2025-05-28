import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Get the current directory of this module
 */
function getCurrentDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  return dirname(__filename);
}

/**
 * Read the version from package.json
 * Works in both development (src/) and compiled (dist/) versions
 */
export function getVersion(): string {
  try {
    const currentDir = getCurrentDir();
    
    // From src/utils/version.ts -> ../../package.json
    // From dist/utils/version.js -> ../../package.json
    const packageJsonPath = join(currentDir, '..', '..', 'package.json');
    
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    if (!packageJson.version) {
      throw new Error('Version not found in package.json');
    }
    
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read version from package.json:', error);
    // Fallback version if reading fails
    return '1.4.0';
  }
}

/**
 * Get formatted version string for display
 */
export function getVersionString(): string {
  const version = getVersion();
  return `v${version}`;
}
