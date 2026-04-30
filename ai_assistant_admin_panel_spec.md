# AI Assistant Admin Panel — Clickable Mockup Spec

## Purpose

Build a **fully clickable, dark-mode frontend mockup** of an internal admin panel for managing AI assistants used by a content editorial team. This is not a production app — it is a **realistic prototype** with hardcoded dummy data, designed so that engineers and stakeholders can see, click through, and understand exactly what needs to be built.

No backend is required. All data is mocked/hardcoded. Every screen should be navigable.

---

## Tech Stack

- **React** (single-page app, with client-side routing via React Router)
- **Tailwind CSS** for layout and utility classes
- **Recharts** for all charts and data visualizations
- **Lucide React** for icons
- Dark mode only — `background: #0a0a0f`, accent color: `#6366f1` (indigo), with a secondary accent of `#22d3ee` (cyan) for highlights
- Typography: Use **JetBrains Mono** for code/prompts, **Syne** for headings, **Inter** for body — load from Google Fonts
- Subtle grain texture overlay on backgrounds for depth

---

## Global Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR: Logo | "AI Ops" | Environment badge | User avatar │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │            MAIN CONTENT AREA                │
│              │                                              │
│  Assistant   │                                              │
│  Selector    │                                              │
│              │                                              │
│  Nav Links   │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### Top Bar
- Left: "AI Ops" wordmark in Syne bold
- Center: currently selected assistant name + a small colored status dot (green = healthy, yellow = degraded)
- Right: environment badge (always shows **"Admin / Staging"** in amber), user avatar initials

### Sidebar (persistent, ~220px wide)
- **Assistant Selector** at the top — a styled dropdown or list of ~10 assistants. Selecting one reloads all screens with that assistant's data.
- Mock assistants list:
  - `Grammar & Style` ← default selected
  - `Factual Accuracy`
  - `Punctuation`
  - `Bilingual Review`
  - `Socioemotional Tone`
  - `STEAM Content`
  - `Curriculum Alignment`
  - `Readability Score`
  - `Citation Checker`
  - `Vocabulary Level`
- Below the selector, navigation links to all screens (icons + labels):
  - Overview
  - Eval Dashboard
  - Eval Builder
  - A/B Tests
  - Prompt Editor
  - Pipeline Builder
  - CMS Metrics
  - Trace Viewer
  - Run History

---

## Screens

---

### 1. Overview

**Route:** `/overview`  
**Purpose:** High-level health and status of the selected assistant.

**Layout:**

- **Top row — 4 stat cards:**
  - Latest Eval Score: `87.3 F1`
  - CMS Acceptance Rate (last 30d): `91.2%`
  - Avg Latency (live): `3.4s`
  - Token Usage (last 30d): `1.2M tokens`

- **Middle section — Assistant Graph (static visual):**
  - A node graph showing the orchestrator at the top, with arrows pointing to child agent nodes below
  - For `Grammar & Style`, show these nodes:
    - `Orchestrator` (top center)
    - `Grammar Agent` | `Style Agent` | `Redundancy Detector` | `Clarity Agent`
  - Each node is a rounded card with: node name, a small colored tag (e.g. "LLM" or "Tool"), and a one-line description
  - Clicking a node opens a **side drawer** showing that node's current prompt (read-only, displayed in JetBrains Mono in a dark code block). Include a button "Edit in Prompt Editor →" that navigates to the Prompt Editor screen filtered to that node.
  - Static — no drag/drop on this screen

- **Bottom section — two columns:**
  - Left: **Problem Score Breakdown** — horizontal bar chart showing F1 score per problem type. Mock problems for Grammar & Style:
    - Subject-Verb Agreement: 92
    - Comma Usage: 88
    - Sentence Clarity: 84
    - Redundancy: 79
    - Passive Voice: 71
  - Right: **Recent Run History** — a small table (last 5 runs) with: date, run type (Eval / Quick Eval / CMS), score, status badge

---

### 2. Eval Dashboard

**Route:** `/eval`  
**Purpose:** Track evaluation performance over time, per problem type, per run.

**Layout:**

- **Top controls bar:** date range picker (mock: last 30 days selected) | Run Type filter (All / Eval / Quick Eval) | "Run New Eval →" button (links to Eval Builder)

- **Score Trend Chart** (full width, line chart):
  - X axis: dates (last 8 eval runs, roughly weekly)
  - Y axis: F1 score (0–100)
  - One line per problem type, with a legend
  - Mock data should show realistic variation (some improving, some flat, one regressing slightly)

