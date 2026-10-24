# Scroll-Based Reading Progress Bar Implementation Plan

Add a real-time scroll progress indicator to the `ChapterReader` component to enhance the reading experience and provide visual feedback on chapter completion.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following preferences:
- **Location**: Fixed at the very top of the viewport, positioned immediately below the global navbar.
- **Visual Aesthetic**: A minimalist, sleek neon cyan line (`#00f0ff`) that expands horizontally as the user scrolls.
- **Progress Indicator**: A quiet, monospaced text indicator displaying the percentage (e.g., "64% READ").

## 1. Overview & Core Concept

- **What It Does**: Tracks the user's scroll position within the `ChapterReader` view and renders a persistent progress bar at the top of the screen.
- **Target Audience**: Readers of the 12-chapter satirical autobiography who want to gauge their progress within a chapter.
- **Key Value**: Provides immediate visual feedback on reading progress, encouraging engagement and completion.

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Scroll Tracking**: As the user scrolls down the page, the cyan bar grows from 0% to 100%.
  2. **Chapter Switching**: When a user changes chapters, the progress bar resets to 0% and begins tracking the new content.
  3. **Visual Feedback**: A small, subtle text indicator (e.g., `64% READ`) is placed near the bar (e.g., right-aligned or following the bar's edge).
- **Visual Identity & Theme**:
  - *Color*: Neon Cyan (`#00f0ff`) with a subtle outer glow (`shadow-cyan-500/50`).
  - *Typography*: Monospaced font (`Space Mono` or `JetBrains Mono`) for the percentage readout to match the "telemetry" aesthetic.
- **Interactive Feedback**: Smooth width transitions using Tailwind's `transition-all` or Framer Motion for a fluid feel.

## 3. Technical Architecture & Data Strategy

### Component Logic
- **State**: `scrollProgress` (number, 0-100).
- **Scroll Handler**: A `window` scroll event listener that calculates progress based on `window.scrollY`, `document.documentElement.scrollHeight`, and `window.innerHeight`.
- **Reset Logic**: `useEffect` hook triggered by `selectedChapterNum` to reset or recalculate scroll position on chapter change.

### DOM Structure
```
┌────────────────────────────────────────────────────────┐
│ Navbar (Existing)                                      │
├────────────────────────────────────────────────────────┤
│ Progress Bar Container (Fixed, top-[header-height])     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Progress Line (width: scrollProgress%)           │  │
│  └──────────────────────────────────────────────────┘  │
│  Percentage Text (e.g., "64% READ")                   │
└────────────────────────────────────────────────────────┘
```

## 4. Key Product Decisions & Trade-Offs

- **Decision: Fixed vs. Relative Positioning**
  - *Chosen Approach*: Fixed at the top of the viewport.
  - *Why*: Ensures the progress bar is always visible regardless of how far the user has scrolled into long chapters.
- **Decision: Throttled Scroll Listener**
  - *Chosen Approach*: Using a standard `requestAnimationFrame` or simple event listener.
  - *Why*: Ensures smooth updates without taxing the CPU during fast scrolling.
