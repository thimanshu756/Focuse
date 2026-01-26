const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 3.5. Prioritize react-native/browser builds to avoid "crypto" errors (e.g. from axios)
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// 4. Add support for additional asset types
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg',
];

// 5. Add support for TypeScript paths
config.resolver.extraNodeModules = {
  '@': path.resolve(projectRoot, 'src'),
  ui: path.resolve(workspaceRoot, 'packages/ui'),
  crypto: path.resolve(projectRoot, 'crypto-shim.js'),
};

// 6. Force Metro to resolve 'axios' to the browser build to avoid "crypto" dependencies
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return context.resolveRequest(
      context,
      path.resolve(workspaceRoot, 'node_modules/axios/dist/browser/axios.cjs'),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
