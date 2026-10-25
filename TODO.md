# Finocchio — Deferred Work

Things deliberately deferred during feature work, to come back to later. Not a replacement for `ARCHITECTURE.md` §9–10 (infrastructure/decisions deferred at the architecture-planning stage) — this tracks feature-level follow-ups that come up once implementation starts.

## Authentication

- **Rate limiting on login/signup endpoints** (e.g., `rack-attack`, throttling repeated failed login attempts) — deferred during the initial auth slice to keep it focused on getting signup/login/JWT working end-to-end. Needed before production.
- **RSpec request specs for `Features::Authentication::AuthenticationController`** — SignUp/Login/Refresh/Logout were verified manually end-to-end (including rotation and auth-gating) via live curl requests during implementation, but no automated test suite exists yet for this feature. Should be written before this ships, to catch regressions as the Google/Apple sign-in slice gets added on top.
