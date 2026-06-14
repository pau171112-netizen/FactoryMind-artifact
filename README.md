# FactoryMind Artifact

Editable React/Vite version of the Claude artifact exported as `remixed-bf184c57.tsx`.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Collaboration workflow

- Treat this folder as the source of truth, not the Claude public artifact.
- Before asking Codex or Claude Code to edit, run `git status`.
- Make small commits after meaningful changes.
- If both tools are editing, have one finish and commit before the other starts.
- Keep the original artifact export in Git history so regressions are easy to compare.

## Key files

- `src/App.tsx`: the exported artifact component.
- `src/main.tsx`: React entry point.
- `src/styles.css`: global browser reset.
