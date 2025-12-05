# Friend Map Spec

## Overview
A single-page web app where users add friends and describe how they met. The app renders a visual canvas showing all connections. Data exports as Obsidian JSON Canvas format.

---

## Tech Stack
- Single `index.html` file
- Vanilla JS (no build step)
- Tailwind CSS via CDN
- LocalStorage for persistence

---

## Data Model

```js
// Stored in localStorage as "friendMapData"
{
  people: ["Tom", "Angie", "Mike"],  // unique names
  connections: [
    { from: "Tom", to: "Angie", how: "college roommates" },
    { from: "Angie", to: "Mike", how: "work" }
  ]
}
```

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Friend Map                    [Export] │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ Name 1:  [________]             │    │
│  │ met                             │    │
│  │ Name 2:  [________]             │    │
│  │ by:      [________________]     │    │
│  │              [Add Connection]   │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────┐                              │
│    │ Tom │──"college"──▶┌───────┐       │
│    └─────┘              │ Angie │       │
│                         └───────┘       │
│                             │           │
│                          "work"         │
│                             ▼           │
│                         ┌──────┐        │
│                         │ Mike │        │
│                         └──────┘        │
│                                         │
│  (Canvas area - simple force layout)    │
└─────────────────────────────────────────┘
```

---

## Core Features

### 1. Add Connection Form
- Two text inputs for names (autocomplete from existing people)
- One text input for "how they met"
- Submit button adds to data, re-renders canvas
- Names are case-normalized (capitalize first letter)

### 2. Canvas Rendering
- Use a `<canvas>` element or simple SVG
- Each person = a rounded rectangle node
- Each connection = a line with label text at midpoint
- Simple force-directed layout OR circular layout (agent's choice for simplicity)
- Nodes are draggable (nice-to-have, not required)

### 3. Export to Obsidian JSON Canvas
- Button generates `.canvas` JSON file
- Downloads as `friend-map.canvas`

**Obsidian Canvas Format:**
```json
{
  "nodes": [
    { "id": "node-1", "type": "text", "text": "Tom", "x": 0, "y": 0, "width": 150, "height": 60 },
    { "id": "node-2", "type": "text", "text": "Angie", "x": 200, "y": 0, "width": 150, "height": 60 }
  ],
  "edges": [
    { "id": "edge-1", "fromNode": "node-1", "toNode": "node-2", "label": "college roommates" }
  ]
}
```

### 4. Persistence
- Save to `localStorage` on every change
- Load from `localStorage` on page load

---

## Implementation Notes

**Keep it simple:**
- No frameworks, no npm
- All code in one HTML file (inline `<script>` and `<style>` okay)
- Tailwind via `<script src="https://cdn.tailwindcss.com">`

**Canvas rendering approach (pick one):**
- Option A: SVG with simple grid positioning (easiest)
- Option B: HTML/CSS absolute positioned divs with SVG lines
- Option C: Canvas 2D API

**Layout algorithm (simple):**
- Circular: place nodes in a circle, draw edges between
- Or grid: place nodes in rows, let it flow

**Styling with Tailwind:**
- Clean, modern look
- Card-style form section
- Subtle shadows, rounded corners
- Responsive (stacks on mobile)

---

## File Structure
```
index.html   ← everything lives here
```

---

## Acceptance Criteria
1. User can add two names and how they met
2. New people appear as nodes on the canvas
3. Connections show as labeled lines between nodes
4. Data persists on page refresh
5. Export button downloads valid Obsidian `.canvas` JSON
6. Looks clean with Tailwind styling

---

## Stretch Goals (optional)
- Delete connections
- Edit existing connections  
- Drag nodes to reposition
- Color-code connection types
- Import existing `.canvas` file
