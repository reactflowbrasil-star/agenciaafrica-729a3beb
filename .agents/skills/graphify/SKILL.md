---
name: graphify
description: Build and maintain this repository's source dependency graph so agents can trace routes, components, utilities, and server behavior before changes.
---

# Graphify the project

Use this skill for every repository task and after every source-structure change.

1. Read `docs/agent-context.md` and `docs/code-graph.md` before planning. Treat both as navigation aids, then verify details in source.
2. Run `npm run graphify` when the graph is missing, stale, or source files were added, removed, or rewired.
3. Review the generated graph for missing route/server boundaries and follow the relevant import paths before editing.
4. Update `docs/agent-context.md` only when a durable architecture, runtime, security, or deployment fact changed. Keep operational facts evidence-based and concise.
5. Commit generated graph/context changes with the source change that caused them.

The graph is generated from local TypeScript/TSX imports by `scripts/graphify.mjs`; it needs no network access or extra dependency. It records file relationships, not semantics, runtime behavior, or permission to change code. Validate any important conclusion against the implementation.

Do not make the skill longer merely to satisfy a request that it become “more advanced.” Add a rule only when a real task reveals a reusable gap, and keep the instructions safe and testable.
