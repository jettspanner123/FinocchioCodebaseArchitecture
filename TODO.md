# Finocchio — Deferred Work

Things deliberately deferred during feature work, to come back to later. Not a replacement for `ARCHITECTURE.md` §9–10 (infrastructure/decisions deferred at the architecture-planning stage) — this tracks feature-level follow-ups that come up once implementation starts.

## Authentication

- **Rate limiting on login/signup endpoints** (e.g., `rack-attack`, throttling repeated failed login attempts) — deferred during the initial auth slice to keep it focused on getting signup/login/JWT working end-to-end. Needed before production.
