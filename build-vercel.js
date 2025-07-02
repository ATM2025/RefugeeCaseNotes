import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('Building for Vercel deployment...');

// Build the frontend
console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit' });

// Create api directory if it doesn't exist
if (!existsSync('api')) {
  mkdirSync('api');
}

console.log('Vercel build complete!');