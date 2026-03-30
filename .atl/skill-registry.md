# Skill Registry — webdev.tools

Project-specific skill registry for SDD integration.

## User-Level Skills

| Skill                         | Trigger                                  | Description                              |
| ----------------------------- | ---------------------------------------- | ---------------------------------------- |
| `sdd-init`                    | `/sdd-init`, "iniciar sdd"               | Initialize SDD context                   |
| `sdd-explore`                 | `/sdd-explore <topic>`                   | Explore and investigate ideas            |
| `sdd-propose`                 | `/sdd-new <name>`, `/sdd-propose`        | Create change proposal                   |
| `sdd-spec`                    | SDD workflow                             | Write specifications with scenarios      |
| `sdd-design`                  | SDD workflow                             | Technical design document                |
| `sdd-tasks`                   | SDD workflow                             | Break down into implementation tasks     |
| `sdd-apply`                   | SDD workflow                             | Implement tasks from change              |
| `sdd-verify`                  | SDD workflow                             | Validate implementation matches specs    |
| `sdd-archive`                 | SDD workflow                             | Sync delta specs to main, archive change |
| `skill-registry`              | "update skills", "skill registry"        | Update skill registry                    |
| `skill-creator`               | "create skill", "add agent instructions" | Create new AI skills                     |
| `go-testing`                  | Go tests, Bubbletea TUI                  | Go testing patterns                      |
| `judgment-day`                | "judgment day", "dual review"            | Adversarial review                       |
| `vercel-react-best-practices` | React/Next.js code                       | Vercel React performance guidelines      |

## Project Conventions

### Referenced Files

- `AGENTS.md` — Project-specific agent instructions (OpenCode commands, workflow, testing)
- `CLAUDE.md` — Global rules and personality
- `docs/ROADMAP.md` — Project roadmap (keep updated)
- `docs/ARCHITECTURE.md` — System architecture documentation
- `docs/AI_CONTEXT.md` — AI-specific context
- `docs/TESTING_MATRIX.md` — Testing strategy and coverage

### Project Stack

- **Frontend**: React 19 + TypeScript 5.9
- **Build**: Vite 7.2.5 (rolldown-vite)
- **Testing**: Vitest 4.0 + @testing-library/react + Playwright (E2E)
- **Linting**: ESLint 9 + Prettier 3
- **i18n**: i18next + react-i18next
- **Styling**: Tailwind CSS 3
- **Components**: Storybook 10
- **Routing**: React Router DOM 7
- **CI/Git**: Husky + lint-staged

### Workflow Commands

```bash
# Pre-commit validation (REQUIRED before commit)
pnpm typecheck
pnpm lint
pnpm test:coverage --run
pnpm verify:arch

# Testing
pnpm test --run          # Unit tests
pnpm test:coverage --run # With coverage
pnpm build && pnpm e2e  # E2E tests

# Development
pnpm dev
pnpm storybook
```

### Language

- **Response language**: Spanish (voseo)
- **Code comments**: English preferred
- **Commit messages**: Conventional commits (English)

### Notes

- SDD mandatory for complex changes (new features, large refactors)
- Direct work allowed for simple fixes and small refactors
- IndexedDB tests may be flaky in CI (timing-related)
