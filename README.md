# FactoryMind Artifact

Editable React/Vite version of the Claude artifact exported as `remixed-bf184c57.tsx`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Codex and Claude Code should use the same canonical local URL:

```bash
npm run dev:codex
npm run dev:claude
```

- Canonical local app: `http://localhost:5173`
- If `5173` is busy, stop the existing server instead of letting Vite move to another port.

## Collaboration workflow

- Treat this folder as the source of truth, not the Claude public artifact.
- Before asking Codex or Claude Code to edit, run `git status`.
- Make small commits after meaningful changes.
- If both tools are editing, have one finish and commit before the other starts.
- Keep the original artifact export in Git history so regressions are easy to compare.

## Artifact-style versions

This repository uses Git commits and tags as artifact versions.

Useful commands:

```bash
npm run artifact:status
npm run artifact:history
git tag --list "artifact-v*"
git checkout artifact-v0.1.0
```

To create a new traceable version after a meaningful change:

```bash
npm run build
git status
git add .
git commit -m "Describe the artifact change"
git tag -a artifact-v0.1.1 -m "Artifact v0.1.1"
git push
git push origin artifact-v0.1.1
```

## Key files

- `src/App.tsx`: the exported artifact component.
- `src/main.tsx`: React entry point.
- `src/styles.css`: global browser reset.
