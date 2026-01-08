# AGENTS.md

Guidance for AI assistants working with **KanaDojo** - a Japanese learning platform (Next.js 15, React 19, TypeScript).

---

## Shell Environment

**Windows PowerShell** - Use `;` to chain commands (not `&&`).

---

## Build/Lint/Test Commands

### Primary Verification

**Use `npm run check` for all verification** (~10-30 seconds):

```powershell
npm run check    # TypeScript + ESLint combined
```

❌ **Never use `npm run build` for verification** - it's 1-2 minutes and adds no validation value.

### Individual Commands

```powershell
npm run lint              # ESLint only
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Prettier formatting
npm run format:check      # Check formatting without changes
npm run test              # Run all tests (Vitest)
npm run test:watch        # Watch mode for tests
```

### Running Single Tests

```powershell
# Run specific test file
npx vitest run features/Progress/__tests__/classifyCharacter.property.test.ts

# Run tests matching pattern
npx vitest run --reporter=verbose "**/*.property.test.ts"
```

### Additional Commands

```powershell
npm run i18n:check        # Validate translations + generate types
npm run clean             # Clean build artifacts
npm run analyze           # Bundle analysis
```

---

## Code Style Guidelines

### Imports & Formatting

- **Path aliases**: Use `@/features/`, `@/shared/`, `@/core/` (never relative imports)
- **Import order**: React → External libraries → Internal aliases → Types
- **Formatting**: Prettier with single quotes, no trailing commas, arrow parens avoided
- **ESLint**: Next.js config + import rules + layer enforcement

### TypeScript Conventions

- **Strict mode**: Enabled - never ignore TypeScript errors
- **Interfaces**: Use `interface` for public APIs, `type` for unions/utilities
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Prefixes**: `use` for hooks/stores, `I` prefix for interfaces (optional)
- **Generics**: Descriptive names (`TItem`, `TConfig`) not just `T`

### React Patterns

- **Components**: Functional components with React.FC or explicit return types
- **Hooks**: Custom hooks in `hooks/` directories with `use` prefix
- **State**: Zustand stores with localStorage persistence
- **Props**: Define interfaces for all component props
- **Memoization**: Use `React.useMemo` for expensive calculations

### Styling Guidelines

- **CSS Framework**: Tailwind CSS + shadcn/ui components
- **Utility function**: Always use `cn()` for conditional classes
- **Class organization**: Tailwind classes sorted by plugin (prettier-tailwindcss)
- **CSS Variables**: Use theme variables (`[var(--main-color)]`) for consistency
- **Responsive**: Mobile-first approach with Tailwind breakpoints

### Error Handling

- **Console**: Only `console.warn` and `console.error` allowed (ESLint rule)
- **Boundaries**: React Error Boundaries for component-level error handling
- **Validation**: Type guards and runtime validation for external data
- **Fallbacks**: Graceful degradation for missing features/data

### File Organization

```
features/[name]/
├── components/        # React components (.tsx)
├── data/             # Static data and constants
├── lib/              # Feature utilities and pure functions
├── hooks/            # Custom React hooks
├── store/            # Zustand stores
├── __tests__/        # Test files (.test.ts, .test.tsx)
└── index.ts          # Barrel export (public API)
```

### Testing Patterns

- **Framework**: Vitest with jsdom environment
- **Test types**: Property tests with fast-check, unit tests, integration tests
- **File naming**: `[component].property.test.ts` for property tests
- **Structure**: `describe` → `it` with descriptive names linking to requirements
- **Assertions**: Use `expect` with matchers, include edge cases

### State Management

- **Primary**: Zustand with localStorage persistence
- **Store structure**: Interface → Store creation → Actions
- **Immutability**: Always return new state, never mutate
- **Selectors**: Use selector functions for derived state

### Internationalization

- **Framework**: next-intl with namespace-based translations
- **File structure**: `core/i18n/locales/[lang]/[namespace].json`
- **Usage**: `useTranslations()` hook with namespace
- **Validation**: Run `npm run i18n:check` before commits

---

## Architecture Rules

### Layer Enforcement (ESLint)

- **shared/**: Cannot import from features/ internal directories
- **features/**: Cannot import from other features' internal directories
- **Public APIs**: Use barrel exports (`index.ts`) for cross-feature communication

### Dependency Rules

- **Circular deps**: Forbidden between features
- **Business logic**: Keep in features/, not app/ pages
- **Shared code**: Only in shared/ if used by 2+ features
- **Core utilities**: Infrastructure only (i18n, analytics, etc.)

---

## Don'ts

- ❌ Place business logic in `app/` pages
- ❌ Create circular dependencies between features
- ❌ Add to `shared/` unless used by 2+ features
- ❌ Hardcode user-facing strings (use translations)
- ❌ Ignore TypeScript errors
- ❌ Use relative imports for cross-directory references
- ❌ Use `console.log` (only warn/error allowed)
- ❌ Commit without running `npm run check`
- ❌ Use `npm run build` for validation

---

## Commits

Follow the workflow in `.agent/workflows/commit-changes.md` when committing changes.
