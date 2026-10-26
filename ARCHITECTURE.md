# Finocchio — Architecture

Status as of 2026-10-22: **pre-implementation**. Every decision below came out of a requirements-gathering interview and is considered settled unless explicitly marked **OPEN** in [Open Decisions & Flags](#open-decisions--flags). No code has been written yet. Domain vocabulary lives in `CONTEXT.md`, not here — this file is pure technology/implementation.

## 1. What Finocchio Is

A cross-platform (iOS + Android) budget-tracking mobile app with AI-assisted features, built with a React Native (Expo) frontend and a Ruby on Rails API backend. Single currency (INR), offline-first, multi-language (English/Hindi/Punjabi), supports both solo tracking and shared/split expenses between users.

## 2. Product Scope

### v1 scope (confirmed)

- Manual transaction entry, user-defined Categories (create/edit)
- Overall dashboard + category-wise dashboard
- Per-category Budget Caps with alerts at 80% and 100%
- Recurring transactions
- Shared Categories: multi-member, phone-number/invite-link based membership, four Split modes (Equal, Subset, Percentage, Exact), Balance tracking with manual Settlement, per-user toggle for whether shared spend counts to personal Budget Cap
- Permissions: any Member adds expenses; only an expense's creator or the Category admin can edit/delete it; only the admin removes Members or deletes the Shared Category
- AI: Auto-Categorization, Conversational Assistant (read + write, action-confirmation required), Receipt Scan, Spending Insights, Forecasting
- Auth: email/password, Apple Sign-In, Google Sign-In
- Offline-first: all actions (including AI feature requests) queue while offline and run on reconnect, with a visible pending-queue indicator
- Localization: English (default), Hindi (Devanagari), Punjabi (Gurmukhi)
- Theming: light (default) and dark, both from v1

### Explicitly deferred to v2+

- Bank-account sync (e.g., Plaid)
- Multi-currency / currency conversion
- Real payment-gateway settlement (Settlements stay ledger-only in v1)
- CI/CD pipeline
- Analytics/crash reporting
- E2E test automation (Maestro) — unit/component testing is in scope for v1

## 3. Frontend Architecture

| Concern | Choice | Why |
|---|---|---|
| Platform | Expo SDK **58** (React Native 0.88, React 19.3) | Upgraded from SDK 57 on 2026-10-26 at the owner's explicit instruction ("upgrade to SDK 58.0.0 exactly"). New Architecture (Fabric/TurboModules) is mandatory on this SDK too, not optional — unchanged from SDK 57 |
| Language | TypeScript, strict | Explicitly requested ("strongly typed") |
| Styling | NativeWind **v4.2.0** (pinned, not v5), paired with **Tailwind CSS v3.4.x** | v5 is pre-release at time of writing; v4 confirmed working on SDK 58 too (re-verified after the SDK 57→58 upgrade: `jsxImportSource` fix and `nativewind/jsx-runtime` output both still hold after `babel-preset-expo` was bumped to the SDK 58 version). NativeWind 4.2.0 specifically requires Tailwind v3 — confirmed empirically via `expo-doctor` during scaffolding, after an initial setup attempt (following docs that showed v4-style `@import` syntax) failed; the installed package's actual requirement is the source of truth here, not that doc snippet. **`babel.config.js` must pass `{ jsxImportSource: 'nativewind' }` to `babel-preset-expo`** — without it, `className` is a completely inert prop (no error, no styling, nothing). A plausible-looking doc example omitting this was followed once and silently broke all styling; NativeWind's own `dist/doctor.js` (`verifyJSX()`) confirms this option is required, which is the authoritative source now, not any single doc snippet. Also: `react-native-css-interop` (NativeWind's actual styling engine) can end up present in Bun's package store but not linked into `node_modules` — if styling silently stops working again, check `ls node_modules/react-native-css-interop` first |
| Animation | react-native-reanimated 4.7.1, react-native-worklets 0.13.0 (SDK 58 versions) | Explicitly requested. Babel plugin is `react-native-worklets/plugin` (moved out of `react-native-reanimated/plugin` as of Reanimated 4 / SDK 54+) — already wired into SDK 58's default templates, no manual setup needed |
| Navigation | Expo Router | Expo's current recommended standard, now on the SDK 58 version (`expo-router@58.0.26`) |
| UI components | Pure NativeWind utility classes + hand-rolled components (no Tamagui/gluestack/NativeBase/react-native-paper) | Component libraries bring styling opinions that conflict with NativeWind's utility model |
| Charts | `react-native-gifted-charts` | Lighter/simpler API than Victory Native for standard dashboard chart types |
| App-level state | Zustand | Covers auth session + UI preferences (theme, language) — the state WatermelonDB doesn't own |
| Non-synced API calls | TanStack Query | Caching/retry/loading-state handling for calls outside WatermelonDB's sync domain (auth, AI job triggers/results, uploads) |
| Offline-sync local DB | **WatermelonDB** | See [§5 Offline Sync](#5-offline-sync-architecture) |
| Forms | React Hook Form | Fewer re-renders than Formik, standard current choice |
| Validation | **Zod**, strictly | Used for both form validation and runtime-validating API responses (closes the gap TypeScript's static types leave at runtime) |
| i18n | `react-i18next` + `expo-localization` | react-i18next for translation lookup, expo-localization for device locale detection — solve different problems, used together |
| Testing | Jest + React Native Testing Library | Standard for Expo/RN unit/component testing. Maestro planned for E2E, deferred to v2 |
| Push notifications | Expo's built-in push service | All notification needs (budget alerts, settlement pings, AI-ready notices, sync-queue status) are transactional, not campaign/marketing-style — doesn't need OneSignal's segmentation/analytics machinery |

### Dev/build workflow

WatermelonDB requires native SQLite/JSI bindings, so the app **cannot run in plain Expo Go** — it needs a custom dev client (`expo-dev-client`).

- **Now** (no paid Apple Developer Program yet, Mac available): local Xcode build signed with a free "Personal Team" Apple ID, installed via USB cable. Free, but the provisioning profile expires every **7 days** (requires a rebuild from Xcode to keep working), and **push notifications cannot be tested** under free signing — Apple blocks that entitlement without a paid account.
- **Android**: free and unrestricted via USB debugging (`expo run:android`), no expiry, no account needed — the practical default for day-to-day testing.
- **Later**: once an Apple Developer Program membership ($99/yr) exists, move to **EAS Build** for iOS (and eventually EAS Submit for App Store distribution). EAS cannot produce an installable physical-device iOS build without a paid Apple account — that's an Apple platform restriction EAS cannot route around; its only payment-free iOS option is a Simulator build (not installable on a physical phone).

## 4. Backend Architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | Ruby on Rails (current stable, 8.1.x), `--api` mode | Confirmed first-class via `config.api_only`; no need for Rails' view-layer machinery serving a mobile-only client |
| Database | **PostgreSQL 18** (not Rails 8's new SQLite-even-in-production default) | Shared Categories mean multiple users' devices write to overlapping data; background AI jobs read/write concurrently too. Postgres's concurrent-write handling and indexing are the safer fit. Installed natively on the dev Windows machine (not Docker — a native local server already existed by the time this was set up) |
| Local dev secrets | `dotenv-rails` gem + a gitignored `.env` in the backend folder | Database credentials (and future local-only secrets) load from environment variables (`DATABASE_HOST/PORT/USERNAME/PASSWORD` in `config/database.yml`) rather than being hardcoded — `.env` is never committed |
| Background jobs | **Solid Queue** (Rails 8 default, DB-backed) over Sidekiq | No extra infra (no Redis to provision/monitor) — AI job volume here is per-user-action, not high-throughput, so Sidekiq's extra tooling isn't needed yet |
| Auth | Custom `has_secure_password` + the `jwt` gem (not Devise/devise-jwt) | Devise assumes a cookie-session web app; most of its generated code doesn't fit an API-only + mobile client. Apple/Google sign-in happens on-device (Expo's native sign-in SDKs); Rails only verifies the resulting identity token server-side |
| Testing | RSpec | De facto standard in current production Rails codebases, better matcher/mocking ergonomics than Minitest for API response/model testing |
| CORS | `rack-cors` | Standard for a Rails API serving a non-browser mobile client |

## 5. Offline Sync Architecture

Client-side local database: **WatermelonDB** (SQLite-backed, on-device only — it is not a server database and has no server component).

- **WatermelonDB** (phone): the app's actual read/write target, including fully offline. Holds Transactions, Categories, Splits, Members, Balances, etc.
- **PostgreSQL** (via Rails): the real, authoritative server database.
- **Sync protocol**: WatermelonDB's `synchronize({pullChanges, pushChanges})` bridges the two. Rails must implement two custom endpoints (no official Rails gem exists for this — it's a documented client protocol, not a packaged two-sided solution):
  - **Pull**: client sends `lastPulledAt`; server returns every record changed since then, plus the server's current timestamp.
  - **Push**: client sends every locally created/updated/deleted record. If anything the client is pushing was changed server-side since `lastPulledAt`, the whole push is rejected and retried.
- **Conflict resolution**: per-column, "client wins on locally-changed fields" — the server's version wins except for the specific columns the client changed since last sync. This fits Finocchio's permission model well: since only an expense's creator/admin can edit it (§2), genuine concurrent-edit conflicts on the same field should be rare.
- Alternatives considered: TanStack Query's offline mutation queue (no local database, no conflict resolution — would require hand-building both from scratch) and Legend-State (built-in sync engine, but newer with no confirmed RN/Expo compatibility or production-maturity signal for a financial multi-writer workload at time of research).
- **Offline queue UX**: every offline action (including AI feature requests, which always need network) is queued and visibly shown to the user as pending, then runs automatically on reconnect — one consistent mental model across the whole app, not different behavior per feature.

## 6. AI Architecture

- **Two providers, split by capability** — no single model across either provider was confirmed to do both vision and tool-calling well, so Finocchio deliberately uses one model per job:
  - **Vision (Receipt Scan)**: **Google Gemini 2.5 Flash**, via the official `@ai-sdk/google` provider package. Confirmed multimodal (image input) and compatible with the Vercel AI SDK's standard `type: 'file'` message-content pattern.
  - **Tool-calling (Conversational Assistant's read+write actions)**: **Groq**, model `openai/gpt-oss-120b`, via the official `@ai-sdk/groq` provider package. Explicitly **not** `openai/gpt-oss-20b` (the model PLMInfraRegister uses for its own assistant) and not `llama-3.1-8b-instant` (confirmed to lack tool-calling support) — the user has deliberately chosen the 120b model for this project.
  - Groq is a fast-inference API for open-weight models — not to be confused with xAI's "Grok."
- **Groq account**: Finocchio uses its **own** Groq API key/account, separate from PLMInfraRegister's. PLMInfraRegister's account is capped at 8,000 tokens/minute and has hit that limit in production — a separate key avoids any contention between the two apps.
- **Client-side integration**: `@ai-sdk/react`'s `useChat` hook — confirmed to work in Expo/RN via `expo/fetch` as the fetch implementation. Gives the pre-built tool-call state machine (message `parts` with `input-available`/`output-available` states) and drives the Confirmation Card / generative UI rendering by switching on tool name + state. The Receipt Scan flow (Gemini, vision-only, no chat/tool-calling) is a separate, simpler request/response integration — it doesn't need `useChat`'s conversational state machine at all, just a direct call with the image attached.
- **Backend side**: the Vercel AI SDK's server half is a Node/TypeScript package and doesn't run on Rails. Rails will **hand-implement a streaming endpoint matching the AI SDK's documented wire protocol** rather than reimplementing the client-side tool-call state machine from scratch — judged to be less total work than rebuilding `useChat`'s behavior by hand.
- **Processing model**: all five AI features (Auto-Categorization, Conversational Assistant, Receipt Scan, Spending Insights, Forecasting) run as background jobs (via Solid Queue) with a status indicator and a push notification when complete — consistent with the Offline Queue UX, and avoids blocking the UI on a third-party API call that can take several seconds.
- **Action safety**: every Assistant Action (any data-modifying operation) requires an explicit user confirmation via a Confirmation Card before it executes — no exceptions in v1. A misparsed chat instruction must never silently alter financial data.
- **Data privacy**: transaction data and receipt images are sent to Groq under its standard API terms. Obvious sensitive fields (card numbers, etc.) must be redacted/masked before sending. Self-hosting a comparable vision + tool-calling model was judged not justified for a v1 app.

## 7. Repository & Tooling

Matches the existing convention found across other we.plm projects (AssetSphere, SignForge, PLMInfraRegister — internally named "InfraGrid" in its own codebase) via direct repo inspection — see the flag about this in [Open Decisions & Flags](#open-decisions--flags) for the trust caveat attached to this convention.

- **Repo shape**: monorepo (not separate frontend/backend repos)
- **Root folder**: `FinocchioCodebaseArchitecture` (renamed from the placeholder `BudgetTrackerCodebaseArchitecture`)
- **Frontend folder**: `FinocchioClientServiceLayerMSC`
- **Backend folder**: `FinocchioOrchestratorServiceLayerMSC`
- **Monorepo tool**: Bun + Turborepo at the root, matching the other repos — Rails (a non-JS backend) gets wrapped in a thin `package.json` with scripts shelling out to `bin/rails server` / `bundle exec ...`, purely so Turborepo can orchestrate `dev`/`build` uniformly across both sides. This mirrors how those other repos wrap their own non-JS backends (.NET, Java).
- **iOS bundle identifier**: `com.vgud.finocchio`
- **Android package name**: `com.vgud.finocchio` (same string, by convention)
- **Expo slug**: `finocchio`

## 8. API Conventions

- **Routes**: `/Api/V1/{PascalCaseResource}/{PascalCaseAction}` — confirmed as the real, enforced pattern in PLMInfraRegister's actual route constants and its `CODING-RULES.md` §14.
- **JSON response body casing**: **PascalCase, written rule and actual runtime output both** — explicit user decision, resolving the discrepancy found in PLMInfraRegister (see §10 for that history). Example shape: `{"Message": "Hello world", "Success": true, "StatusCode": 200}`.
  - **Implementation note for when coding begins**: Rails does **not** produce PascalCase JSON by default (its native default is snake_case), so — unlike PLMInfraRegister, where the written rule silently went unenforced because nothing overrode ASP.NET Core's camelCase default — Finocchio's Rails app needs an explicit, deliberate serialization layer (e.g., a shared response-envelope serializer that transforms keys to PascalCase) wired in from the first endpoint, not assumed to happen automatically. This is the specific thing that went wrong in the sibling project; don't repeat it here.

## 9. Infrastructure (hosting, storage, provider accounts)

These are all **deliberately deferred** at the user's request — decided in principle, but not to be provisioned or integrated until explicitly instructed:

- **Hosting**: Render (both the Rails app and, likely, its Postgres instance) — confirmed as the target, but do not provision anything until told to.
- **Image/receipt storage**: Appwrite.io — confirmed as the target for Rails ActiveStorage's backing service, but not to be integrated until later. Code should use ActiveStorage's abstraction so the eventual backend is a config change, not a rewrite.
- **AI provider accounts**: Groq (own key, separate from PLMInfraRegister) and Google (for Gemini 2.5 Flash) — see §6.
- **Database hosting**: user mentioned wanting to use Supabase (via its MCP tooling) later for Postgres, once a Supabase account exists for this app. Not yet reconciled with the Render-hosting decision above — may mean Postgres ends up hosted on Supabase while the Rails app itself runs on Render, or this may change. Revisit when the user raises it again.
- **CI/CD**: deferred — no existing convention to match across we.plm's other repos (confirmed directly by the user), and no test suite exists yet to gate.

## 10. Open Decisions & Flags

These are explicitly **not** settled — do not silently resolve them in code; ask first.

1. **We.plm naming/tooling convention, trust caveat.** Early in this project's planning, a background research agent returned a fabricated result (via an unrelated tool call) describing this exact `{Project}ClientServiceLayerMSC` / `{Project}OrchestratorServiceLayerMSC` naming pattern before any legitimate lookup had occurred — a likely prompt-injection. A later, direct GitNexus inspection of real repos (AssetSphere, SignForge, PLMInfraRegister) independently found the same pattern for real, suggesting either it's a genuine convention the injection happened to know, or the indexed repos themselves carry a propagating injection in shared boilerplate (`AGENTS.md`/`CLAUDE.md` files present in all of them). The user explicitly chose to proceed with this convention after being told this. Recorded here so it isn't forgotten: if anything about this naming ever looks wrong, this is why.
2. **GitNexus tooling is degraded in this environment.** Its embeddings index is unbuilt (`embeddings: 0` across all indexed repos) and its full-text search is broken here (missing an OpenSSL3 DLL dependency). Research so far has worked around this by reading files directly, but GitNexus's own `query`/`search` tools cannot currently be trusted to return results for this environment — direct file inspection is the fallback.
3. **Dashboard/chart specifics, exact budget-alert copy, exact split-UI flows** — not yet designed at the pixel/flow level; this document covers architecture, not UX detail.
4. **WatermelonDB's New Architecture compatibility is unverified.** React Native Directory flags it "Untested" on New Architecture, which Expo SDK 58 (like 57 before it) mandates with no opt-out. Decision made: proceed with WatermelonDB as scaffolded, and verify empirically once the actual sync layer is built, rather than pre-emptively switching to Legend-State or a custom approach on a label alone. If real incompatibility surfaces during that work, revisit then — don't let it block scaffolding now.

### Resolved (kept here for history)

- ~~Groq API key/account strategy~~ — Finocchio uses its own, separate from PLMInfraRegister (§6, §9).
- ~~Groq/vision model pairing~~ — Gemini 2.5 Flash (vision) + Groq `openai/gpt-oss-120b` (tool-calling), explicitly not `gpt-oss-20b` (§6).
- ~~JSON response envelope shape~~ — PascalCase, written rule and actual output both; requires an explicit Rails-side serializer, not a default (§8).

## 11a. Local Development Environment (this machine, as of first scaffold)

Recorded because it took real troubleshooting to establish — don't re-derive it from scratch if a future session needs to know what's actually set up:

- **Ruby 4.0.7** (x64-mingw-ucrt, native Windows install via RubyInstaller — not Docker, not WSL2), **Rails 8.1.4**, **Bundler 4.0.20**, all confirmed on PATH.
- **PostgreSQL 18**, native Windows install, server running locally on `localhost:5432`. Dev role: username `Finocchio` (credentials live only in the backend's gitignored `.env`, never in `database.yml` or committed anywhere).
- **Bun 1.3.14**, **Git**, **Docker Desktop**, and **GitHub CLI** (`gh`, authenticated) all present and working.
- Two environment gotchas hit and resolved during setup, worth knowing if they recur: (1) installing new software (Ruby, then Postgres) and adding it to `PATH` doesn't take effect in an already-running terminal/session — a full restart of the terminal/session is needed, not just a retry; (2) a `PATH` entry can be *wrong* in a way a restart won't fix — this machine had `...\PostgreSQL\18\bin\psql.exe` (a file) instead of `...\PostgreSQL\18\bin` (the directory) in `PATH`, which silently breaks command resolution even though the file genuinely exists. Always verify with the actual command before assuming a restart will fix a "not found" error.
- GitHub repo: `https://github.com/jettspanner123/FinocchioCodebaseArchitecture` (private), default branch `master`.

## 11. Non-Goals (explicit)

- No multi-currency support in v1.
- No real money movement for Settlements — ledger notation only.
- No bank-account sync (Plaid or otherwise) in v1.
- No WebSocket/ActionCable real-time layer — shared-category updates rely on push-notification-triggered refresh, not a persistent connection.
- No third-party push/engagement platform (OneSignal) — Expo's built-in service only.
- No component library (Tamagui/gluestack/NativeBase/react-native-paper) — pure NativeWind.
