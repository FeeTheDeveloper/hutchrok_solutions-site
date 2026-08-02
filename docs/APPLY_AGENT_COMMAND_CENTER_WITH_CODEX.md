# Codex implementation task

Target repository: `FeeTheDeveloper/hutchrok_solutions-site`

Apply the Hutchrok Agent Command Center overlay in this directory to the
repository, preserving relative paths.

## Required execution order

1. Create branch `feat/hutchrok-agent-command-center` from current `main`.
2. Inspect current `package.json` and confirm `@openai/agents` and Zod v4 are
   already installed.
3. Apply the overlay with `scripts/install-overlay.sh /absolute/path/to/repo`,
   or copy only `app/`, `lib/`, `docs/`, and the listed scripts manually. Do
   not overwrite the repository root `README.md` with the bundle README.
4. Compare `lib/db/migration-011-agent-command-center.sql` with Supabase
   migration history. Production migrations `agent_command_center` and
   `enable_pg_net_for_agent_jobs` are already applied to project
   `igiuifkvunrnmgamyzqw`; do not apply them a second time without inspection.
5. Run `node scripts/verify-agent-bundle.mjs`.
6. Run `npx tsc --noEmit`.
7. Run targeted ESLint on the new and replaced TypeScript files.
8. Run `npm run build`.
9. Review the diff for secret values, unintended client-side imports, and
   the two deliberate replacements: `lib/agents/intake-triage.ts` and
   `lib/notifications/dispatcher.ts`.
10. Commit and open a pull request into `main`.
11. After merge, verify the Vercel deployment reaches READY.
12. Run the post-deploy checks in `docs/DEPLOYMENT_CHECKLIST.md`.

## Non-negotiable boundaries

- Keep all agent routes server-side.
- Require an Authorization Bearer header for every agent administration route.
- Do not add autonomous filing, payment, status-change, client-message, or
  government-submission tools.
- Do not log prompts, private documents, addresses, contact data, government
  identifiers, bank data, or API keys.
- Approval records acceptance of a recommendation only; it must not execute an
  external action.
