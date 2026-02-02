# SafePool — Full Project Context & Build Prompt

## Chat History & Project Summary

This document captures the full context of the SafePool startup website, built for an Auburn group project (Spencer Minton, Mack Thompson, Brandon Cresap, Henry Vantieghem). It was developed from a Discovery Assignment (1.0_Discovery_Assgn.pdf) that outlined the concept, team, market, and vision.

### What Was Built (Current State)

- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind, Supabase, OpenAI Vision
- **Deployed**: https://safepool.vercel.app (Vercel)
- **Supabase**: Project `lxwepiocbsrbrwaboimv`, email verification disabled
- **Marketing site**: Landing, About, Pricing, Contact, Login, Register
- **Dashboard**: Auth-gated layout with sidebar (Overview, Live Feeds, Incidents, Settings)
- **AI**: `POST /api/analyze-frame` — OpenAI GPT-4o-mini Vision analyzes pool frames, returns `{ distress, confidence, description }`
- **Live Feeds**: Demo video or upload, frame capture every 3s, distress overlay, incident creation in Supabase
- **Incidents**: List with filters, detail modal, resolve
- **Settings**: Facilities, cameras, alert sensitivity CRUD

### Key Files

| Path | Purpose |
|------|---------|
| `app/(marketing)/page.tsx` | Landing |
| `app/dashboard/live/page.tsx` | Live feeds + AI analysis |
| `app/api/analyze-frame/route.ts` | OpenAI Vision distress detection |
| `app/api/incidents/route.ts` | Create incidents |
| `lib/supabase.ts` | Browser Supabase client |
| `supabase/migrations/001_initial_schema.sql` | DB schema |

### Env Vars (.env.local)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for incidents API)
- `OPENAI_API_KEY`

---

## Full Functionality Build Prompt

Use this as a detailed prompt to implement the complete SafePool product experience:

---

### 1. Live Video Streaming from Any Camera

**Goal**: Support real-time video from any source—RTSP, WebRTC, browser getUserMedia, IP camera URLs, or file upload.

**Requirements**:
- Accept RTSP URLs, WebRTC streams, or browser camera (getUserMedia)
- Display multiple live feeds in a responsive grid
- Handle reconnection, buffering, and stream health indicators
- Support both above-water and underwater camera views
- Fallback to file upload for demo/testing when no live source available

**Technical notes**: Consider HLS.js for RTSP→HLS, or WebRTC for low-latency. Browser camera uses `navigator.mediaDevices.getUserMedia()`.

---

### 2. AI-Powered Drowning Detection (Extended Logic)

**Goal**: AI continuously watches the video and detects potential drowning based on behavioral rules and pose/motion analysis.

**Requirements**:
- **Underwater duration rule**: Flag alert if a person stays fully submerged for more than X seconds (configurable, e.g. 5–10 seconds)
- **Distress signals**: Vertical posture, lack of arm movement, struggling, inability to keep head above water
- **Configurable thresholds**: Per-facility sensitivity (low/medium/high), underwater-time threshold in settings
- **Frame sampling**: Throttle analysis to 1–2 FPS to manage OpenAI cost; increase for high-sensitivity mode
- Use OpenAI Vision (or future fine-tuned model) with structured prompts focused on pose/motion only (privacy by design)

---

### 3. Camera Management & Multi-View

**Goal**: Users can add, remove, and manage multiple camera views. Each camera streams live and is analyzed independently.

**Requirements**:
- **Add camera**: Modal/form to add new camera—name, stream URL (RTSP/WebRTC/HTTP), or “Use browser camera”
- **Camera grid**: 1–4+ cameras in a responsive grid (1x1, 2x1, 2x2, etc.)
- **Per-camera controls**: Mute audio, pause analysis, fullscreen
- **Connection status**: Green/yellow/red indicator per camera
- **Reorder/resize**: Drag to reorder, optional layout presets

---

### 4. Right Sidebar — Alerts & Activity

