<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the background video layer isolated from briefing content and form interaction so text input stays accessible.
- Derive narration typing from the audio clock with per-word deadlines in the narration module; never impose a minimum typing duration that exceeds a word's time slot.

## Agent skills and project context

- For every task in this repository, read `.agents/skills/context-enrichment/SKILL.md` and `.agents/skills/graphify/SKILL.md` before planning. Apply the context-enrichment workflow to understand the request, relevant architecture, prior work, constraints, and validation needs.
- Treat `docs/agent-context.md` as the concise, durable project map. Read it before changing code. Update it when implementation reveals a lasting architectural fact or operational constraint.
- Keep `docs/code-graph.md` synchronized with source imports. Run `npm run graphify` after source structure changes and include the generated graph update in the same change.
- Improve these skills with reviewed, reusable lessons when work reveals a durable gap. Do not rewrite skill instructions mechanically for every request, weaken safeguards, or add unverified assumptions.
- Repository-local skills guide agents when loaded in this checkout. Platform-global skill installation and automatic context injection outside this repository are not available from these files.
