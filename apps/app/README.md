# Expo App — How It All Works

This is the React Native mobile app built with **Expo** and shipped via **EAS Build**.
It lives in a Bun monorepo and shares code with `@koin/shared`.

---

## Entry Point & Routing

```
index.ts  →  expo-router/entry  →  src/app/_layout.tsx  →  screens
```

`index.ts` bootstraps two things in order:
1. **Unistyles** (`src/styles/unistyles.config.ts`) — theme must be registered before any component renders
2. **Expo Router** — takes over and loads the file-based route tree

### Routes (`src/app/`)

Expo Router maps the file system directly to routes, like Next.js:

| File | Route | What it does |
|------|-------|--------------|
| `_layout.tsx` | (root) | Wraps everything: `QueryClientProvider`, `Stack` navigator, `StatusBar` |
| `index.tsx` | `/` | Checks MMKV for a saved home currency → redirects to `/onboarding` or `/travel` |
| `onboarding.tsx` | `/onboarding` | First-run screen: pick home currency |
| `travel.tsx` | `/travel` | Main app: currency converter UI |

Adding a new screen is as simple as creating a new `.tsx` file in `src/app/`.

---

## Key Source Folders

```
src/
├── app/          File-based routes (screens)
├── components/   Reusable UI — Box, Text, NumPad, modals
├── hooks/        Logic — exchange rates (React Query), currency state, storage
├── lib/          Services — MMKV storage wrapper
└── styles/       Design system — Unistyles theme, colors, typography
```

---

## Config Files (What They Control)

### `app.json` — App Identity & Expo Config
The single source of truth for how Expo understands your app.
**This is what you edit** for display name, icons, splash screen, permissions, and plugins.

| Field | Purpose |
|-------|---------|
| `name` | Display name shown to users |
| `slug` | Unique Expo identifier (used in EAS URLs) |
| `version` | JS/OTA update version (`x.x.x`) |
| `ios.bundleIdentifier` | App Store ID — `com.nolliebigspin.koin` |
| `android.package` | Play Store ID — `com.nolliebigspin.koin` |
| `icon` | App icon (all platforms) |
| `plugins` | Native module setup (e.g. splash screen, web browser) |
| `newArchEnabled` | React Native New Architecture (keep `true`) |
| `experiments.reactCompiler` | React 19 compiler optimisations |
| `extra.eas.projectId` | Links this project to your EAS dashboard |

> **Note:** Because `ios/` and `android/` folders exist (bare workflow), EAS Build uses native files directly. Fields like `orientation`, `scheme`, `ios.*`, `android.*`, and `plugins` are **not auto-synced** — they were applied once via `expo prebuild` and now live in native code. Edit native files for native changes, or re-run `expo prebuild` carefully.

### `eas.json` — Build & Submit Pipelines

Defines three build profiles:

| Profile | Used for | Distribution |
|---------|----------|--------------|
| `development` | Local dev with dev-client | Internal (TestFlight / direct APK) |
| `preview` | QA / stakeholder testing | Internal |
| `production` | App Store / Play Store release | Stores |

`"appVersionSource": "remote"` means EAS manages `versionCode` (Android) and `buildNumber` (iOS) — they auto-increment on every production build. You never touch these manually.

### `metro.config.js` — Bundler

Metro is the JS bundler (like webpack for React Native).
The config extends Expo defaults and adds **monorepo support**:
- `watchFolders` — tells Metro to watch the entire repo root so it can find `@koin/shared`
- `resolver.nodeModulesPaths` — looks for packages in both `apps/app/node_modules` and the root `node_modules`

You rarely need to touch this.

### `babel.config.js` — Transpilation

