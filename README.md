# Fwiends

**An oral history of The Pod by Tommy Tables** — live at
[fwiends.superfun.games](https://fwiends.superfun.games/).

A spreadsheet-backed, iOS-flavored web app for the pod's shared history — every
moment of how the friends met, moved, worked, and fell in love, on one smooth
timeline.

No build step, no dependencies: `index.html` + `styles.css` + `app.js` + `data.js`.
Open `index.html` (or serve the folder) and it runs.

## Views

- **Timeline** — moments grouped by year, with sticky year headers, a year
  jumper, search, and type filter chips. Tap a card for the full story. The
  rail runs **vertical or horizontal** — toggle it from the header (the
  choice is remembered); horizontal mode is a snap-scrolling carousel with
  inline year markers.
- **Gantt** — everyone's individual timeline stacked as rows against one
  horizontal time axis, project-tracker style: a span bar from each person's
  first to last moment, with type-colored dots for every moment along the
  way. Names stay pinned while the years scroll; tap a dot for the moment,
  a name for the person.
- **People** — everyone who appears in the story (as the main person *or* a
  related person), with their span of years and kinds of moments. Tap through
  to their personal timeline.
- **Places** — every location, ranked by how much happened there.
- **Insights** — moments per year, kinds of moments, Pod vs. Self, and the
  most-mentioned people.

Filters (person, place, kind, year, Pod/Self) combine everywhere, and every
tag — people tags, location tags, type badges — is tappable.

## The spreadsheet is the database

The app boots with sample data transcribed from a photo of the Pod Timeline
sheet, but it is designed to build itself entirely from one Google Sheet with
these columns:

| Year | Exact Date | Person | Event Type | Location | Type | Related People | Notes |
|------|-----------|--------|------------|----------|------|----------------|-------|
| 2012 ? | 07/22/2012 | Melissa Torrey | Romance | Salt Lake City, UT | Pod | Brandon Strong | OFFICIAL TOGETHER… |

To connect it: open **⚙︎ Settings** in the app, paste the sheet link, and hit
**Sync from sheet**. The link must be readable without signing in — either:

- **Share → Anyone with the link (Viewer)**, then paste the normal sheet URL, or
- **File → Share → Publish to web → CSV**, then paste the published URL.

The URL is remembered locally and re-synced on every launch. Notes:

- `Year` may include `?` for approximate years — shown as `~2012`.
- `Exact Date` accepts `MM/DD/YYYY`, a month name, or free text
  ("A few months after moving").
- `Type` is `Pod` (shared moments) or `Self` (one person's milestone).
- `Related People` splits on commas and slashes.
- Extra columns are ignored, so the sheet can keep evolving.

## Design notes

- SF Pro Display via CDN with the system font stack as fallback; large-title
  navigation, frosted-glass bars, bottom tab bar, spring animations, and the
  View Transitions API for tab changes (with graceful fallback).
- Ephemeral motion: cards drift in when they enter the viewport and dissolve
  as they leave (both scroll directions), headers cascade on view entry, and
  sheet content staggers in behind the sheet's slide.
- Light and dark mode follow the system.
- The seven event-type colors are a CVD-validated categorical palette (order:
  Core, Meeting, Move, Romance, Friendship, Relationship, Work), separately
  stepped for light and dark surfaces; charts always pair color with direct
  labels.
- Respects `prefers-reduced-motion`.