**Goal**: Dedicated right sidebar showing all alerts in real time, with clear hierarchy and actions.

**Requirements**:
- **Alert list**: Chronological list of all alerts (distress detected, underwater too long, etc.)
- **Alert card**: Timestamp, camera name, severity, brief AI description, thumbnail
- **Actions**: Dismiss, Mark resolved, View full clip
- **Filters**: By camera, by severity, by time range
- **Sound**: Configurable alert sound when new alert appears (with mute toggle)
- **Badge count**: Unread/resolved count in sidebar header
- **Real-time updates**: Use Supabase Realtime or polling for live alert stream

---

### 5. Left Sidebar — Connections & Navigation

**Goal**: Left sidebar for navigation, camera connections, and system status.

**Requirements**:
- **Nav tabs**: Overview, Live, Incidents, Settings
- **Connections section**: List of connected cameras with status (live, reconnecting, offline)
- **Add camera** button
- **Facility switcher** (if multi-facility)
- **Quick stats**: Active cameras, alerts today, last incident
- **Sign out**

---

### 6. Sound Alerts

**Goal**: Audible feedback when a new alert is generated.

**Requirements**:
- Play a distinct sound when `distress: true` from AI or underwater-duration rule triggers
- Volume control in settings
- Mute toggle (per-session or persisted)
- Cooldown between repeated alerts (e.g. 15–30 seconds) to avoid spam
- Option for different sounds per severity (high vs medium)

---

### 7. Super-Modern UI Overhaul

**Goal**: Transform the UI into a highly polished, modern dashboard that feels premium and trustworthy.

**Requirements**:
- **Design system**: Refined typography (e.g. Geist, Satoshi, or similar), consistent spacing, subtle shadows
- **Dark mode option**: Professional dark theme for 24/7 monitoring environments
- **Glassmorphism / depth**: Subtle blur, layered cards, soft gradients where appropriate
- **Micro-interactions**: Smooth transitions, hover states, loading skeletons, toast notifications
- **Dashboard feel**: Command-center aesthetic—data-dense but clean, similar to security/ops dashboards
- **Accessibility**: WCAG contrast, keyboard nav, reduced-motion support
- **Responsive**: Works on tablet and desktop; mobile as secondary view

**Inspiration**: Vercel dashboard, Linear, Raycast, modern security NOC UIs. Avoid generic “AI slop” (purple gradients, Inter, predictable layouts).

---

### 8. Data Flow & Architecture

```
[Camera 1] [Camera 2] [Camera 3] ...
     │          │          │
     └──────────┴──────────┴──► Frame capture (Canvas, throttled)
                                    │
                                    ▼
                         POST /api/analyze-frame
                                    │
                                    ▼
                         OpenAI Vision / Rule engine
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              { distress }                    Underwater timer
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                         Alert created → Supabase
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Right sidebar    Sound alert    Incident record
```

---

### 9. Supabase Schema (Existing)

Tables: `facilities`, `cameras`, `incidents`, `alert_settings`, `demo_requests`.  
See `supabase/migrations/001_initial_schema.sql`.

Consider adding:
- `alerts` table for real-time alert stream (or extend `incidents`)
- `underwater_threshold_seconds` in `alert_settings`

---

### 10. Implementation Order Suggestion

1. **Left sidebar** — Connections + nav restructure  
2. **Right sidebar** — Alerts list + sound  
3. **Camera management** — Add/remove cameras, multi-view grid  
4. **Live streaming** — RTSP/WebRTC/browser camera integration  
5. **Underwater timer** — Rule: person submerged > X seconds → alert  
6. **UI overhaul** — Modern design system, dark mode, polish  

---

## Quick Reference

- **Live app**: https://safepool.vercel.app  
- **Repo**: (GitHub linked via Vercel)  
- **Supabase**: https://supabase.com/dashboard/project/lxwepiocbsrbrwaboimv  
- **Values**: Lifeguards first, accuracy over hype, privacy by design
