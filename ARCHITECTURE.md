## AI Journal System – Architecture

This document describes how the AI Journal System is structured today and how it could evolve to support higher scale, lower LLM costs, robust caching, and strong protection of sensitive journal data.

---

## 1. How would you scale this to 100k users?

At 100k users, the main concerns are database throughput, API concurrency, and LLM latency. A possible evolution path:

- **Application tier**
  - Keep using **Next.js** but deploy it on a scalable platform (e.g. Vercel, containerized on Kubernetes, or similar).
  - Use **serverless** or autoscaled API routes so that traffic bursts (e.g. many users finishing sessions at the same time) can be absorbed without manual capacity planning.
  - Split read‑heavy endpoints (e.g. `GET /api/journal/:userId` and `GET /api/journal/insights/:userId`) from write‑heavy ones and tune caching separately.

- **Database tier**
  - Move from single‑file **SQLite** to a managed SQL database (e.g. Postgres) with connection pooling.
  - Add indexes on `JournalEntry.userId`, `createdAt`, and possibly `emotion` for faster queries.
  - Use read replicas or a caching layer for read‑heavy workloads (e.g. insights and entry lists).

- **LLM tier**
  - External LLM providers can scale horizontally, but latency might become an issue at high concurrency.
  - Introduce a **job queue** (e.g. Redis‑backed) for analysis tasks so that API requests quickly enqueue work and return, while workers call the LLM in the background if synchronous analysis is not required.

- **Frontend and UX**
  - Paginate journal entries and lazy‑load older ones to avoid large payloads.
  - Cache insights data on the client and only refresh when needed (e.g. after a new entry).

- **Observability**
  - Add structured logging, metrics, and tracing (e.g. request counts, LLM call counts, latency, error rates).
  - Use this telemetry to tune limits (rate limiting, timeouts) and scale decisions.

---

## 2. How would you reduce LLM cost?

Key strategies to reduce how often and how expensively the LLM is called:

- **Caching**
  - The code already includes **in‑memory caching** in `lib/llm.ts` keyed by the exact journal text.
  - For production, use a **shared cache** (Redis or similar) so all instances share the same cache, with an appropriate TTL and size limit.

- **Model selection and prompt design**
  - Use **smaller, cheaper models** (e.g. “mini” or “small” variants) by default for emotion analysis, since the task is simple and robust to small quality differences.
  - Keep prompts concise and focused; avoid unnecessary context or examples that increase token usage.

- **Avoid unnecessary re‑analysis**
  - Only analyze when the text has actually changed.
  - When editing an existing entry, compare the old and new versions and decide whether a re‑analysis is needed (e.g. change threshold).

- **Batching and offline analysis**
  - Where possible, **batch** multiple analyses into a single LLM request (e.g. analyze multiple entries for a user at once).
  - Shift non‑urgent analysis (e.g. backfilling or recomputing insights for older entries) to **background jobs** with slower, cheaper processing windows.

- **Limits and quotas**
  - Rate‑limit the number of analyses per user per time window.
  - Optionally offer tiers: free users get fewer or slower analyses, while paid tiers get more generous limits.

---

## 3. How would you cache repeated analysis?

The current implementation uses an **in‑memory cache** inside `lib/llm.ts`:

- The cache key is the normalized journal `text`.
- When `analyzeEmotionWithLLM` is called:
  - It first checks the cache.
  - If a result exists, it returns it immediately without calling the LLM.
  - Otherwise it calls the LLM, parses the JSON, stores it, and returns it.

For a production‑grade cache:

- **Centralized cache store**
  - Use Redis or another networked cache so that all app instances share the same cached analyses.
  - Key format example: `analysis:v1:<hashOfText>`, where the hash is a stable hash (e.g. SHA‑256) of the entry text.
  - Include a **version** prefix (like `v1`) so that if the output shape or prompt changes, you can invalidate all old entries by bumping the version.

- **TTL and eviction**
  - Use a TTL (e.g. 7–30 days) to automatically evict very old analyses.
  - Combine TTL with an LRU policy so heavily accessed entries stay cached.

- **Database‑level caching**
  - Optionally persist the analysis result alongside the journal entry in the database (e.g. in JSON columns or split columns for emotion/keywords/summary).
  - On re‑read, use the stored analysis instead of re‑calling the LLM; recompute only when the entry text changes or when you explicitly want fresh insights.

---

## 4. How would you protect sensitive journal data?

Journal entries are highly sensitive and should be treated as such at every layer:

- **Transport security**
  - Enforce HTTPS for all traffic between frontend, backend, and any external services (LLM, database).
  - Reject plaintext HTTP in production environments.

- **Access control and authentication**
  - Integrate robust authentication (e.g. OAuth, passwordless magic links, or similar) so each journal entry is strictly tied to an authenticated user.
  - Ensure all journal APIs enforce that `userId` matches the authenticated user and never allow arbitrary access to another user’s data.

- **Data at rest**
  - Use an encrypted database or disk volume (e.g. managed Postgres with encryption at rest).
  - If staying on SQLite, store the file on an encrypted volume and restrict OS‑level access.
  - Avoid committing database files (`dev.db`) or `.env` files to version control.

- **Data minimization and retention**
  - Store only what is necessary: the journal text, ambience, and derived insights.
  - Consider configurable **retention policies** (e.g. auto‑delete entries older than a certain age, or allow users to delete all their data in one action).

- **LLM privacy**
  - Prefer LLM providers and regions with strong privacy guarantees and data processing terms.
  - Avoid sending unnecessary user identifiers or metadata in prompts; only send what is needed to compute emotions and keywords.
  - Where possible, anonymize or pseudonymize content before sending it to the LLM.

- **Operational security**
  - Store API keys and database URLs exclusively in secure environment variables or managed secrets stores.
  - Rotate keys regularly and avoid logging sensitive data (journal text, tokens, connection strings).
  - Add audit logging for administrative actions and access to user data.