- **Problem Breakdown Table** (below chart):
  - Columns: Problem | Latest F1 | Previous F1 | Delta (with colored up/down arrow) | # Rows Evaluated | Last Run Date
  - Show 5–6 rows of mock data
  - Clicking a row expands to show the last 3 run scores for that problem inline

- **Run History Table** (below problem table):
  - Columns: Run ID | Date | Type | Dataset Version | Total Rows | Avg F1 | Status | Actions
  - Actions: "View Results" (links to Eval Builder with that run loaded) | "View Traces"
  - Show 8 mock rows with varied dates and scores

---

### 3. Eval Builder

**Route:** `/eval-builder`  
**Purpose:** Manage the golden dataset and run evaluations. See dataset rows with human answer, AI answer, and LLM judge score side by side.

**Layout:**

- **Top bar:**
  - Dataset name: `Grammar & Style — Golden Dataset v3` with an edit icon
  - Stats: `142 rows` | `Last updated: Apr 22, 2026` | `Last run: Apr 28, 2026`
  - Buttons: `+ Add Rows` (opens modal to paste CSV/JSON or upload file) | `Run Eval ▶` (primary CTA, indigo button)

- **Filters bar:** Filter by Problem Type (multi-select) | Filter by LLM Judge Result (Correct / Incorrect / All) | Search box

- **Dataset Table** (main content, scrollable):
  - Columns:
    - `#` row number
    - `Problem Type` (colored tag)
    - `Input Text` (truncated, expandable on click)
    - `Expected Output` (SME/human answer, truncated)
    - `AI Output` (last run, truncated)
    - `LLM Judge` (Correct ✓ in green / Incorrect ✗ in red / Not run yet in gray)
    - `Score` (0.0–1.0 or N/A)
    - `Actions` (Edit row | Delete row)
  - Clicking any row expands it inline to show full text for all three content columns (Input, Expected, AI Output) in a readable side-by-side diff-like layout
  - Mock: 10 visible rows across 3 problem types, mix of correct/incorrect results

- **Run Eval Modal** (triggered by "Run Eval ▶" button):
  - Shows: Dataset name, row count, estimated cost (mock: "$0.84"), estimated time (mock: "~3 min")
  - Option: "Full Dataset" or "Custom range (rows X to Y)"
  - Confirm button: "Start Eval Run"
  - After clicking, show a toast notification: "Eval run started — you'll be notified when complete"

---

### 4. A/B Test Manager

**Route:** `/ab-tests`  
**Purpose:** Create and manage prompt/architecture variants, run them against the golden dataset, compare results, and export a winner.

**Layout:**

- **Top bar:** `+ New A/B Test` button | filter by Status (Active / Completed / Draft)

- **Test List** (left panel, ~35% width):
  - Each test is a card showing: test name, created date, # variants, status badge, latest scores summary
  - Mock tests:
    - `Clarity Agent Prompt v2 Test` — Active, 3 variants
    - `Redundancy Detector Rewrite` — Completed, 2 variants
    - `Add Formality Agent` — Draft, 2 variants
  - Clicking a test loads its detail in the right panel

- **Test Detail** (right panel, ~65% width):
  - Test name (editable) + status badge
  - **Variants tabs:** `A (Production)` | `B` | `C` (add variant button `+`)
    - Variant A is always labeled "(Production baseline)" and is read-only
    - Each variant tab shows:
      - Which nodes were modified (tags)
      - Prompt diff vs. variant A (show a simple line-by-line diff with red/green highlights, JetBrains Mono)
      - Eval scores for this variant (bar chart, per problem type)
  - **Comparison Chart** (below tabs): grouped bar chart comparing all variants side by side, per problem type
  - **Winner Selection** (only visible when test status is Completed or has run results):
    - Shows: "Variant B outperforms A on 4/5 problems (+6.2 F1 avg)"
    - Button: `Export Variant B as Production Bundle` — triggers a mock download modal:
      - "This will package all prompt files and config for Variant B into a .zip for engineer review and manual production migration."
      - Confirm: `Download Bundle` | Cancel

- **New A/B Test Modal** (triggered by `+ New A/B Test`):
  - Step 1: Name the test | Select base assistant (pre-filled with current)
  - Step 2: "What are you changing?" — radio: Prompt only / Add or remove a node / Both
  - Step 3: Configure Variant B (edit prompt or select nodes to add/remove)
  - Step 4: Confirm & create

---

### 5. Prompt Editor

**Route:** `/prompt-editor`  
**Purpose:** View and edit prompts per agent node. All edits are staging-only. Full version history with diff.

**Layout:**

