# WatchKnot - Project Blueprint & Developer Log

This document serves as a living blueprint and memory for AI agents and developers working on **WatchKnot**, ensuring continuous understanding of the project's state, past actions, and future roadmap.

## Project Overview
WatchKnot is a full-stack Next.js social platform and virtual movie theater. It allows users to collect, review, and watch movies together, with a focus on a cozy, vintage-aesthetic design.
**Key Tech Stack**: Next.js 15 (App Router), Neon (PostgreSQL), Prisma, Firebase Auth/Storage, PeerJS (WebRTC), Groq API, Cloudinary.

---

## 🛠️ Developer Log (Recent Actions)

### 1. PWA & Logo Integration
*   **Action**: Integrated `gemini-svg.svg` as the core application logo.
*   **Implementation**: Copied to `src/app/icon.svg` (for default Next.js favicon) and `public/icon.svg`.
*   **Manifest**: Updated `public/manifest.json` to point to the scalable SVG with `purpose: "any maskable"` for perfect rendering on Android/iOS homescreens.
*   **Metadata**: Injected Apple Web App meta tags into `src/app/layout.tsx`.

### 2. Offline Mode Support (Service Worker)
*   **Action**: Ensured the web app UI loads offline so users can access downloaded videos.
*   **Implementation**: Overhauled `public/sw.js` to implement a **Network First** caching strategy for navigation requests and a **Cache First** strategy for static assets. This runs alongside the existing `watchknot-media-v1` cache for handling video range requests.

### 3. Security & Git History Purge
*   **Action**: Resolved GitHub security alerts regarding leaked environment variables.
*   **Implementation**: 
    1. Renamed `.env` to `.env.local` to safely hide local secrets.
    2. Executed `git filter-branch` to completely eradicate `.env` from the repository's history.
    3. Force-pushed the scrubbed history to both `origin` (whimsical-maker) and `labonysur` (labonysur-cloud).

---

## 🗺️ The Blueprint (What needs to be done properly)

When working on WatchKnot, always adhere to the following architectural and design guidelines:

### 1. Design & Aesthetics
*   **No TailwindCSS**: This project strictly uses pure CSS and CSS Modules (`.module.css`). Do not install or use TailwindCSS utility classes.
*   **Vintage Vibe**: Maintain the "cozy, vintage-aesthetic". Always use colors, typography, and borders that align with this theme (e.g., retro ticket designs, gingham patterns, soft pinks/creams).

### 2. PWA & Offline Experience
*   **Always Test Offline**: Any new routes or major UI components must be cacheable by `sw.js`. Ensure that Next.js client-side navigations do not break when disconnected from the internet.
*   **Downloads**: Media files must bypass standard dynamic caching and be explicitly saved to `watchknot-media-v1` using the built-in offline manager.

### 3. Security & Secrets
*   **NEVER Commit `.env`**: Always ensure `.env.local` is used for secrets and that it remains in `.gitignore`.
*   **Client vs Server**: Ensure Firebase Admin is only used in `/api` routes or Server Actions. Client components must only use the Firebase Client SDK.

### 4. Real-time Synchronization
*   **Watch Rooms**: Any modifications to the video player must preserve the PeerJS WebRTC syncing logic. Do not introduce latency-heavy server polls for play/pause events.

### 5. Next.js 15 Considerations
*   **Async Params**: Remember that route `params` and `searchParams` are asynchronous in Next.js 15. Always `await` them before usage.
*   **Vercel Timeouts**: Keep Server Actions and API routes efficient. Heavily restrict fetch timeouts (especially for Groq AI or external scraping) to prevent Vercel 504 errors.
