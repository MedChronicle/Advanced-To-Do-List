# Contributing

This started as a personal/prototype project exported from Figma Make, so treat these as lightweight defaults rather than strict rules — adjust them once the project has real collaborators.

## Workflow

1. Create a branch off `main`: `git checkout -b feature/short-description`
2. Make your changes.
3. Run the app locally (`npm run dev`) and click through the areas you touched — there's no automated test suite yet (see [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#testing)).
4. Commit with a clear, present-tense message (e.g. `Add recurring task support`, not `added stuff`).
5. Open a pull request describing what changed and why.

## Code style

- TypeScript everywhere; keep the `Task`/`Category`/`FilterState` types in `types/index.ts` as the source of truth and update them first when a feature needs new data.
- Functional components with hooks — no class components.
- Keep components focused; if a component's props list is growing unmanageably, consider splitting it.
- Match the existing pattern for theme-aware styling (`theme === 'dark' ? ... : ...`) rather than introducing a new theming approach.
- Naming: components in `PascalCase.tsx`, functions/variables in `camelCase`, files under `components/ui/` follow shadcn/ui's own conventions — leave those largely as-is.

## Where things live

See the **Project structure** and **File-by-file reference** sections of [README.md](./README.md) and [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) before adding new files — most changes fit into an existing file or component.

## Licensing note

This repository does not currently include a `LICENSE` file, which means it's "all rights reserved" by default — contributions are only appropriate if you have the repository owner's permission to submit them. If this project is meant to be open source, add a `LICENSE` file (e.g. MIT) before accepting outside contributions, and update the License section of [README.md](./README.md) to match.

## Reporting issues

Since there's no issue tracker wired up yet, note the problem (steps to reproduce, expected vs. actual behavior, browser/OS) wherever you're coordinating with the project owner, and consider adding it to [BUGFIXES.md](./BUGFIXES.md) once resolved.