Uses `babel-preset-expo` (Expo's preset) plus the `react-native-unistyles/plugin` which instruments styled components at compile time. Touch only when adding a Babel plugin.

### `tsconfig.json` — TypeScript

Extends `expo/tsconfig.base` with strict mode and a `@/*` path alias pointing to the app root (so you can write `import "@/src/hooks/useRates"`).

---

## Assets

```
assets/images/
├── icon.png          App icon — shown on home screen (1024×1024 recommended)
└── splash-icon.png   Splash screen logo — 200px, centered on #08233E background
```

Change these files and they will be picked up automatically by the next EAS build.
The splash screen background colour is also set in `app.json` under `plugins > expo-splash-screen`.

---

## Native Folders

Since this is a **bare workflow** app (you ran `expo prebuild` at some point), the `ios/` and `android/` folders contain real native projects. EAS Build compiles these directly.

### `ios/` — Key Files

| File | What to know |
|------|--------------|
| `Koin/Info.plist` | Bundle ID, display name, URL schemes, min iOS version, permissions — edit for privacy descriptions (camera, location, etc.) |
| `Koin/Koin.entitlements` | Apple capabilities: push notifications, keychain groups, associated domains — add here when enabling new Apple services |
| `Koin/PrivacyInfo.xcprivacy` | Required by Apple (iOS 17+) — declares what APIs your app uses and why |
| `Koin/Images.xcassets/` | App icon set and splash assets baked into the binary |
| `Koin.xcodeproj/project.pbxproj` | Xcode project structure — contains Team ID (`74H6Q6Y6VF`), signing config, build settings |
| `Podfile` | CocoaPods dependencies (React Native, Expo modules, Hermes) — run `pod install` after changes |
| `Podfile.lock` | Locked pod versions — commit this |
| `.xcode.env` | Sets `NODE_BINARY` so Xcode scripts can find Node during builds |

### `android/` — Key Files

| File | What to know |
|------|--------------|
| `app/build.gradle` | Version codes, build types, signing config, Hermes toggle |
| `app/AndroidManifest.xml` | Permissions (internet, notifications, etc.), activity config, URL schemes |
| `app/src/main/res/` | Icons, splash drawables, colours, strings — updated by EAS during build |
| `gradle.properties` | Build flags: `newArchEnabled`, image compression, ProGuard settings |
| `app/debug.keystore` | Debug signing key only — production signing is handled by EAS remotely |

---

## What Appears in the App Stores

### App Store (iOS)
Most **store listing** content (screenshots, description, keywords, pricing) is managed in **App Store Connect**, not in code.
What comes from your code/config:

| Source | Controls |
|--------|---------|
| `app.json > name` | App name (initially, overridable in ASC) |
| `app.json > version` | Version string shown (e.g. "1.0.0") |
| `eas.json > autoIncrement` | Build number (auto-incremented) |
| `assets/images/icon.png` | App icon |
| `ios/Koin/Info.plist` | Bundle ID, privacy descriptions |
| `ios/Koin/Koin.entitlements` | Capabilities declared to Apple |
| `ios/Koin/PrivacyInfo.xcprivacy` | Privacy manifest (required) |

### Play Store (Android)
Same principle — listing content lives in the **Google Play Console**.
What comes from code:

| Source | Controls |
|--------|---------|
| `app.json > name` | App name |
| `app.json > version` | Version name (e.g. "1.0.0") |
| `eas.json > autoIncrement` | Version code (auto-incremented) |
| `assets/images/icon.png` | App icon |
| `android/app/AndroidManifest.xml` | Permissions shown to users |
| `android/app/src/main/res/` | Adaptive icon, splash |

---

## EAS Build Flow

```
eas build --platform all --profile production
    ↓
EAS uploads your source + config
    ↓
Android: Gradle → Hermes JS bundle → AAB (signed remotely)
iOS:     Xcode + CocoaPods → Hermes JS bundle → IPA (signed remotely)
    ↓
eas submit --platform all
    ↓
Uploaded to App Store Connect + Google Play Console
```

**Signing** is fully remote — EAS holds your certificates and keystores. You don't manage `.p12` files or provisioning profiles locally.

**Version management** is remote — `versionCode` and `buildNumber` live on EAS servers, not in your repo. This avoids merge conflicts on version bumps.

---

## Day-to-Day Commands

```sh
# Start dev server
bun start

# Run on simulator
bun ios / bun android

# Build for stores
npx eas-cli build --platform all --profile production

# Submit to stores (after build)
npx eas-cli submit --platform all --profile production

# Check for config/dependency issues
bunx expo-doctor

# Fix dependency versions
npx expo install --check

# Regenerate native folders (careful — overwrites ios/ and android/)
npx expo prebuild
```

---

## Monorepo Integration

The app imports from `@koin/shared` (in `packages/shared/`) for shared logic like currency lists.
This works because:
1. `metro.config.js` watches the monorepo root
2. Bun workspaces symlink `@koin/shared` into `node_modules`
3. TypeScript `paths` in `tsconfig.json` resolves `@koin/*` correctly

If you add a new shared package, add it to `dependencies` in `package.json` and run `bun install`.

---

## Files You Should Watch / Edit Regularly

| File | Edit when... |
|------|-------------|
| `app.json` | Changing app name, icon, splash, adding Expo plugins |
| `eas.json` | Changing build profiles, adding environment variables |
| `src/app/` | Adding or restructuring screens |
| `src/styles/unistyles.config.ts` | Changing theme, colours, typography |
| `ios/Koin/Info.plist` | Adding iOS permissions or URL schemes |
| `ios/Koin/Koin.entitlements` | Enabling Apple capabilities (push, etc.) |
| `android/app/AndroidManifest.xml` | Adding Android permissions or intent filters |
| `assets/images/` | Updating app icon or splash screen |
| `package.json` | Adding/removing JS dependencies |
| `Podfile` (rare) | Adding CocoaPods-only iOS native deps |

## Files You Should NOT Manually Edit

| File | Reason |
|------|--------|
| `expo-env.d.ts` | Auto-generated by Expo CLI |
| `.expo/types/router.d.ts` | Auto-generated by Expo Router |
| `ios/Koin.xcodeproj/project.pbxproj` | Managed by Xcode — edit via Xcode UI or `expo prebuild` |
| `android/app/src/main/res/` (icons/splash) | Managed by `expo prebuild` and EAS |
| `Podfile.lock` | Managed by CocoaPods — commit but don't hand-edit |
