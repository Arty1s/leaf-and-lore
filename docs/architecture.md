# Architecture and MVP plan

## Current repository

The workspace was empty when implementation began: there was no repository, stack, source code, or reusable implementation. This project therefore starts with a small React/FastAPI monorepo and avoids premature service separation.

## Data model

### Identity and social

- `users`: account identity, profile fields, privacy setting for reading speed.
- `friendships`: one canonical user pair, requester, and pending/accepted/declined status.
- `discord_connections`: one-to-one link between an app user and Discord identity; tokens are not stored in this initial model.
- `book_clubs`: club identity and optional Discord guild/channel mapping.
- `club_memberships`: user membership and role within a club.

### Catalog and reading

- `books`: shared metadata sourced from Open Library or another provider; ISBN is unique when present.
- `user_books`: a user's relationship to a book, including status, dates, personal notes, and rating.
- `reading_sessions`: immutable reading facts (page range, duration, date, difficulty). Pages, words, pages/hour, and WPM are derived in queries or API serializers.
- `reading_goals`: scoped goals by metric and time period. A date range makes progress calculation explicit and supports calendar years or custom periods.
- `reviews`: optional longer review text separated from the lightweight rating stored on `user_books`.

The schema deliberately avoids cached totals. If scale later requires aggregates, they should be rebuildable projections derived from reading sessions.

## MVP phases

1. Foundation: monorepo, schema, migrations, health endpoint, representative dashboard UI.
2. Core account/library: registration and login, profile/privacy, book search/import, library status and notes.
3. Reading: session logging, validation, computed speed metrics, current-book progress.
4. Analytics/goals: dashboard summaries, monthly graph, per-book/difficulty speed context, goals.
5. Friends/social: user search, friend requests, profile visibility, compact activity feed.
6. Clubs/leaderboard: club membership and friends/club-only rankings, defaulting to pages read.
7. Discord boundary: OAuth account linking and bot-scoped API endpoints for commands.

Every phase includes API tests and frontend states for loading, empty data, errors, and success.

