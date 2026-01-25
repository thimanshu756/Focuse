# Forest Android Application Structure

This document explains the purpose of the key files and directories in the `apps/android` project.

## Root Directories

- **`android/`**: Contains the native Android project. This is where Gradle configurations, Android manifests, and Java/Kotlin code reside.
- **`ios/`**: Contains the native iOS project. This is where the Xcode project (`.xcodeproj`), CocoaPods configuration (`Podfile`), and Swift/Objective-C code reside.
- **`__tests__/`**: Contains unit tests for the React components and logic, typically using Jest.
- **`.bundle/`**: Stores configuration for Ruby's Bundler, used to manage iOS dependencies like CocoaPods.
- **`node_modules/`**: Contains the JavaScript dependencies for this specific package. In this monorepo, many are symlinked from the root.

## Configuration Files

- **`App.tsx`**: The main React component that serves as the root of your application UI.
- **`index.js`**: The entry point for the React Native bundler (Metro). It registers the main component.
- **`app.json`**: Basic configuration for the app, such as the `name` used by native code and the `displayName` shown on the home screen.
- **`package.json`**: Defines scripts, dependencies, and metadata for this package.
- **`metro.config.js`**: Configuration for Metro, the JavaScript bundler for React Native.
- **`babel.config.js`**: Configuration for Babel, which transpiles modern JavaScript/TypeScript for React Native.
- **`tsconfig.json`**: TypeScript configuration for the project.
- **`jest.config.js`**: Configuration for the Jest testing framework.
- **`.eslintrc.js` & `.prettierrc.js`**: Linting and code formatting rules.
- **`Gemfile`**: Defines Ruby dependencies required for iOS development (like CocoaPods).
- **`.watchmanconfig`**: Configuration for Watchman, a tool used by Metro to watch for file changes.

## Development Workflow

- Run `pnpm dev:android` from the root to start the Metro bundler.
- Run `pnpm android` from the root to build and run the app on an Android device/emulator.
- Run `pnpm ios` from the root to build and run the app on an iOS simulator.
