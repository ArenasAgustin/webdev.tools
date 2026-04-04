# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger                                                                                   | Skill          | Path                                                           |
| ----------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------- |
| /sdd-init, "iniciar sdd"                                                                  | sdd-init       | C:\Users\agusk\.config\opencode\skills\sdd-init\SKILL.md       |
| When writing Go tests, using teatest, or adding test coverage                             | go-testing     | C:\Users\agusk\.config\opencode\skills\go-testing\SKILL.md     |
| When creating a GitHub issue, reporting a bug, or requesting a feature                    | issue-creation | C:\Users\agusk\.config\opencode\skills\issue-creation\SKILL.md |
| When creating a pull request, opening a PR, or preparing changes for review               | branch-pr      | C:\Users\agusk\.config\opencode\skills\branch-pr\SKILL.md      |
| When user says "judgment day", "dual review", "doble review"                              | judgment-day   | C:\Users\agusk\.config\opencode\skills\judgment-day\SKILL.md   |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator  | C:\Users\agusk\.config\opencode\skills\skill-creator\SKILL.md  |

## Workspace Skills

| Trigger                                                             | Skill                       | Path                                                                             |
| ------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| React components, Next.js pages, data fetching, bundle optimization | vercel-react-best-practices | D:\Programacion\webdev.tools\.agents\skills\vercel-react-best-practices\SKILL.md |
| Vite config, vite.config.ts, Vite plugins                           | vite                        | D:\Programacion\webdev.tools\.agents\skills\vite\SKILL.md                        |
| Writing Vitest tests                                                | vitest                      | D:\Programacion\webdev.tools\.agents\skills\vitest\SKILL.md                      |
| Creating Storybook stories                                          | storybook-story-writing     | D:\Programacion\webdev.tools\.agents\skills\storybook-story-writing\SKILL.md     |
| Tailwind CSS patterns                                               | tailwind-css-patterns       | D:\Programacion\webdev.tools\.agents\skills\tailwind-css-patterns\SKILL.md       |
| Playwright E2E tests                                                | playwright-best-practices   | D:\Programacion\webdev.tools\.agents\skills\playwright-best-practices\SKILL.md   |
| TypeScript advanced types                                           | typescript-advanced-types   | D:\Programacion\webdev.tools\.agents\skills\typescript-advanced-types\SKILL.md   |
| Accessibility (a11y)                                                | accessibility               | D:\Programacion\webdev.tools\.agents\skills\accessibility\SKILL.md               |
| Frontend design patterns                                            | frontend-design             | D:\Programacion\webdev.tools\.agents\skills\frontend-design\SKILL.md             |
| Vercel deployment                                                   | deploy-to-vercel            | D:\Programacion\webdev.tools\.agents\skills\deploy-to-vercel\SKILL.md            |
| React composition patterns                                          | vercel-composition-patterns | D:\Programacion\webdev.tools\.agents\skills\vercel-composition-patterns\SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### go-testing

- Use table-driven tests for multiple test cases with input/expected/wantErr structure
- Test Model state transitions directly via Model.Update() for Bubbletea TUI
- Use teatest.NewTestModel() for interactive TUI testing with tea.KeyMsg
- Use golden file testing with filepath.Join("testdata", "\*.golden") pattern
- Mock dependencies via interfaces, use t.TempDir() for file operations

### vercel-react-best-practices

- No useMemo/useCallback — React Compiler handles memoization automatically
- use() hook for promises/context, replaces useEffect for data fetching
- Server Components by default, add 'use client' only for interactivity/hooks
- ref is a regular prop — no forwardRef needed
- Actions: use useActionState for form mutations, useOptimistic for optimistic UI
- Metadata: export metadata object from page/layout, no <Head> component
- Avoid barrel file imports (lucide-react, @mui/material, @radix-ui/react-\*)
- Use Promise.all() for independent async operations
- Use startTransition for non-urgent updates, useDeferredValue for expensive renders

### vite

- Use TypeScript: prefer vite.config.ts
- Always use ESM, avoid CommonJS
- Use defineConfig() for typed config
- Use dynamic imports for code splitting: import('./module').then(m => m.default)
- Use next/dynamic for React components, define ssr: false when needed

