module.exports = {
  // Format TypeScript/JavaScript files in web app (Next.js handles linting separately)
  'apps/web/**/*.{ts,tsx,js,jsx}': [
    'prettier --write',
  ],
  // Format other files in web app
  'apps/web/**/*.{json,css,md}': [
    'prettier --write',
  ],
  // Lint and format packages (only if packages have ESLint config)
  'packages/**/*.{ts,tsx,js,jsx}': [
    'prettier --write',
  ],
  // Format root files
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
};

