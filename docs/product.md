# Welsh Vocabulary Flashcards — Product Specification

## Product goal
Build a mobile-first web application for learning Welsh vocabulary through short, daily flashcard sessions.

The app must:
- feel like a native mobile app
- be deployable to the Google Play Store using Capacitor
- support offline learning
- implement spaced repetition for long-term retention

This project replaces the legacy Flask app located in /legacy. :contentReference[oaicite:0]{index=0}

---

## Legacy migration context

The legacy app:
- is a Flask backend serving random vocabulary via API
- stores data in JSON
- tracks seen words in session memory
- supports vocabulary types such as:
  - nouns
  - adjectives
  - verb infinitives
  - multiple conjugation types
  - phrases

Phase 1 must include a migration path from this JSON format to the new database.

The legacy app is reference-only and must not be extended.

---

## Target platform

Primary target: Android app via Capacitor.

The web app must:
- run as a PWA
- run inside a Capacitor Android WebView
- use a single shared codebase

---

## Core user flow

1. User opens app
2. Selects session length
3. Reviews flashcards
4. Tap → flip
5. Swipe right → keep learning
6. Swipe left → mark as learned
7. Session ends automatically
8. Session summary is shown

---

## Session length selector

Available durations:
- 1 minute
- 3 minutes
- 5 minutes
- unlimited

Card queue size is calculated dynamically.

---

## Flashcard interaction

Gestures:
Tap → flip  
Swipe right → keep  
Swipe left → learned  

Animations:
- 3D flip
- velocity-based swipe
- stacked card transitions
- haptic feedback (Android phase)

---

## Vocabulary system

Users can filter by:

### Linguistic type
- nouns
- adjectives
- verb infinitives
- conjugations
- phrases

These map directly from the legacy dataset.

### Rarity slider

Common → frequency rank 1–500  
Intermediate → 501–2000  
Rare → 2001+  

---

## Spaced repetition system

Algorithm: SM-2 variant.

Each word stores:
- easiness_factor
- interval
- repetitions
- due_date
- last_reviewed

Correct recall:
- repetitions +1
- interval grows
- easiness_factor increases

Incorrect recall:
- repetitions reset
- interval = 1 day
- easiness_factor decreases

Card priority:
1. Due
2. New (filtered by rarity + category)
3. Backlog

---

## Only show mistakes mode

Session includes only:
- previously failed cards
OR
- cards with low easiness factor

---

## Daily streak system

A streak increments when at least one session is completed in a calendar day.

Grace rule:
One missed day per rolling 7 days without reset.

Tracked:
- current_streak
- longest_streak
- last_session_date
- grace_days_used

---

## Stats page

Displays:
- current streak
- longest streak
- total reviewed
- total learned
- category breakdown
- retention rate

Includes learned-word manager.

---

## Offline mode

The app must work offline for active sessions.

Offline storage must:
- persist session progress locally
- sync with Supabase when online
- be compatible with Capacitor

---

## Audio

Audio is out of scope for the current MVP and may be reconsidered in a future phase.

---

## Tech stack

### Frontend
Next.js (App Router)
TypeScript (strict)
Tailwind CSS
Framer Motion

### Mobile
Capacitor with Android platform initialised in Phase 1.

### Backend
Supabase:
- Postgres
- Auth (magic link, WebView compatible)
- Row level security

---

## Data model

### words
id  
welsh  
english  
part_of_speech  
frequency_rank  
legacy_type  
notes  
created_at  

### categories
id  
name  

### word_categories
word_id  
category_id  

### user_progress
user_id  
word_id  
status  
easiness_factor  
interval  
repetitions  
due_date  
last_reviewed  
review_count  

### user_stats
user_id  
current_streak  
longest_streak  
last_session_date  
grace_days_used  

---

## Coding standards

- TypeScript strict mode
- ESLint + Prettier
- Functional components only
- Absolute imports
- Feature-based architecture
- Conventional commits

---

## Folder structure

/app
  /(flashcards)
  /(stats)
  /(settings)

/components
/features
/lib
/server
/types
/capacitor

/legacy (read-only)

---

## Platform constraints

The app must:
- run as a PWA
- run inside Capacitor Android
- avoid browser APIs that break in WebView
- use local persistence compatible with Capacitor

---

## Phase 1 objective

Codex must:

1. Scaffold Next.js + TypeScript app
2. Configure Tailwind
3. Set up Supabase client
4. Create database schema and migrations
5. Create a migration script for the legacy JSON data
6. Initialise Capacitor with Android platform

Do not implement the flashcard UI yet.
