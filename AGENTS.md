# Koin Monorepo Agent Guidelines (AGENTS.md)

Welcome, Agent. This document contains the essential guidelines, commands, and architectural patterns you must follow when working in the `koin` repository. Koin is a monorepo utilizing Bun workspaces, containing a React Native/Expo mobile application (`@koin/app`), a Bun-based backend API (`@koin/api`), and a shared package (`@koin/shared`).

## 1. Quick Start & Build Commands

This repository strictly uses `bun` as the package manager. **Do not use `npm`, `yarn`, or `pnpm`.**

### Installation & Development
- **Install dependencies:** `bun install`
- **Start mobile app (Expo):** `bun run start` (or `bun run ios` / `bun run android`)
- **Start API backend:** `bun run api:dev` (runs in watch mode)

### Linting, Formatting & Type-checking
We use Biome for formatting and linting, and TypeScript (`tsc`) for type-checking.
- **Check All (CI Standard):** `bun run check:all` (Runs imports, format, lint, and TS checks)
- **Format Code:** `bun run check:format` (Uses Biome)
- **Lint Code:** `bun run check:lint` (Uses Biome)
- **Type-check:** `bun run check:ts` (Runs `tsc --noEmit` across all workspaces)

*Agent Rule:* After modifying code, always run `bun run check:ts` and `bun run check:lint` to verify your changes do not introduce errors.

## 2. Testing Guidelines

We use Bun's built-in test runner (`bun test`) for all unit and integration testing.

- **Run all tests:** `bun test`
- **Run a single test file:** `bun test path/to/file.test.ts`
- **Run a specific test by name:** `bun test -t "test name"`
- **Run tests in watch mode:** `bun test --watch`

### Testing Best Practices
- Place test files next to the implementation or in a dedicated `__tests__` folder, named `*.test.ts` or `*.spec.ts`.
- Ensure tests run cleanly without emitting unnecessary console logs.
- When creating new utility functions or API endpoints, write a corresponding `bun test` file and verify it runs successfully.

## 3. Project Structure

- `apps/app/`: The frontend React Native application powered by Expo Router.
  - `src/app/`: Expo Router routes (e.g., `index.tsx`, `onboarding.tsx`).
  - `src/components/`: Reusable UI components.
- `apps/api/`: The Bun backend API utilizing `Bun.serve()` and Redis for caching.
  - `src/index.ts`: The main entry point.
- `packages/shared/`: Shared TypeScript types and utility functions.

## 4. Code Style & Formatting

We strictly adhere to the rules defined in `biome.json`. **Do not introduce conflicting formatting.**
- **Indentation:** 2 spaces.
- **Quotes:** Double quotes (`"`) for strings and JSX attributes.
- **Semicolons:** Always required.
- **Line Width:** 100 characters max.
- **Trailing Commas:** `es5` standard.
- **Imports:** Let Biome auto-organize imports (`bun run check:imports`). Unused imports will trigger warnings.

## 5. Frontend Development (React Native / Expo)

When working in `apps/app/`, observe the following patterns:

### Component Guidelines
- **Naming:** Use `PascalCase.tsx` for components (e.g., `NumPad.tsx`) and `kebab-case.tsx` or `index.tsx` for Expo Router routes.
- **Declaration:** Use `export function ComponentName(props: ComponentNameProps) { ... }` rather than arrow functions assigned to constants.
- **Types:** Always define a `type ComponentNameProps = { ... }` above the component. Avoid inline type definitions for props. Do not use `React.FC`.
- **UI Primitives:** Use the custom `<Box>` and `<Text>` primitives from `@/src/components/ui` rather than raw React Native `<View>` or `<Text>` where possible.

### Styling
- **Unistyles:** We use `react-native-unistyles` for styling. Avoid standard React Native `StyleSheet.create` unless required. Instead, use `StyleSheet.create((theme) => ({ ... }))` from `react-native-unistyles`.
- **Spacing/Colors:** Always reference theme variables (e.g., `theme.spacing.md`, `theme.colors.surfaceElevated`) instead of hardcoding values.

### State & Hooks
- Use `@tanstack/react-query` for server state and data fetching.
- Use `useCallback` and `useMemo` where appropriate to prevent unnecessary re-renders.
- Wrap UI interactions that require physical feedback with `expo-haptics` (e.g., `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`).

## 6. Backend Development (Bun API)

When working in `apps/api/`, follow these conventions:

### API Architecture
- The API is built directly on `Bun.serve()`. Do not install Express or Hono unless explicitly requested.
- Handle CORS explicitly by returning appropriate `Access-Control-Allow-*` headers in `OPTIONS` and standard responses.
- Caching is managed via Redis (e.g., `apps/api/src/redis.ts`).

### Error Handling
- Return consistent JSON structures for errors:
  ```ts
  return Response.json({ error: "Descriptive error message" }, { status: 404, headers: corsHeaders });
  ```
- Always validate incoming request URLs and parameters.
- Do not let unhandled promise rejections crash the server. Wrap asynchronous operations in `try/catch` blocks.

## 7. TypeScript Standards

- **Strict Mode:** TypeScript strict mode is enabled. Do not use `any`. Use `unknown` if the type is truly dynamic, and narrow it down via type guards.
- **Shared Types:** If a type needs to be accessed by both the app and the API, place it in `packages/shared/` and export it from `packages/shared/index.ts`.
- **Imports:** Use absolute path aliases (e.g., `@/src/...` for the app) where configured, rather than deeply nested relative paths (e.g., `../../../`).

## 8. Agent Directives

1. **Understand Before Editing:** Always use `read` or `glob` to examine the file and its surrounding context (like `package.json` or sibling files) before making changes.
2. **Mimic Existing Patterns:** Your generated code must look like the surrounding code. If the file uses specific hook patterns, unistyles, or API return formats, copy that exact style.
3. **Run Verifications:** Whenever you finish a modification, run `bun run check:ts` and `bun run check:lint` to ensure you haven't broken the build.
4. **Be Proactive but Safe:** Do not proactively refactor completely unrelated files. Stick to the scope of the requested task, but ensure your implementation is robust and typed correctly.
