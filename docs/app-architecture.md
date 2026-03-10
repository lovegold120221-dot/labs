# Application Architecture

## 1. Overview
The **ubiquitous-waffle** project is a modern web application built with **Next.js (App Router)** and **React 19**. It leverages **Supabase** for the backend (database, auth, storage) and **Vapi** for voice-based AI interactions.

## 2. Tech Stack
- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React.
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions).
- **Voice/AI:** Vapi AI.
- **Styling:** Tailwind CSS (Vanilla CSS approach).

## 3. Directory Structure
- `src/app/`: Next.js App Router pages and API routes.
- `src/components/`: Reusable React components.
- `src/lib/`: Core libraries and utilities.
- `src/lib/services/`: Service layer for external APIs (Supabase, Vapi, etc.).
- `supabase/migrations/`: Database schema and migration files.

## 4. Key Components
- **Echo Service:** Handles text-to-speech (TTS) and voice cloning.
- **Orbit Service:** Manages AI agents, assistants, and call logic.
- **Supabase Integration:** Provides real-time data and authentication.

## 5. Security
- **Frontend:** Client-side interactions using `supabase-js` with RLS.
- **Backend:** Server-side operations using `supabase-js` with service role keys and Next.js API routes for sensitive logic.