### storybook-story-writing

- Use CSF3 format: export default { title, component, tags } + named exports
- Use args for component variations, argTypes for controls
- Use play function for interaction testing
- Always include default export with title and component
- Document all component props variations in stories

### vitest

- Use describe/it/test blocks, prefer describe for grouping
- Use vi.fn() for mocks, vi.mock() for module mocking
- Use async/await for promise-based tests
- Use expect.toBe(), .toEqual(), .toContain(), .toThrow() for assertions
- Use beforeEach/afterEach for setup/teardown

### tailwind-css-patterns

- Use utility classes for composition over custom CSS
- Use responsive prefixes: sm:, md:, lg:, xl:, 2xl:
- Use dark: prefix for dark mode variants
- Use group- variants for parent-child styling relationships
- Use @apply for complex reusable patterns in custom classes

### playwright-best-practices

- Use test.describe() to group related tests
- Use page.locator() over page.click()/fill() with selectors
- Use expect(locator).toBeVisible(), .toHaveText() for assertions
- Use test.beforeEach() for setup, test.afterEach() for cleanup
- Use webServer in playwright.config.ts for local dev server testing

### typescript-advanced-types

- Use generic constraints <T extends something> for type safety
- Use Utility Types: Partial, Required, Pick, Omit, Record, ReturnType
- Use conditional types: T extends U ? X : Y
- Use mapped types for transformations
- Use infer for type extraction in conditional types

### accessibility

- Use semantic HTML: nav, main, article, section instead of div
- Use aria-label, aria-describedby for interactive elements
- Use role="dialog" for modals, role="alert" for errors
- Ensure 4.5:1 contrast ratio for text
- Use skip-link pattern for keyboard navigation
- Test with keyboard only (Tab, Enter, Escape)

### frontend-design

- Mobile-first: write mobile styles as base, use min-width for larger
- Use semantic HTML before divs
- Use CSS Grid for 2D layouts, Flexbox for 1D
- Use rem/em for typography scaling
- Use content-visibility: auto for long lists
- Defer non-critical resources with dynamic imports

### deploy-to-vercel

- Use Vercel CLI: vercel deploy --prod for production
- Configure vercel.json for redirect/rewrite rules
- Use Environment Variables in Vercel dashboard
- Use Edge Functions for low-latency API routes
- Use Image Optimization with next/image

### vercel-composition-patterns

- Use composition over inheritance: small components + props
- Extract UI primitives (Button, Input, Card) to shared library
- Use compound components for related, configurable UI (Tabs, Select)
- Use render props pattern for flexible behavior injection
- Use context for cross-component state (theme, auth)

## Project Conventions

| File                 | Path                                         | Notes                                 |
| -------------------- | -------------------------------------------- | ------------------------------------- |
| AGENTS.md            | D:\Programacion/webdev.tools/AGENTS.md       | Index — project commands and workflow |
| CLAUDE.md            | D:/Programacion/webdev.tools/CLAUDE.md       | Global rules and personality          |
| docs/ROADMAP.md      | D:/Programacion/webdev.tools/ROADMAP.md      | Keep updated on phase completion      |
| docs/ARCHITECTURE.md | D:/Programacion/webdev.tools/ARCHITECTURE.md | System architecture                   |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.

## Project Stack

- **Frontend**: React 19 + TypeScript 5.9
- **Build**: Vite 7.2.5 (rolldown-vite)
- **Testing**: Vitest 4.0 + @testing-library/react + Playwright (E2E)
- **Linting**: ESLint 9 + Prettier 3
- **i18n**: i18next + react-i18next
- **Styling**: Tailwind CSS 3
- **Components**: Storybook 10
- **Routing**: React Router DOM 7

## Workflow Commands

```bash
# Pre-commit validation (REQUIRED before commit)
pnpm typecheck && pnpm lint && pnpm test:coverage --run && pnpm verify:arch
```

## Language

- **Response language**: Spanish (voseo)
- **Code comments**: English preferred
- **Commit messages**: Conventional commits (English)