- **Left panel — Node List** (~25% width):
  - List of all nodes for the selected assistant
  - Each item: node name + last edited date
  - Clicking selects it and loads its prompt on the right
  - Mock nodes for Grammar & Style: Orchestrator | Grammar Agent | Style Agent | Redundancy Detector | Clarity Agent

- **Right panel — Prompt Editor** (~75% width):
  - **Header:** Node name | Last edited: `Apr 24, 2026 by Maria L.` | Status badge: `Staging`
  - **Version selector:** dropdown showing version history (e.g. `v7 (current)`, `v6`, `v5`...) with dates and author initials
  - **"View Diff" toggle:** when on, shows a side-by-side or unified diff between selected version and previous (red/green line highlights, JetBrains Mono)
  - **Prompt textarea:** large, dark code-editor-style textarea in JetBrains Mono. Editable. Character count shown bottom right.
  - **Bottom action bar:**
    - `Save as new version` (primary button)
    - `Discard changes`
    - `Copy prompt`
  - **Version History sidebar** (collapsible, slides in from right):
    - List of versions with: version number, date, author, short change note
    - Click any version to load it in the editor (read-only unless it's current)

> **Note:** There is no "push to production" button here. Changes stay in staging. Production migration happens only via the A/B Test export flow.

---

### 6. Pipeline Builder

**Route:** `/pipeline-builder`  
**Purpose:** Visually wire together agent nodes into a pipeline. Generates a config bundle for engineer review. This is ambitious — show the vision.

**Layout:**

- **Top bar:**
  - Toggle: `Viewing Production Pipeline` (read-only) | `Edit in Staging` (button that creates a staging copy)
  - When in staging edit mode: `Generate Config Bundle` button (exports a zip) | `Discard Changes`

- **Canvas area** (main, ~75% of screen):
  - A visual DAG (directed acyclic graph) of agent nodes with connecting arrows
  - Each node is a draggable card (in staging edit mode) with: node name, type tag (LLM / Tool / Router), brief description
  - Connections are drawn as curved arrows between nodes
  - In staging edit mode:
    - Nodes are draggable to reorder
    - Each node has an `×` to remove it
    - A `+ Add Node` button opens a panel to add a new node (name, type, description, initial prompt)
    - Connections can be drawn by dragging from one node's output handle to another node's input handle
  - In production view mode: everything is static, no interactions

- **Right panel — Node Inspector** (~25% width):
  - When a node is selected: shows node name, type, description, and prompt preview (truncated, with "Edit in Prompt Editor →" link)
  - When nothing selected: shows pipeline metadata (created, last modified, version)

- **Generate Config Bundle Modal:**
  - "This will generate a LangGraph-compatible config file and boilerplate representing your staging pipeline. An engineer must review and apply this to production."
  - Download button: `Download Pipeline Bundle (.zip)`

---

### 7. CMS Metrics

**Route:** `/cms-metrics`  
**Purpose:** Live acceptance/rejection rates from the CMS, filterable by assistant, chapter, and user.

**Layout:**

- **Filters bar:** Date range | Group by (Assistant / Chapter / User) | Chapter multi-select | User multi-select

- **Top KPI row — 4 cards:**
  - Total Suggestions (last 30d): `4,821`
  - Accepted: `4,391 (91.1%)`
  - Rejected: `430 (8.9%)`
  - Unique Users: `34`

- **Acceptance Rate Over Time** (line chart, full width):
  - X: dates (daily, last 30 days)
  - Y: acceptance rate %
  - One line for overall, option to toggle individual problem type lines

- **Breakdown Table** (below chart):
  - When grouped by Problem (default):
    - Columns: Problem Type | Total Suggestions | Accepted | Rejected | Acceptance Rate | Trend (sparkline)
  - When grouped by Chapter:
    - Columns: Chapter Name | Subject | Total Suggestions | Acceptance Rate | Top Rejection Reason
  - When grouped by User:
    - Columns: User | Role | Total Suggestions Received | Acceptance Rate | Avg Response Time
  - Show 6–8 mock rows per grouping

- **Rejection Reasons Panel** (bottom, collapsible):
  - Bar chart of most common rejection reasons (mock: "Changed wording", "Factually incorrect", "Tone wrong", "Kept original", "Partial accept")
  - These would come from future comment data from users

---

### 8. Trace Viewer

**Route:** `/traces`  
**Purpose:** A non-technical-friendly version of Arize traces — see exactly what happened in a given run, step by step.

**Layout:**

- **Top bar:**
  - Source toggle: `CMS (Live)` | `Eval Runs`
  - Filters: Date range | Assistant (pre-filled) | Status (All / Success / Error) | Search by Trace ID

- **Trace List** (left panel, ~35%):
  - Each row: Trace ID (truncated) | Date | Source (CMS/Eval) | Duration | Status badge | Total tokens
  - Clicking loads trace detail on the right
  - Mock: 10 traces, mix of CMS and eval, varied durations (1.2s–6.8s)

- **Trace Detail** (right panel, ~65%):
  - **Header:** Trace ID | Date | Total duration | Total tokens | Status
  - **Timeline / Waterfall view:**
    - A horizontal waterfall chart showing each agent node as a bar:
      - Node name on the left
      - Bar width represents duration
      - Color: green (success), red (error), yellow (warning)
    - Clicking a bar expands it below to show:
      - Input to that node (collapsible, JetBrains Mono)
      - Output from that node (collapsible, JetBrains Mono)
      - Token count for that step
      - Any errors or warnings
  - **Input / Output summary** (below waterfall):
    - Original input text (the content chunk from CMS or eval row)
    - Final output text
    - Side-by-side diff highlighting what the assistant changed

---

### 9. Run History

**Route:** `/run-history`  
**Purpose:** Complete log of all assistant runs — evals, quick evals, and CMS activity.

**Layout:**

- **Filters bar:**
  - Assistant (pre-filled with current) | Run Type (All / Eval / Quick Eval / CMS Live) | Date range | Status | Search

- **Run History Table** (full width, paginated):
  - Columns: Run ID | Date & Time | Type (colored badge) | Dataset / Input | Rows / Chunks | Avg F1 (for evals) | Avg Latency | Total Tokens | Status | Actions
  - Actions per row: `View Results` | `View Trace` | `Re-run`
  - Clicking a row expands inline to show: top-level summary, per-problem breakdown (for evals), quick link to trace
  - Paginated: 20 rows per page, show pagination controls
  - Mock: 25 rows across all run types and dates

- **Summary Stats bar** (above table):
  - Total runs shown: `47` | Eval runs: `12` | CMS runs: `35` | Avg F1 (evals): `85.6`

---

## Dummy Data Guidelines

Use realistic, education-domain dummy data throughout:

- **Chapter names:** "Chapter 3: The Water Cycle", "Unit 5: Fractions", "Chapter 8: Ancient Rome"
- **Users:** Maria L., Carlos M., Priya S., João R., Ana T.
- **Problem types:** Subject-Verb Agreement, Comma Usage, Sentence Clarity, Redundancy, Passive Voice, Factual Accuracy, Register/Tone
- **Scores:** Vary realistically between 70–95 F1, with one or two outliers
- **Dates:** All within the last 60 days from today
- **Input text samples:** Short Portuguese or English editorial content snippets (e.g., "Os alunos foi ao parque ontem." or "The students was at the park yesterday.")

---

## Interaction Requirements

- All sidebar nav links must navigate to their respective screen
- Assistant selector must switch context (update assistant name in top bar, reload all mock data for that assistant)
- All buttons that open modals must open a real modal (with overlay + close button)
- All expandable rows must expand/collapse on click
- Charts must render with real chart library (Recharts) — no static images
- Diff views must show actual line-by-line colored diffs
- The node graph on Overview must render as an actual SVG or canvas element — no static images
- Drawers/side panels must slide in/out with a smooth animation
- All tables must be sortable by clicking column headers (client-side sort on mock data)

---

## Design Notes

- Dark background: `#0a0a0f`
- Card background: `#13131a`
- Border color: `#1e1e2e`
- Primary accent: `#6366f1` (indigo)
- Secondary accent: `#22d3ee` (cyan) — use for highlights, active states, sparklines
- Success: `#22c55e` | Warning: `#f59e0b` | Error: `#ef4444`
- Subtle grain texture on main background (CSS noise or SVG filter)
- Smooth page transitions between routes
- Consistent 8px border radius on cards
- Generous padding — this is a desktop app, not mobile
- Status badges should be pill-shaped with soft background tint (e.g. green text on dark green bg)
- Every empty state should have an icon + helpful message + CTA (no blank screens)

---

## Out of Scope for This Mockup

- Real API calls (everything is hardcoded)
- Authentication / login screen
- Real file uploads (mock the interaction only)
- Mobile responsiveness
- Real git integration
- Real Arize API connection

---

## Deliverable

A single runnable React app (`npm start` or `npm run dev`) with all screens navigable via the sidebar. No login required — app opens directly to the Overview screen with `Grammar & Style` pre-selected.
