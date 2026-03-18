# Koin

A minimalist, high-performance currency conversion application built as a modern monorepo.

## 🏗 Architecture

This project is organized as a monorepo using **Bun Workspaces**, ensuring shared logic and type safety across the entire stack.

- **`apps/app`**: A mobile application built with **React Native** and **Expo**.
  - **Styling**: `react-native-unistyles` for runtime-efficient, themeable styles.
  - **State & Data**: `@tanstack/react-query` for server state and `react-native-mmkv` for lightning-fast local storage.
  - **Navigation**: `expo-router` for file-based routing.
- **`apps/api`**: A lightweight backend service powered by **Bun**, providing exchange rate data and business logic.
- **`packages/shared`**: Shared TypeScript types, constants, and utilities used by both the mobile app and the API.

## 🚀 Tech Stack

- **Runtime**: [Bun](https://bun.sh) (Fast all-in-one JavaScript runtime)
- **Framework**: [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- **Tooling**: [Biome](https://biomejs.dev) (Extremely fast formatter and linter)
- **Language**: TypeScript

## 🛠 Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your machine.
- iOS Simulator (Xcode) or Android Emulator (Android Studio) for mobile development.

### Installation

```sh
bun install
```

## 💻 Development

### Mobile App

Start the Metro bundler and run the application:

```sh
bun start        # Start Metro bundler
bun ios          # Run on iOS simulator
bun android      # Run on Android emulator
```

### API Service

Run the backend API in development mode with hot reloading:

```sh
bun api:dev
```

### Quality Control

Run linting, formatting, and type checks across all packages:

```sh
bun check:all
```

Individual checks:
- `bun check:lint`: Run Biome linter.
- `bun check:format`: Run Biome formatter.
- `bun check:ts`: Run TypeScript compiler (`tsc`) across all workspaces.

## 📦 Building for Release

To build a release version and install it directly on a connected iOS device:

```sh
bun build:release
```

---
Built with ❤️ using React Native, Expo, and Bun.
