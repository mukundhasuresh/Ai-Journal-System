## AI Journal System

AI Journal System is a fullstack Next.js 14 application where users complete immersive ambience sessions (forest, ocean, mountain) and write a short journal entry afterward. The system stores these entries, analyzes their emotional tone using an LLM, and surfaces insights about the user’s mental state over time.

The stack:

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite via Prisma ORM
- **LLM**: OpenRouter or Groq API

---

## Project structure

Key files and folders:

- `app/page.tsx` – main journal UI (textarea, ambience dropdown, submit/analyze buttons, entries list, insights panel)
- `components/JournalForm.tsx` – journal entry form and “analyze” button
- `components/EntryList.tsx` – list of previous entries
- `components/InsightsPanel.tsx` – long‑term and latest‑analysis insights
- `app/api/journal/route.ts` – `POST /api/journal` to store a new entry
- `app/api/journal/[userId]/route.ts` – `GET /api/journal/:userId` to list entries
- `app/api/journal/analyze/route.ts` – `POST /api/journal/analyze` for LLM emotion analysis
- `app/api/journal/insights/[userId]/route.ts` – `GET /api/journal/insights/:userId` for aggregate insights
- `lib/db.ts` – Prisma client singleton
- `lib/llm.ts` – LLM integration + in‑memory caching for repeated analysis
- `lib/insights.ts` – logic to compute insights from journal entries
- `prisma/schema.prisma` – Prisma schema, including `JournalEntry` model

---

## Setup instructions

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd Ai-Journal-System
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the project root (if it does not already exist):

```bash
DATABASE_URL="file:./dev.db"

# At least one of these must be set for LLM analysis:
OPENROUTER_API_KEY="your-openrouter-api-key"
GROQ_API_KEY="your-groq-api-key"
```

4. **Run database migrations**

The Prisma schema already includes the `JournalEntry` model. To ensure the SQLite database is in sync:

```bash
npx prisma migrate dev
```

This will create or update `dev.db` according to `prisma/schema.prisma`.

---

## Running the project

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

The main page lets you:

- Choose an ambience (`forest`, `ocean`, `mountain`)
- Write a journal entry
- **Save entry** (stores it in SQLite via Prisma)
- **Analyze emotions** (calls the LLM analysis API)
- View your **recent entries**
- See **long‑term insights** and the **latest analysis**

---

## API endpoints

All endpoints are relative to the Next.js dev server (e.g. `http://localhost:3000`).

- **POST `/api/journal`**
  - **Description**: Store a new journal entry.
  - **Body**:
    ```json
    {
      "userId": "123",
      "ambience": "forest",
      "text": "I felt calm today after listening to the rain."
    }
    ```
  - **Response**: The created `JournalEntry` record.

- **GET `/api/journal/:userId`**
  - **Description**: Get all entries for a user, most recent first.
  - **Response**: `JournalEntry[]`.

- **POST `/api/journal/analyze`**
  - **Description**: Analyze a piece of text with the configured LLM.
  - **Body**:
    ```json
    {
      "text": "I felt calm today after listening to the rain."
    }
    ```
  - **Response**:
    ```json
    {
      "emotion": "calm",
      "keywords": ["rain", "relief", "quiet"],
      "summary": "You describe feeling calm and soothed after listening to the rain."
    }
    ```
  - Includes in‑memory caching: repeated calls with identical `text` reuse the last result instead of calling the LLM again.

- **GET `/api/journal/insights/:userId`**
  - **Description**: Compute aggregate insights for a user’s entries.
  - **Response**:
    ```json
    {
      "totalEntries": 12,
      "topEmotion": "calm",
      "mostUsedAmbience": "forest",
      "recentKeywords": ["rain", "work", "tired", "focus"]
    }
    ```

---
---

## Architecture

System architecture and design decisions are explained in:

ARCHITECTURE.md

This document describes:

- Scaling the system to **100k users**
- Strategies to **reduce LLM costs**
- **Caching mechanisms** for repeated analysis
- Methods to **protect sensitive journal data**

---


## Development notes

- The project assumes a simple single‑user demo setup on the frontend (`userId = "demo-user-1"`), but the backend APIs are multi‑user capable via `userId`.
- LLM usage is abstracted in `lib/llm.ts` so you can easily swap models or providers.
- Insights logic is centralized in `lib/insights.ts` to keep API routes thin.
