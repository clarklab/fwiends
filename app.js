/* ============================================================
   Pod Timeline — app
   A spreadsheet-backed, iOS-flavored timeline of how the pod met.
   ============================================================ */
(() => {
'use strict';

/* ── DOM helpers ───────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ── icons (24px stroke set) ───────────────────────────────── */
const ICONS = {
  clock:    '<circle cx="12" cy="12" r="9.25"/><polyline points="12 7 12 12 15.5 14"/>',
  users:    '<path d="M16.5 21v-2a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M21.5 21v-2a4 4 0 0 0-3-3.87"/><path d="M15.5 3.13a4 4 0 0 1 0 7.75"/>',
  pin:      '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  chart:    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  sliders:  '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  x:        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  refresh:  '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  chevron:  '<polyline points="9 18 15 12 9 6"/>',
  chevleft: '<polyline points="15 18 9 12 15 6"/>',
  chevdown: '<polyline points="6 9 12 15 18 9"/>',
  check:    '<polyline points="20 6 9 17 4 12"/>',
  expand:   '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  play:     '<polygon points="7 4 20 12 7 20 7 4"/>',
  pause:    '<line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/>',
  arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  heart:    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  star:     '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  userplus: '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><line x1="19.5" y1="8" x2="19.5" y2="14"/><line x1="22.5" y1="11" x2="16.5" y2="11"/>',
  case:     '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  box:      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  link:     '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  spark:    '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/>',
  table:    '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>',
  rows:     '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  gantt:    '<line x1="3" y1="6" x2="12" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="5" y1="18" x2="15" y2="18"/>',
  branch:   '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  columns:  '<line x1="6" y1="4" x2="6" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/>',
  camera:   '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  map:      '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  dot:      '<circle cx="12" cy="12" r="4"/>',
};
const icon = (n, cls = '') =>
  `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.dot}</svg>`;

/* ── event types (fixed, validated categorical order) ──────── */
const TYPE_ORDER = ['Core', 'Meeting', 'Move', 'Romance', 'Friendship', 'Relationship', 'Work', 'Moment'];
const TYPE_ICON  = { Core: 'star', Meeting: 'userplus', Move: 'box', Romance: 'heart',
                     Friendship: 'users', Relationship: 'link', Work: 'case', Moment: 'spark' };
const typeVar  = t => `var(--c-${(t || 'Moment').toLowerCase()})`;
const typeIcon = t => icon(TYPE_ICON[t] || 'spark');
const normType = raw => {
  const t = String(raw || '').trim();
  if (!t) return 'Moment';
  const hit = TYPE_ORDER.find(k => k.toLowerCase() === t.toLowerCase());
  return hit || (t[0].toUpperCase() + t.slice(1).toLowerCase());
};

/* ── people colors (identity accents; names always shown) ──── */
const HUES = [211, 27, 340, 262, 152, 190, 51, 3, 288, 100, 232, 170];
const hueOf = name => {
  let h = 0;
  for (const c of String(name)) h = (h * 37 + c.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
};
const initials = name => String(name).split(/\s+/).filter(Boolean)
  .map(w => w[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase();

/* hedcut portraits (stipple on white) living in faces/ — to add one,
   drop in faces/<kebab-case-name>.webp and put the name here */
const HEDCUTS = new Set(['Melissa Torrey', 'Brandon Strong', 'Tom Ivey']);
const hedcut = name =>
  HEDCUTS.has(name) ? `faces/${String(name).toLowerCase().replace(/[^a-z]+/g, '-')}.webp` : null;

const avatar = (name, cls = '') => {
  const hc = hedcut(name);
  if (hc) return `<span class="avatar hed ${cls}"><img src="${hc}" alt="" loading="lazy" decoding="async" draggable="false"></span>`;
  const h = hueOf(name);
  return `<span class="avatar ${cls}" style="background:linear-gradient(135deg, hsl(${h} 72% 58%), hsl(${(h + 24) % 360} 72% 42%))">${esc(initials(name))}</span>`;
};

/* ── photos ────────────────────────────────────────────────── */
/* a photo is a URL string (sheet column) or { src, w, h } (seed) */
function normPhoto(p) {
  if (!p) return null;
  if (typeof p === 'string') {
    const src = p.trim();
    return /^https?:\/\//i.test(src) ? { src, w: 0, h: 0 } : null;
  }
  const src = String(p.src || '').trim();
  return src ? { src, w: +p.w || 0, h: +p.h || 0 } : null;
}
const photoRatio = (ph, fallback = '4 / 3') =>
  ph && ph.w && ph.h ? `${ph.w} / ${ph.h}` : fallback;
const photoAlt = e => {
  const t = e.note || e.person || 'a pod moment';
  return 'Photo — ' + (t.length > 90 ? t.slice(0, 90) + '…' : t);
};
/* card / sheet photo block; the lightbox opens from data-act="photo-view" */
function photoFig(e, cls = '') {
  if (!e.photo) return '';
  const { src, w, h } = e.photo;
  return `<figure class="ev-photo${cls ? ' ' + cls : ''}" data-act="photo-view" data-v="${e.id}"
    role="button" tabindex="0" aria-label="View photo full size" style="--ar:${photoRatio(e.photo)}">
    <img src="${esc(src)}" alt="${esc(photoAlt(e))}" loading="lazy" decoding="async" draggable="false"${w && h ? ` width="${w}" height="${h}"` : ''}>
  </figure>`;
}
/* a broken photo URL should erase the photo, not leave a torn frame
   (error events don't bubble, so listen in capture) */
document.addEventListener('error', ev => {
  const holder = ev.target?.tagName === 'IMG' &&
    ev.target.closest('.ev-photo, .g-thumb, .t-thumb, .mini-thumb, .p-photo, .pv-stage');
  if (holder) holder.classList.add('broken');
}, true);

/* ── dates ─────────────────────────────────────────────────── */
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const MON_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function parseWhen(d, y, approx) {
  const yearLabel = y ? (approx ? '~' + y : String(y)) : 'Undated';
  const out = { m: 0, day: 0, label: yearLabel, exact: false };
  const t = String(d || '').trim();
  if (!t) return out;
  const mdY = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdY) {
    out.m = +mdY[1]; out.day = +mdY[2]; out.exact = true;
    out.label = `${MON_ABBR[out.m - 1]} ${out.day}, ${mdY[3]}`;
    return out;
  }
  const low = t.toLowerCase();
  const mi = MONTHS.findIndex(m => low.includes(m));
  if (mi >= 0) {
    out.m = mi + 1;
    out.label = `${MON_ABBR[mi]}${y ? ' ' + y : ''}${approx ? ' · approx' : ''}`;
    return out;
  }
  out.label = t; // freeform ("A few months after moving")
  return out;
}

/* ── state ─────────────────────────────────────────────────── */
const VIEWS = ['timeline', 'people', 'places', 'insights'];
const VIEW_TITLE = { timeline: 'Fwiends', people: 'People', places: 'Places', insights: 'Insights' };
const LS_KEY = 'podtl.sheet.v1';
const LS_MODE = 'podtl.mode';
const MODES = [['list', 'rows'], ['flow', 'columns'], ['overlap', 'gantt'], ['tree', 'branch'], ['map', 'map']];
const MODE_LABEL = { list: 'Vertical timeline', flow: 'Horizontal timeline', overlap: 'Overlap chart', tree: 'Tree of lifelines', map: 'Map over time' };

const state = {
  view: 'timeline',
  mode: ['list', 'flow', 'overlap', 'tree', 'map'].includes(localStorage.getItem(LS_MODE))
    ? localStorage.getItem(LS_MODE)
    : (localStorage.getItem('podtl.orient') === 'h' ? 'flow' : 'list'),
  compare: new Set(),
  _anim: false,
  q: '',
  types: new Set(),
  people: new Set(),
  places: new Set(),
  scope: '',            // '' | 'Pod' | 'Self'
  years: new Set(),
  events: [],
  src: { kind: 'sample', url: '', at: null },
  scroll: {},
};

function buildEvents(raw) {
  return raw
    .map((r, i) => {
      const type = normType(r.type);
      const rel = (r.rel || []).map(s => String(s).trim()).filter(Boolean);
      const when = parseWhen(r.d, r.y, r.yq);
      return {
        id: 'e' + i, row: i,
        year: r.y ?? null, approx: !!r.yq,
        when, type, scope: String(r.scope || '').trim(),
        person: String(r.person || '').trim(),
        loc: String(r.loc || '').trim(),
        rel, note: String(r.note || '').trim(),
        photo: normPhoto(r.photo),
        // month-less moments sort mid-year, like the Overlap chart plots them
        sort: (r.y ?? 9999) * 10000 + (when.m ? when.m * 100 + when.day : 650),
      };
    })
    .filter(e => e.person || e.note)
    .sort((a, b) => a.sort - b.sort || a.row - b.row);
}

const allPeople = () => {
  const map = new Map();
  for (const e of state.events) {
    for (const [name, w] of [[e.person, 1], ...e.rel.map(r => [r, 1])]) {
      if (!name) continue;
      const p = map.get(name) || { name, count: 0, years: new Set(), places: new Set(), types: new Set() };
      p.count += w;
      if (e.year) p.years.add(e.year);
      if (e.loc) p.places.add(e.loc);
      p.types.add(e.type);
      map.set(name, p);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const allPlaces = () => {
  const map = new Map();
  for (const e of state.events) {
    if (!e.loc) continue;
    const p = map.get(e.loc) || { name: e.loc, count: 0, people: new Set(), years: new Set() };
    p.count++;
    if (e.person) p.people.add(e.person);
    e.rel.forEach(r => p.people.add(r));
    if (e.year) p.years.add(e.year);
    map.set(e.loc, p);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/* first meetings: for every pair of people, the earliest moment they share */
let _meetCache = null, _meetFor = null;
function firstMeets() {
  if (_meetFor === state.events) return _meetCache;
  const seen = new Set(), map = new Map();
  for (const e of state.events) { // events are chronologically sorted
    const ppl = [e.person, ...e.rel].filter(Boolean);
    const pairs = [];
    for (let i = 0; i < ppl.length; i++) {
      for (let j = i + 1; j < ppl.length; j++) {
        const key = [ppl[i], ppl[j]].sort().join('|');
        if (!seen.has(key)) { seen.add(key); pairs.push([ppl[i], ppl[j]]); }
      }
    }
    if (pairs.length) map.set(e.id, pairs);
  }
  _meetFor = state.events; _meetCache = map;
  return map;
}

const yearsRange = () => {
  const ys = state.events.map(e => e.year).filter(Boolean);
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : [null, null];
};

function filtered() {
  const q = state.q.trim().toLowerCase();
  return state.events.filter(e => {
    if (state.types.size && !state.types.has(e.type)) return false;
    if (state.people.size && !(state.people.has(e.person) || e.rel.some(r => state.people.has(r)))) return false;
    if (state.places.size && !state.places.has(e.loc)) return false;
    if (state.scope && e.scope !== state.scope) return false;
    if (state.years.size && !state.years.has(e.year)) return false;
    if (q) {
      const hay = [e.note, e.person, e.rel.join(' '), e.loc, e.type, e.when.label, e.year].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
const filterCount = () =>
  state.types.size + state.people.size + state.places.size + state.years.size + (state.scope ? 1 : 0);

/* ── chips & shared bits ───────────────────────────────────── */
const typeChip = (t, count, on) =>
  `<button class="chip tchip${on ? ' on' : ''}" data-act="ftype" data-v="${esc(t)}" style="--tc:${typeVar(t)}">
     ${typeIcon(t)}<span>${esc(t)}</span>${count != null ? `<b>${count}</b>` : ''}</button>`;

const personChip = (name, { small = false, act = 'person-sheet' } = {}) =>
  `<button class="chip pchip${small ? ' sm' : ''}" data-act="${act}" data-v="${esc(name)}">
     ${avatar(name, 'xs')}<span>${esc(name)}</span></button>`;

const locChip = loc =>
  `<button class="chip lchip" data-act="fplace-go" data-v="${esc(loc)}">${icon('pin')}<span>${esc(loc)}</span></button>`;

const scopePill = s => s ? `<span class="scope ${s.toLowerCase()}">${esc(s)}</span>` : '';

/* ── timeline view ─────────────────────────────────────────── */
function firstsRow(e, cap = 2) {
  const pairs = firstMeets().get(e.id);
  if (!pairs) return '';
  const shown = pairs.slice(0, cap);
  const more = pairs.length - shown.length;
  return `<div class="firsts">
    ${shown.map(([a, b]) => `<span class="fpair">${icon('spark')}${esc(a)} met ${esc(b)}</span>`).join('')}
    ${more > 0 ? `<span class="fpair more">+${more} more ${more === 1 ? 'first' : 'firsts'}</span>` : ''}
  </div>`;
}

function eventCard(e, i) {
  return `
  <article class="card ev${e.photo ? ' has-photo' : ''}" data-act="event-sheet" data-v="${e.id}" style="--tc:${typeVar(e.type)};--i:${i % 8}" tabindex="0">
    <span class="raildot"></span>
    ${photoFig(e)}
    <header class="ev-head">
      <span class="tbadge">${typeIcon(e.type)}<span>${esc(e.type)}</span></span>
      <time>${esc(e.when.label)}</time>
    </header>
    <p class="ev-note">${esc(e.note)}</p>
    ${firstsRow(e)}
    <div class="tags">
      ${e.person ? personChip(e.person) : ''}
      ${e.rel.map(r => personChip(r, { small: true })).join('')}
      ${e.loc ? locChip(e.loc) : ''}
      ${scopePill(e.scope)}
    </div>
  </article>`;
}

function timelineGroupsHTML() {
  const evs = filtered();
  if (!evs.length) {
    return `<div class="empty">
      <div class="empty-ic">${icon('search')}</div>
      <h3>No moments found</h3>
      <p>Try clearing a filter or changing your search.</p>
      ${filterCount() || state.q ? `<button class="btn tint" data-act="clear-filters">Clear everything</button>` : ''}
    </div>`;
  }
  if (state.mode === 'overlap') return overlapPanelHTML(evs);
  if (state.mode === 'tree') return treePanelHTML(evs);
  if (state.mode === 'map') return mapPanelHTML(evs);
  const groups = new Map();
  for (const e of evs) {
    const k = e.year ?? 'Undated';
    (groups.get(k) || groups.set(k, []).get(k)).push(e);
  }
  let i = 0;
  if (state.mode === 'flow') {
    return `<div class="hrail" id="hrail">${[...groups.entries()].map(([year, list]) => `
      <div class="hitem ymark" id="yg-${year}" data-year="${year}">
        <h2>${year}</h2><span>${list.length} ${list.length === 1 ? 'moment' : 'moments'}</span>
      </div>
      ${list.map(e => `<div class="hitem">${eventCard(e, i++)}</div>`).join('')}`).join('')}
    </div>`;
  }
  return [...groups.entries()].map(([year, list]) => `
    <section class="ygroup" id="yg-${year}" data-year="${year}">
      <div class="yhead"><h2>${year}</h2><span>${list.length} ${list.length === 1 ? 'moment' : 'moments'}</span></div>
      <div class="rail">${list.map(e => eventCard(e, i++)).join('')}</div>
    </section>`).join('');
}

/* one-line filter pickers */
function pickerLabels() {
  const y = [...state.years].sort();
  const p = [...state.people];
  const t = [...state.types];
  return {
    year: !y.length ? 'Any year' : y.length === 1 ? String(y[0]) : `${y.length} years`,
    person: !p.length ? 'Anyone' : p.length === 1 ? p[0].split(' ')[0] : `${p.length} people`,
    kind: !t.length ? 'Any kind' : t.length === 1 ? t[0] : `${t.length} kinds`,
  };
}

function pickerRow() {
  const L = pickerLabels();
  // pop-src survives soft re-renders so an open popover keeps its anchor lit
  const btn = (kind, ic, label, on) => `
    <button class="picker${on ? ' on' : ''}${currentPicker === kind && sheetOpen ? ' pop-src' : ''}" data-act="pick" data-k="${kind}">
      ${icon(ic)}<span>${esc(label)}</span>${icon('chevdown', 'pchev')}
    </button>`;
  return `<div class="pickerrow">
    ${btn('year', 'calendar', L.year, state.years.size)}
    ${btn('person', 'users', L.person, state.people.size)}
    ${btn('kind', 'spark', L.kind, state.types.size)}
  </div>`;
}

function timelineHTML() {
  const evs = filtered();
  const [y0, y1] = yearsRange();
  const total = state.events.length;
  const fc = filterCount();

  return `
  <div class="view v-timeline${state._anim ? ' anim' : ''}">
    <div class="lhead">
      <div class="lrow">
        <div class="brand">
          <img class="logo" src="logo.webp" alt="" width="44" height="44">
          <h1>Fwiends</h1>
        </div>
        <div class="hbtns">
          <div class="seg-mini" role="group" aria-label="Timeline layout">
            ${MODES.map(([m, ic]) => `
              <button class="seg-ic${state.mode === m ? ' on' : ''}" data-act="set-mode" data-v="${m}"
                aria-label="${MODE_LABEL[m]}">${icon(ic)}</button>`).join('')}
          </div>
          <button class="hbtn" data-act="pres-open" aria-label="Presentation mode">${icon('expand')}</button>
          <button class="hbtn" data-act="settings-sheet" aria-label="Data source & settings">${icon('gear')}</button>
          <button class="hbtn${fc ? ' badged' : ''}${filterPopOpen ? ' pop-src' : ''}" data-act="filter-sheet" aria-label="More filters" data-badge="${fc || ''}">${icon('sliders')}</button>
        </div>
      </div>
      <p class="tagline">An oral history of The Pod compiled via interviews by Tommy Tables</p>
      <p class="sub">The Pod’s timeline · ${evs.length === total ? total : evs.length + ' of ' + total} moments${y0 ? ` · ${y0}–${y1}` : ''}${state.src.kind === 'sheet' ? ' · synced' : ''}</p>
      <button class="searchwrap faux" data-act="open-search">
        ${icon('search')}<span class="${state.q ? 'qtext' : 'ph'}">${esc(state.q || 'Search moments, people, places')}</span>
        ${state.q ? `<span class="clearq" data-act="clear-q" role="button" tabindex="0" aria-label="Clear search">${icon('x')}</span>` : ''}
      </button>
      ${pickerRow()}
    </div>
    <div id="tl-content" class="tl-content${state.mode === 'flow' ? ' tl-h' : ''}">${timelineGroupsHTML()}</div>
  </div>`;
}

/* ── overlap layout (inside the Timeline view) ─────────────── */
const GX = { PXY: 150, PADL: 20, BARW: 172, BARGAP: 6, LANEH: 42, ROWPAD: 14 };
const gfy = e => e.year + (e.when.m ? (e.when.m - 1) / 12 + (e.when.day ? (e.when.day - 1) / 372 : 0.04) : 0.45);

function lanePack(list, xOf) {
  const laneEnds = [];
  const placed = list.map(e => {
    const xx = Math.round(xOf(e));
    let lane = laneEnds.findIndex(end => xx >= end + GX.BARGAP);
    if (lane < 0) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = xx + GX.BARW;
    return { e, xx, lane };
  });
  return { placed, lanes: laneEnds.length };
}

function gBar({ e, xx, lane }, extra = '') {
  return `
  <button class="g-bar${extra ? ' cmp' : ''}${e.photo ? ' has-photo' : ''}" data-act="event-sheet" data-v="${e.id}"
    aria-label="${esc(e.note.slice(0, 80))}"
    style="left:${xx}px;top:${Math.round(GX.ROWPAD / 2) + lane * GX.LANEH}px;--tc:${typeVar(e.type)};${extra}">
    <b><i></i>${firstMeets().has(e.id) ? icon('spark', 'bspark') : ''}${esc(e.note)}</b>
    <small>${esc(e.when.label)}${e.loc ? ` · ${esc(e.loc.split(',')[0])}` : ''}</small>
    ${e.photo ? `<span class="g-thumb" data-act="photo-view" data-v="${e.id}" role="button" aria-label="View photo full size">
      <img src="${esc(e.photo.src)}" alt="" loading="lazy" decoding="async" draggable="false"></span>` : ''}
  </button>`;
}

function gAxisRow(years, y0, W) {
  return `
  <div class="g-row g-axisrow">
    <div class="g-name g-corner" aria-hidden="true"></div>
    <div class="g-track g-axistrack" style="width:${W}px;--gx:${GX.PADL}px;--gpy:${GX.PXY}px">
      ${years.map(yy => `<span class="g-year" style="left:${GX.PADL + (yy - y0) * GX.PXY}px">${yy}</span>`).join('')}
    </div>
  </div>`;
}

function overlapPanelHTML(evs) {
  const dated = evs.filter(e => e.year);
  const undated = evs.length - dated.length;
  if (!dated.length) {
    return `<div class="empty">
      <div class="empty-ic">${icon('gantt')}</div>
      <h3>Nothing to chart yet</h3>
      <p>Moments need a year to appear on the overlap chart.</p>
    </div>`;
  }

  const ys = dated.map(e => e.year);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = (y1 - y0 + 1) * GX.PXY + GX.PADL + GX.BARW + 26;
  const xOf = e => GX.PADL + (gfy(e) - y0) * GX.PXY;
  const years = [];
  for (let y = y0; y <= y1; y++) years.push(y);

  const rows = allPeople()
    .map(p => ({ p, list: dated.filter(e => e.person === p.name || e.rel.includes(p.name)).sort((a, b) => gfy(a) - gfy(b)) }))
    .filter(r => r.list.length)
    .sort((a, b) => gfy(a.list[0]) - gfy(b.list[0]));

  const sel = rows.filter(r => state.compare.has(r.p.name));
  const comparing = sel.length >= 2;
  const legend = TYPE_ORDER.filter(t => dated.some(e => e.type === t));

  const tray = `
  <div class="cmp-tray">
    <span class="cmp-label">${icon('users')} Compare</span>
    ${rows.map(({ p }) => `
      <button class="chip cchip${state.compare.has(p.name) ? ' on' : ''}" data-act="gcompare" data-v="${esc(p.name)}"
        style="--pc:hsl(${hueOf(p.name)} 65% 48%)">
        ${avatar(p.name, 'xs')}<span>${esc(p.name.split(' ')[0])}</span></button>`).join('')}
    ${state.compare.size ? `<button class="chip clear" data-act="cmp-clear">Clear</button>` : ''}
  </div>
  ${state.compare.size === 1 ? `<p class="cmp-hint">Pick one more person to overlap their timelines</p>` : ''}`;

  let body;
  if (comparing) {
    // each person lane-packs from lane 0 in the SAME space; translucent
    // person-hue bars make shared stretches visibly overlap
    let maxLanes = 1;
    const layers = sel.map(({ p, list }) => {
      const { placed, lanes } = lanePack(list, xOf);
      maxLanes = Math.max(maxLanes, lanes);
      const h = hueOf(p.name);
      return placed.map(b => gBar(b, `--pc:hsl(${h} 68% 48%);--pcs:hsl(${h} 68% 42%)`)).join('');
    }).join('');
    const H = maxLanes * GX.LANEH + GX.ROWPAD + 6;
    body = `
    <div class="g-row g-cmp" style="height:${H}px">
      <div class="g-name g-cmpname">${sel.map(({ p }) => avatar(p.name, 'xs stack')).join('')}<span>Together</span></div>
      <div class="g-track" style="width:${W}px;--gx:${GX.PADL}px;--gpy:${GX.PXY}px">${layers}</div>
    </div>`;
  } else {
    body = rows.map(({ p, list }) => {
      const h = hueOf(p.name);
      const { placed, lanes } = lanePack(list, xOf);
      const rowH = Math.max(lanes * GX.LANEH + GX.ROWPAD, 54);
      const xStart = placed[0].xx;
      const xEnd = Math.max(...placed.map(b => b.xx)) + GX.BARW;
      return `
      <div class="g-row" style="height:${rowH}px">
        <button class="g-name${state.compare.has(p.name) ? ' sel' : ''}" data-act="gcompare" data-v="${esc(p.name)}">
          ${avatar(p.name, 'xs')}<span>${esc(p.name)}</span>${state.compare.has(p.name) ? icon('check', 'gcheck') : ''}
        </button>
        <div class="g-track" style="width:${W}px;--gx:${GX.PADL}px;--gpy:${GX.PXY}px">
          <i class="g-span" style="left:${xStart}px;width:${Math.min(xEnd - xStart, W - xStart - 8)}px;background:hsl(${h} 62% 50% / .14)"></i>
          ${placed.map(b => gBar(b)).join('')}
        </div>
      </div>`;
    }).join('');
  }

  return `
  ${tray}
  <div class="card gpanel" style="--i:0">
    <div class="g-scroll">
      <div class="g-inner" style="width:${W + 138}px">
        ${gAxisRow(years, y0, W)}
        ${body}
      </div>
    </div>
    <div class="g-legend">
      ${comparing
        ? sel.map(({ p }) => `<span class="g-leg"><i style="background:hsl(${hueOf(p.name)} 65% 48%)"></i>${esc(p.name)}</span>`).join('')
        : legend.map(t => `<span class="g-leg"><i style="background:${typeVar(t)}"></i>${esc(t)}</span>`).join('')}
    </div>
  </div>
  ${undated ? `<p class="g-note">${undated} undated ${undated === 1 ? 'moment isn’t' : 'moments aren’t'} on the chart — no year in the sheet</p>` : ''}`;
}

/* ── tree layout (inside the Timeline view) ────────────────────
   The pod as a braid: every person is a colored noodle flowing down
   a vertical time axis. Moments are knots — when a moment involves
   several people, their strands bend toward its spot (the centroid of
   their home columns) and bundle through it. People enter the story
   with a little name chip where their strand begins. */
const TR = { COLW: 116, ROWH: 88, YEARH: 66, TOP: 88, PADL: 26, PILLW: 224 };

function treePanelHTML(evs) {
  const dated = evs.filter(e => e.year);
  const undated = evs.length - dated.length;
  if (!dated.length) {
    return `<div class="empty">
      <div class="empty-ic">${icon('branch')}</div>
      <h3>Nothing to braid yet</h3>
      <p>Moments need a year to appear on the tree.</p>
    </div>`;
  }

  // home columns, in order of first appearance in the story
  const colOf = new Map();
  for (const e of dated) {
    for (const raw of [e.person, ...e.rel]) {
      const name = String(raw || '').trim();
      if (name && !colOf.has(name)) colOf.set(name, colOf.size);
    }
  }
  const homeX = name => TR.PADL + colOf.get(name) * TR.COLW + TR.COLW / 2;

  // one row per moment, with a divider row when the year changes
  let y = TR.TOP;
  const yearRows = [], knots = [];
  let curYear = null;
  for (const e of dated) {
    if (e.year !== curYear) { curYear = e.year; yearRows.push({ year: curYear, y }); y += TR.YEARH; }
    const ppl = [...new Set([e.person, ...e.rel].map(s => String(s || '').trim()).filter(Boolean))];
    const x = Math.round(ppl.reduce((s, n) => s + homeX(n), 0) / ppl.length);
    knots.push({ e, x, y, ppl });
    y += TR.ROWH;
  }
  const W = TR.PADL + colOf.size * TR.COLW + 60;
  const H = y + 28;

  // strand points; a small per-knot offset keeps bundled lines tellable-apart
  const strands = new Map();
  for (const nd of knots) {
    nd.ppl.forEach((name, i) => {
      const pt = { x: nd.x + (i - (nd.ppl.length - 1) / 2) * 7, y: nd.y };
      (strands.get(name) || strands.set(name, []).get(name)).push(pt);
    });
  }

  // entry chips above each person's first knot (fanned out when several
  // people step into the story at the same moment)
  const entries = [];
  for (const nd of knots) {
    const entering = nd.ppl.filter(n => strands.get(n)[0].y === nd.y);
    entering.forEach((name, j) => {
      const cx = Math.round(nd.x + (j - (entering.length - 1) / 2) * 128);
      entries.push({ name, x: cx, y: nd.y - 56 });
      strands.get(name).unshift({ x: cx, y: nd.y - 40 });
    });
  }

  const pathD = pts => pts.map((p, i) => {
    if (!i) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const k = Math.min(Math.max((p.y - prev.y) * 0.5, 18), 110);
    return `C ${prev.x} ${prev.y + k}, ${p.x} ${p.y - k}, ${p.x} ${p.y}`;
  }).join(' ');

  const noodles = [...strands.entries()].map(([name, pts], i) =>
    `<path d="${pathD(pts)}" pathLength="1" style="--ph:${hueOf(name)};--pi:${i}"><title>${esc(name)}</title></path>`).join('');
  const dots = knots.map((nd, i) =>
    `<circle class="t-knot" cx="${nd.x}" cy="${nd.y}" r="7" style="--tc:${typeVar(nd.e.type)};--ni:${i}"/>`).join('');

  let i = 0;
  return `
  <div class="card tpanel" style="--i:0">
    <div class="t-scroll">
      <div class="t-canvas" style="width:${W}px;height:${H}px">
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${noodles}${dots}</svg>
        ${yearRows.map(r => `
        <div class="t-yearrow" style="top:${r.y + TR.YEARH / 2}px"><b>${r.year}</b><i></i></div>`).join('')}
        ${entries.map(en => `
        <button class="t-entry" data-act="person-sheet" data-v="${esc(en.name)}" style="left:${en.x}px;top:${en.y}px">
          ${avatar(en.name, 'xs')}<span>${esc(en.name.split(' ')[0])}</span>
        </button>`).join('')}
        ${knots.map(nd => {
          const e = nd.e;
          const flip = nd.x > W - (TR.PILLW + 50);
          const note = e.note.length > 62 ? e.note.slice(0, 62) + '…' : e.note;
          return `
        <button class="t-node${e.photo ? ' has-photo' : ''}" data-act="event-sheet" data-v="${e.id}"
          style="${flip ? `right:${W - nd.x + 18}px` : `left:${nd.x + 18}px`};top:${nd.y}px;--tc:${typeVar(e.type)};--i:${i++ % 12}">
          <b>${firstMeets().has(e.id) ? icon('spark', 'bspark') : ''}${esc(note)}</b>
          <small>${esc(e.when.label)}${e.loc ? ` · ${esc(e.loc.split(',')[0])}` : ''}</small>
          ${e.photo ? `<span class="t-thumb" data-act="photo-view" data-v="${e.id}" role="button" aria-label="View photo full size">
            <img src="${esc(e.photo.src)}" alt="" loading="lazy" decoding="async" draggable="false"></span>` : ''}
        </button>`;
        }).join('')}
      </div>
    </div>
  </div>
  ${undated ? `<p class="g-note">${undated} undated ${undated === 1 ? 'moment isn’t' : 'moments aren’t'} on the tree — no year in the sheet</p>` : ''}`;
}

/* ── map layout (inside the Timeline view) ─────────────────────
   A scrollytelling map: the map stays pinned (with the current
   month/year in a fixed HUD) while a column of month-by-month steps
   scrolls beneath it. The step under the focus line is "now" — its
   moments pulse on the map, everything earlier stays as quiet dots,
   everything later hasn't happened yet. Tiles are CARTO's Positron
   (light_all) — the flattest, whitest free OSM style around. */

/* places the seed data mentions; anything else is geocoded via
   Nominatim once and remembered in localStorage */
const GEO = {
  'salt lake city, ut': [40.7608, -111.8910],
  'austin, tx':         [30.2672, -97.7431],
  'buda, tx':           [30.0852, -97.8404],
  'anaheim, ca':        [33.8366, -117.9143],
  'orlando, fl':        [28.5384, -81.3789],
  'paris, france':      [48.8566, 2.3522],
};
const LS_GEO = 'podtl.geo.v1';
const geoCache = (() => { try { return JSON.parse(localStorage.getItem(LS_GEO)) || {}; } catch { return {}; } })();
const geoKey = loc => String(loc).trim().toLowerCase();
const coordsFor = loc => loc ? (GEO[geoKey(loc)] || geoCache[geoKey(loc)] || null) : null;

let geoBusy = false;
const geoFailed = new Set(); // don't hammer Nominatim over a place it can't find
async function geocodeMissing(locs) {
  const missing = [...new Set(locs.map(geoKey))]
    .filter(k => k && !GEO[k] && !geoCache[k] && !geoFailed.has(k));
  if (!missing.length || geoBusy) return;
  geoBusy = true;
  let found = 0;
  for (const k of missing) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(k)}`);
      const hit = (await res.json())[0];
      if (hit) { geoCache[k] = [+hit.lat, +hit.lon]; found++; localStorage.setItem(LS_GEO, JSON.stringify(geoCache)); }
      else geoFailed.add(k);
    } catch { geoFailed.add(k); }
    await new Promise(r => setTimeout(r, 1100)); // Nominatim asks for ≤1 req/s
  }
  geoBusy = false;
  if (found && mapM.map) { addMapMarkers(); applyStepToMarkers(mapM.idx); focusStep(mapM.idx, true); }
}

/* Leaflet, fetched only when the map mode is first opened */
let leafletP = null;
function ensureLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletP) return leafletP;
  leafletP = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => resolve(window.L);
    js.onerror = () => { leafletP = null; js.remove(); reject(new Error('Leaflet failed to load')); };
    document.head.appendChild(js);
  });
  return leafletP;
}

const mapScheme = matchMedia('(prefers-color-scheme: dark)');
const tileURL = () =>
  `https://{s}.basemaps.cartocdn.com/${mapScheme.matches ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`;
mapScheme.addEventListener?.('change', () => mapM.tiles?.setUrl(tileURL()));

const mapM = {
  map: null, L: null, tiles: null, gen: 0,
  steps: [], stepOf: new Map(), dated: [], total: 0,
  markers: new Map(), stepEls: [], shellEl: null,
  idx: -1, raf: 0, pending: null,
};

function mapPanelHTML(evs) {
  const dated = evs.filter(e => e.year);
  const undated = evs.length - dated.length;
  if (!dated.length) {
    mapM.pending = null;
    return `<div class="empty">
      <div class="empty-ic">${icon('map')}</div>
      <h3>Nothing to map yet</h3>
      <p>Moments need a year to travel the map through time.</p>
    </div>`;
  }

  // months, in story order: a new step whenever (year, month) changes.
  // Month-less moments sort mid-year already, so they form their own
  // "sometime that year" stop between June and July.
  const steps = [];
  let cur = null;
  for (const e of dated) {
    const m = e.when.m || 0;
    if (!cur || cur.y !== e.year || cur.m !== m) {
      cur = { y: e.year, m, label: m ? `${MON_ABBR[m - 1]} ${e.year}` : String(e.year), evs: [] };
      steps.push(cur);
    }
    cur.evs.push(e);
  }
  const stepOf = new Map();
  steps.forEach((st, i) => st.evs.forEach(e => stepOf.set(e.id, i)));
  mapM.pending = { steps, stepOf, dated };

  const unplaced = dated.filter(e => !e.loc).length;
  return `
  <div class="mapmode">
    <div class="map-shell">
      <div id="podmap" aria-label="Map of the pod’s moments through time"></div>
      <div class="map-hud" aria-live="polite"><b id="map-now"></b><small id="map-count"></small></div>
    </div>
    <div class="map-steps" id="map-steps">
      <p class="map-hint">Scroll to travel through time ${icon('chevdown')}</p>
      ${steps.map((st, i) => `
      ${i === 0 || steps[i - 1].y !== st.y ? `<div class="map-yearrow"><i></i><b>${st.y}</b><i></i></div>` : ''}
      <section class="mstep" data-step="${i}">
        <header class="mstep-head">
          <b>${esc(st.label)}${st.m ? '' : ' · sometime that year'}</b>
          <span>${st.evs.length} ${st.evs.length === 1 ? 'moment' : 'moments'}</span>
        </header>
        ${st.evs.map(e => `
        <button class="mrow" data-act="event-sheet" data-v="${e.id}" style="--tc:${typeVar(e.type)}">
          <span class="mini-dot"></span>
          <span class="mrow-main">
            <b>${esc(e.note.length > 96 ? e.note.slice(0, 96) + '…' : e.note)}</b>
            <small>${esc(e.when.label)}${e.person ? ' · ' + esc(e.person.split(' ')[0]) : ''}${e.loc ? ' · ' + esc(e.loc.split(',')[0]) : ''}</small>
          </span>
          ${e.photo ? `<span class="mini-thumb" data-act="photo-view" data-v="${e.id}" role="button" aria-label="View photo full size">
            <img src="${esc(e.photo.src)}" alt="" loading="lazy" decoding="async" draggable="false"></span>` : ''}
        </button>`).join('')}
      </section>`).join('')}
      <p class="map-end">${icon('spark')} That’s the whole story — so far</p>
    </div>
  </div>
  ${unplaced ? `<p class="g-note">${unplaced} ${unplaced === 1 ? 'moment has' : 'moments have'} no place in the sheet — on the clock but not the map</p>` : ''}
  ${undated ? `<p class="g-note">${undated} undated ${undated === 1 ? 'moment isn’t' : 'moments aren’t'} on the map — no year in the sheet</p>` : ''}`;
}

async function mountMap() {
  unmountMap();
  const data = mapM.pending;
  if (!data) return;
  const gen = ++mapM.gen;
  Object.assign(mapM, {
    steps: data.steps, stepOf: data.stepOf, dated: data.dated,
    total: data.dated.length, idx: -1,
    stepEls: $$('#map-steps .mstep'), shellEl: $('.map-shell'),
  });
  setMapHUD(0); // the HUD reads right even before tiles arrive

  let L;
  try { L = await ensureLeaflet(); }
  catch { $('.map-hud')?.insertAdjacentHTML('beforebegin', '<p class="map-fail">Couldn’t load the map — check your connection</p>'); return; }
  const host = $('#podmap');
  if (gen !== mapM.gen || !host || host._leaflet_id) return; // re-rendered while Leaflet loaded

  mapM.L = L;
  const map = L.map(host, {
    zoomControl: false,
    scrollWheelZoom: false,                        // the wheel scrolls time, not the map
    dragging: !matchMedia('(pointer: coarse)').matches, // touch-drag keeps scrolling the page
    touchZoom: true,
  });
  mapM.map = map;
  mapM.tiles = L.tileLayer(tileURL(), {
    subdomains: 'abcd', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);
  map.setView([39, -95], 4); // placeholder until the first fit

  addMapMarkers();
  const all = [...mapM.markers.values()].map(r => r.m.getLatLng());
  if (all.length) map.fitBounds(L.latLngBounds(all).pad(0.2), { animate: false, maxZoom: 11 });
  syncMapToScroll();
  geocodeMissing(mapM.dated.map(e => e.loc).filter(Boolean));
}

function unmountMap() {
  mapM.gen++;
  cancelAnimationFrame(mapM.raf);
  try { mapM.map?.remove(); } catch { /* container may already be gone */ }
  Object.assign(mapM, { map: null, tiles: null, markers: new Map(), stepEls: [], shellEl: null, idx: -1 });
}

/* several moments in one city fan out on a tiny golden-angle spiral
   so they read as a cluster instead of one dot */
function addMapMarkers() {
  const perLoc = new Map();
  for (const e of mapM.dated) {
    const at = coordsFor(e.loc);
    if (!at) continue;
    const k = geoKey(e.loc);
    const n = perLoc.get(k) || 0;
    perLoc.set(k, n + 1);
    if (mapM.markers.has(e.id)) continue;
    const a = n * 2.39996, r = 0.004 * Math.sqrt(n);
    const marker = mapM.L.marker([at[0] + r * Math.sin(a), at[1] + r * Math.cos(a)], {
      icon: mapM.L.divIcon({
        className: 'mk future', iconSize: [26, 26], iconAnchor: [13, 13],
        html: `<span class="mkin" style="--tc:${typeVar(e.type)}"><i class="mkring"></i><i class="mkdot"></i></span>`,
      }),
      keyboard: false,
    }).on('click', () => eventSheet(e.id)).addTo(mapM.map);
    marker.bindTooltip(e.note.length > 60 ? e.note.slice(0, 60) + '…' : e.note, { direction: 'top', offset: [0, -10] });
    mapM.markers.set(e.id, { m: marker, step: mapM.stepOf.get(e.id) });
  }
}

function applyStepToMarkers(idx) {
  for (const rec of mapM.markers.values()) {
    const el = rec.m.getElement();
    if (!el) continue;
    const cls = rec.step < idx ? 'past' : rec.step === idx ? 'now' : 'future';
    el.classList.remove('past', 'now', 'future');
    el.classList.add(cls);
    rec.m.setZIndexOffset(cls === 'now' ? 1000 : 0);
  }
}

function focusStep(idx, instant = false) {
  if (!mapM.map) return;
  const pts = [...mapM.markers.values()].filter(r => r.step === idx).map(r => r.m.getLatLng());
  if (!pts.length) return; // a month with no mappable place keeps the current framing
  const b = mapM.L.latLngBounds(pts).pad(0.3);
  const opts = { maxZoom: 11, paddingTopLeft: [24, 76], paddingBottomRight: [24, 24] };
  if (instant || reducedMotion()) mapM.map.fitBounds(b, { ...opts, animate: false });
  else mapM.map.flyToBounds(b, { ...opts, duration: 0.9 });
}

function setMapHUD(idx) {
  const st = mapM.steps[idx];
  const now = $('#map-now'), count = $('#map-count');
  if (!st || !now) return;
  now.textContent = st.label;
  const cum = mapM.steps.slice(0, idx + 1).reduce((s, x) => s + x.evs.length, 0);
  count.textContent = `${cum} of ${mapM.total} ${mapM.total === 1 ? 'moment' : 'moments'} so far`;
}

function setStep(idx, instant = false) {
  mapM.idx = idx;
  setMapHUD(idx);
  mapM.stepEls.forEach((el, i) => {
    el.classList.toggle('now', i === idx);
    el.classList.toggle('past', i < idx);
  });
  applyStepToMarkers(idx);
  focusStep(idx, instant);
}

/* the focus line sits just under the pinned map: whichever month's
   card has crossed it is the time we're "in" */
function syncMapToScroll() {
  if (!mapM.stepEls.length) return;
  const shell = mapM.shellEl?.getBoundingClientRect();
  const focus = (shell ? shell.bottom : innerHeight * 0.5) + Math.min(innerHeight * 0.12, 110);
  let idx = 0;
  for (let i = 0; i < mapM.stepEls.length; i++) {
    if (mapM.stepEls[i].getBoundingClientRect().top < focus) idx = i; else break;
  }
  if (idx !== mapM.idx) setStep(idx, mapM.idx < 0);
}

addEventListener('scroll', () => {
  if (!mapM.map && !mapM.stepEls.length) return;
  cancelAnimationFrame(mapM.raf);
  mapM.raf = requestAnimationFrame(syncMapToScroll);
}, { passive: true });

/* ── picker sheets (Year / Person / Kind) ──────────────────── */
let currentPicker = null, filterPopOpen = false;
const pickerSet = k => k === 'year' ? state.years : k === 'person' ? state.people : state.types;

function pickerBody(kind) {
  const set = pickerSet(kind);
  let title, allLabel, opts;
  if (kind === 'year') {
    title = 'Year'; allLabel = 'Any year';
    const counts = new Map();
    for (const e of state.events) if (e.year) counts.set(e.year, (counts.get(e.year) || 0) + 1);
    opts = [...counts.keys()].sort().map(y => ({ v: y, label: String(y), lead: icon('calendar'), count: counts.get(y) }));
  } else if (kind === 'person') {
    title = 'Person'; allLabel = 'Everyone';
    opts = allPeople().map(p => ({ v: p.name, label: p.name, lead: avatar(p.name, 'xs'), count: p.count }));
  } else {
    title = 'Kind'; allLabel = 'Any kind';
    const counts = new Map();
    for (const e of state.events) counts.set(e.type, (counts.get(e.type) || 0) + 1);
    opts = TYPE_ORDER.filter(t => counts.has(t)).map(t => ({
      v: t, label: t, lead: `<span class="opt-tdot" style="--tc:${typeVar(t)}">${typeIcon(t)}</span>`, count: counts.get(t),
    }));
  }
  const n = filtered().length;
  return `
  <div class="pickersheet">
    <div class="fsheet-head"><h2>${title}</h2>
      <button class="btn ghost" data-act="close-sheet">Done</button>
    </div>
    <div class="optlist">
      <button class="opt${set.size === 0 ? ' sel' : ''}" data-act="opt-all" data-k="${kind}">
        <span class="opt-main">${allLabel}</span>${set.size === 0 ? icon('check', 'optcheck') : ''}
      </button>
      ${opts.map(o => `
      <button class="opt${set.has(o.v) ? ' sel' : ''}" data-act="opt" data-k="${kind}" data-v="${esc(o.v)}">
        ${o.lead}<span class="opt-main">${esc(o.label)}</span><b>${o.count}</b>${set.has(o.v) ? icon('check', 'optcheck') : ''}
      </button>`).join('')}
    </div>
    <p class="opt-count">${n} ${n === 1 ? 'moment' : 'moments'} match</p>
  </div>`;
}
// no variant class here — 'picker' would collide with the filter-button styles
// and center-shrink the sheet body (the original mobile-picker layout bug)
function pickerSheet(kind, anchor) { currentPicker = kind; openSheet(pickerBody(kind), '', anchor); }
function refreshPickerSheet() {
  const body = $('#sheet-root .sheet-body');
  if (!body || !currentPicker) return;
  const pos = body.scrollTop;
  body.innerHTML = pickerBody(currentPicker);
  body.scrollTop = pos;
}

/* ── people view ───────────────────────────────────────────── */
function peopleHTML() {
  const people = allPeople();
  return `
  <div class="view v-people${state._anim ? ' anim' : ''}">
    <div class="lhead">
      <div class="lrow"><h1>People</h1>
        <div class="hbtns"><button class="hbtn" data-act="settings-sheet" aria-label="Settings">${icon('gear')}</button></div>
      </div>
      <p class="sub">${people.length} people in the pod’s story</p>
    </div>
    <div class="pgrid">
      ${people.map((p, i) => {
        const ys = [...p.years].sort();
        const span = ys.length ? (ys[0] === ys.at(-1) ? ys[0] : `${ys[0]}–${ys.at(-1)}`) : '—';
        return `
        <button class="card pcard" data-act="person-sheet" data-v="${esc(p.name)}" style="--i:${i % 8}">
          ${avatar(p.name, 'lg')}
          <h3>${esc(p.name)}</h3>
          <p>${p.count} ${p.count === 1 ? 'moment' : 'moments'} · ${span}</p>
          <div class="typedots">${[...p.types].filter(t => t !== 'Moment').slice(0, 6)
            .map(t => `<i style="background:${typeVar(t)}" title="${esc(t)}"></i>`).join('')}</div>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

/* ── places view ───────────────────────────────────────────── */
function placesHTML() {
  const places = allPlaces();
  const max = Math.max(...places.map(p => p.count), 1);
  return `
  <div class="view v-places${state._anim ? ' anim' : ''}">
    <div class="lhead">
      <div class="lrow"><h1>Places</h1>
        <div class="hbtns"><button class="hbtn" data-act="settings-sheet" aria-label="Settings">${icon('gear')}</button></div>
      </div>
      <p class="sub">${places.length} places, one shared map of memories</p>
    </div>
    <div class="plist">
      ${places.map((p, i) => {
        const h = hueOf(p.name);
        const who = [...p.people].slice(0, 3);
        return `
        <button class="card prow" data-act="fplace-go" data-v="${esc(p.name)}" style="--i:${i % 8}">
          <span class="pinbadge" style="background:linear-gradient(135deg, hsl(${h} 70% 56%), hsl(${(h + 24) % 360} 70% 42%))">${icon('pin')}</span>
          <span class="prow-main">
            <b>${esc(p.name)}</b>
            <small>${p.count} ${p.count === 1 ? 'moment' : 'moments'} · ${who.map(esc).join(', ')}${p.people.size > 3 ? ` +${p.people.size - 3}` : ''}</small>
            <span class="meter"><i style="width:${Math.round(p.count / max * 100)}%"></i></span>
          </span>
          <span class="avstack">${who.map(n => avatar(n, 'xs stack')).join('')}</span>
          ${icon('chevron', 'chev')}
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

/* ── insights view ─────────────────────────────────────────── */
function insightsHTML() {
  const evs = state.events;
  const people = allPeople();
  const places = allPlaces();
  const [y0, y1] = yearsRange();

  const perYear = new Map();
  if (y0) for (let y = y0; y <= y1; y++) perYear.set(y, 0);
  for (const e of evs) if (e.year) perYear.set(e.year, (perYear.get(e.year) || 0) + 1);
  const maxYear = Math.max(...perYear.values(), 1);

  const typeCounts = TYPE_ORDER.map(t => [t, evs.filter(e => e.type === t).length]).filter(([, c]) => c);
  const maxType = Math.max(...typeCounts.map(([, c]) => c), 1);

  const pod = evs.filter(e => e.scope === 'Pod').length;
  const self = evs.filter(e => e.scope === 'Self').length;
  const top = people.slice(0, 5);
  const maxTop = Math.max(...top.map(p => p.count), 1);

  return `
  <div class="view v-insights${state._anim ? ' anim' : ''}">
    <div class="lhead">
      <div class="lrow"><h1>Insights</h1>
        <div class="hbtns"><button class="hbtn" data-act="settings-sheet" aria-label="Settings">${icon('gear')}</button></div>
      </div>
      <p class="sub">The pod, by the numbers</p>
    </div>

    <div class="tiles">
      <div class="card tile" style="--i:0"><b>${evs.length}</b><span>moments</span></div>
      <div class="card tile" style="--i:1"><b>${people.length}</b><span>people</span></div>
      <div class="card tile" style="--i:2"><b>${places.length}</b><span>places</span></div>
      <div class="card tile" style="--i:3"><b>${y0 ? y1 - y0 + 1 : 0}</b><span>years</span></div>
    </div>

    <div class="card panel" style="--i:4">
      <h3>Moments per year</h3>
      <div class="ybars" role="img" aria-label="Moments per year">
        ${[...perYear.entries()].map(([y, c]) => `
          <button class="ybar" data-act="fyear-go" data-v="${y}" data-tip="${y}: ${c} ${c === 1 ? 'moment' : 'moments'}">
            <b>${c}</b><i style="height:${Math.max(Math.round(c / maxYear * 100), 3)}%"></i><span>’${String(y).slice(2)}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="card panel" style="--i:5">
      <h3>Kinds of moments</h3>
      ${typeCounts.map(([t, c]) => `
        <button class="hrow" data-act="ftype-go" data-v="${esc(t)}">
          <span class="hlabel">${typeIcon(t)}${esc(t)}</span>
          <span class="hbar"><i style="width:${Math.round(c / maxType * 100)}%;background:${typeVar(t)}"></i></span>
          <b>${c}</b>
        </button>`).join('')}
    </div>

    <div class="card panel" style="--i:6">
      <h3>Pod vs. Self</h3>
      <div class="duo"><i class="pod" style="flex:${pod || 1}"><span>Pod · ${pod}</span></i><i class="self" style="flex:${self || 1}"><span>Self · ${self}</span></i></div>
      <p class="panel-note">Pod moments weave people together; Self moments are one person’s own milestones.</p>
    </div>

    <div class="card panel" style="--i:7">
      <h3>Most mentioned</h3>
      ${top.map(p => `
        <button class="hrow" data-act="person-sheet" data-v="${esc(p.name)}">
          <span class="hlabel">${avatar(p.name, 'xs')}${esc(p.name)}</span>
          <span class="hbar"><i style="width:${Math.round(p.count / maxTop * 100)}%"></i></span>
          <b>${p.count}</b>
        </button>`).join('')}
    </div>
  </div>`;
}

/* ── render machinery ──────────────────────────────────────── */
const viewHTML = () => ({
  timeline: timelineHTML, people: peopleHTML, places: placesHTML, insights: insightsHTML,
}[state.view]());

let revealIO = null;
function afterRender() {
  $('#cbar-title').textContent = VIEW_TITLE[state.view];

  $$('#tabbar .tab').forEach(b => b.classList.toggle('on', b.dataset.v === state.view));

  revealIO?.disconnect();
  // Ambient reveal: cards drift in when they enter the viewport and slip
  // away again when they leave — in both scroll directions. The stagger
  // delay applies only to a card's very first appearance.
  revealIO = new IntersectionObserver(entries => {
    for (const en of entries) {
      const el = en.target;
      if (en.isIntersecting) {
        if (!el.dataset.seen) {
          el.dataset.seen = '1';
          const i = +el.style.getPropertyValue('--i') || 0;
          el.style.transitionDelay = i * 30 + 'ms';
          setTimeout(() => { el.style.transitionDelay = ''; }, 720);
        }
        el.classList.add('in');
      } else el.classList.remove('in');
    }
  }, { rootMargin: '4% 3% -5% 3%' });
  $$('.card').forEach(c => revealIO.observe(c));

  // the map lives outside innerHTML land — (re)mount it when its host
  // exists, tear it down when the render replaced it with another layout
  if ($('#podmap')) mountMap(); else unmountMap();
}

function render({ dir = 0, restoreScroll = true } = {}) {
  const main = $('#main');
  const doIt = () => {
    main.innerHTML = viewHTML();
    state._anim = false;
    afterRender();
    if (restoreScroll) window.scrollTo({ top: state.scroll[state.view] || 0 });
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.dir = dir > 0 ? 'fwd' : dir < 0 ? 'back' : 'fade';
    document.startViewTransition(doIt);
  } else doIt();
}

/* re-render the current view in place (no view transition, no entrance
   flicker) — used while a sheet is open or for live filter updates */
function softRender() {
  const y = window.scrollY;
  const main = $('#main');
  main.innerHTML = viewHTML();
  $$('.card', main).forEach(c => { c.classList.add('in'); c.dataset.seen = '1'; });
  afterRender();
  window.scrollTo(0, y);
}

/* ── sheets (bottom sheets on phones; filters become anchored
      popovers on desktop, hanging off the control that opened them) ── */
let sheetOpen = false;
const wantsPopover = anchor =>
  !!anchor?.isConnected && matchMedia('(min-width: 900px)').matches;

function openSheet(html, cls = '', anchor = null) {
  const root = $('#sheet-root');
  const pop = wantsPopover(anchor);
  root.classList.toggle('pop', pop);
  if (pop) {
    root.innerHTML = `
      <div class="backdrop" data-act="close-sheet"></div>
      <div class="sheet popmenu ${cls}" role="dialog" aria-modal="true">
        <div class="sheet-body">${html}</div>
      </div>`;
    const el = root.querySelector('.sheet');
    const r = anchor.getBoundingClientRect();
    const pw = Math.min(cls === 'tall' ? 430 : 350, innerWidth - 32);
    let left = Math.max(r.left, 16);
    if (left + pw > innerWidth - 16) left = Math.max(r.right - pw, 16); // hug right-edge anchors
    const top = Math.round(r.bottom + 10);
    el.style.width = pw + 'px';
    el.style.left = Math.round(left) + 'px';
    el.style.top = top + 'px';
    el.style.maxHeight = Math.max(innerHeight - top - 24, 240) + 'px';
    // scale out of the trigger itself, not a generic corner
    el.style.setProperty('--ox', Math.round(r.left + r.width / 2 - left) + 'px');
    anchor.classList.add('pop-src');
  } else {
    root.innerHTML = `
      <div class="backdrop" data-act="close-sheet"></div>
      <div class="sheet ${cls}" role="dialog" aria-modal="true">
        <div class="grabber" data-drag></div>
        <div class="sheet-body">${html}</div>
      </div>`;
    enableSheetDrag(root.querySelector('.sheet'));
  }
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  sheetOpen = true;
}
function closeSheet() {
  const root = $('#sheet-root');
  if (!sheetOpen) return;
  root.classList.remove('open');
  sheetOpen = false;
  currentPicker = null;
  filterPopOpen = false;
  $$('.pop-src').forEach(el => el.classList.remove('pop-src'));
  setTimeout(() => {
    if (!sheetOpen) { root.innerHTML = ''; root.classList.remove('pop'); document.body.classList.remove('locked'); }
  }, 320);
}
/* a popover's anchor is gone after a resize/breakpoint change — fold it up */
addEventListener('resize', () => { if (sheetOpen && $('#sheet-root .sheet.popmenu')) closeSheet(); });
function enableSheetDrag(sheet) {
  let y0 = null, dy = 0;
  const grab = sheet.querySelector('[data-drag]');
  const move = e => {
    if (y0 == null) return;
    dy = Math.max(0, (e.touches ? e.touches[0].clientY : e.clientY) - y0);
    sheet.style.transform = `translateY(${dy}px)`;
    sheet.style.transition = 'none';
  };
  const end = () => {
    if (y0 == null) return;
    sheet.style.transition = '';
    if (dy > 110) closeSheet(); else sheet.style.transform = '';
    y0 = null; dy = 0;
    removeEventListener('pointermove', move); removeEventListener('pointerup', end);
  };
  grab?.addEventListener('pointerdown', e => {
    y0 = e.clientY;
    addEventListener('pointermove', move); addEventListener('pointerup', end);
  });
}

/* ── event detail sheet ────────────────────────────────────── */
function eventSheet(id) {
  const e = state.events.find(x => x.id === id);
  if (!e) return;
  // hedcuts of everyone in the moment, printed into the sheet's corner
  const faces = [...new Set([e.person, ...e.rel])].map(hedcut).filter(Boolean).slice(0, 3);
  openSheet(`
    <div class="esheet" style="--tc:${typeVar(e.type)}">
      ${faces.length ? `<div class="hedart" aria-hidden="true">
        ${faces.map(src => `<img src="${esc(src)}" alt="" decoding="async" draggable="false">`).join('')}
      </div>` : ''}
      <div class="esheet-top">
        <span class="tbadge big">${typeIcon(e.type)}<span>${esc(e.type)}</span></span>
        ${scopePill(e.scope)}
      </div>
      <p class="esheet-note">${esc(e.note)}</p>
      ${e.photo ? `
      <figure class="ev-photo esheet-photo" data-act="photo-view" data-v="${e.id}" role="button" tabindex="0"
        aria-label="View photo full size" style="--ar:${photoRatio(e.photo)}">
        <img src="${esc(e.photo.src)}" alt="${esc(photoAlt(e))}" decoding="async" draggable="false">
        <figcaption>${icon('camera')} Tap to view full size</figcaption>
      </figure>` : ''}
      <div class="kv">
        <div class="kvrow">${icon('calendar')}<span>${esc(e.when.label)}${e.year && !e.when.exact && !String(e.when.label).includes(String(e.year)) ? ` · ${e.approx ? 'around ' : ''}${e.year}` : ''}</span></div>
        ${e.loc ? `<div class="kvrow">${icon('pin')}<span>${esc(e.loc)}</span></div>` : ''}
      </div>
      ${e.person || e.rel.length ? `
      <h4>People</h4>
      <div class="tags">
        ${e.person ? personChip(e.person) : ''}
        ${e.rel.map(r => personChip(r)).join('')}
      </div>` : ''}
      ${firstMeets().has(e.id) ? `
      <h4>Firsts</h4>
      <div class="kv">
        ${firstMeets().get(e.id).map(([a, b]) => `
          <div class="kvrow spark">${icon('spark')}<span>First moment with ${esc(a)} and ${esc(b)} together</span></div>`).join('')}
      </div>` : ''}
      <div class="sheet-actions">
        ${e.person ? `<button class="btn tint" data-act="fperson-go" data-v="${esc(e.person)}">${icon('clock')} ${esc(e.person.split(' ')[0])}’s timeline</button>` : ''}
        ${e.loc ? `<button class="btn" data-act="fplace-go" data-v="${esc(e.loc)}">${icon('pin')} Everything in ${esc(e.loc.split(',')[0])}</button>` : ''}
      </div>
      <p class="rowref">Row ${e.row + 2} of the sheet</p>
    </div>`);
}

/* ── person sheet ──────────────────────────────────────────── */
function personSheet(name) {
  const p = allPeople().find(x => x.name === name);
  if (!p) return;
  const moments = state.events.filter(e => e.person === name || e.rel.includes(name));
  const ys = [...p.years].sort();
  openSheet(`
    <div class="psheet">
      <div class="psheet-top">
        ${avatar(name, 'xl')}
        <h2>${esc(name)}</h2>
        <p class="sub">${p.count} ${p.count === 1 ? 'moment' : 'moments'}${ys.length ? ` · ${ys[0]}–${ys.at(-1)}` : ''}${p.places.size ? ` · ${p.places.size} ${p.places.size === 1 ? 'place' : 'places'}` : ''}</p>
        <button class="btn tint" data-act="fperson-go" data-v="${esc(name)}">${icon('clock')} Show in Timeline</button>
      </div>
      <h4>Moments</h4>
      <div class="mini-list">
        ${moments.map(e => `
          <button class="mini" data-act="event-sheet" data-v="${e.id}" style="--tc:${typeVar(e.type)}">
            <span class="mini-dot"></span>
            <span class="mini-main"><b>${esc(e.note.length > 92 ? e.note.slice(0, 92) + '…' : e.note)}</b>
            <small>${esc(e.when.label)}${e.loc ? ' · ' + esc(e.loc) : ''}</small></span>
            ${e.photo ? `<span class="mini-thumb" data-act="photo-view" data-v="${e.id}" role="button" aria-label="View photo full size">
              <img src="${esc(e.photo.src)}" alt="" loading="lazy" decoding="async" draggable="false"></span>` : ''}
            ${icon('chevron', 'chev')}
          </button>`).join('')}
      </div>
    </div>`);
}

/* ── filter sheet (scope + places; the rest live in the pickers) ── */
function filterSheetBody() {
  const places = allPlaces();
  const n = filtered().length;

  return `
    <div class="fsheet">
      <div class="fsheet-head"><h2>More filters</h2>
        <button class="btn ghost" data-act="clear-filters">Reset all</button>
      </div>

      <h4>Scope</h4>
      <div class="seg">
        ${['', 'Pod', 'Self'].map(s =>
          `<button class="seg-btn${state.scope === s ? ' on' : ''}" data-act="fscope" data-v="${s}">${s || 'All'}</button>`).join('')}
      </div>

      <h4>Places</h4>
      <div class="chipwrap">
        ${places.map(p => `
          <button class="chip lchip${state.places.has(p.name) ? ' on' : ''}" data-act="fplace" data-v="${esc(p.name)}">
            ${icon('pin')}<span>${esc(p.name)}</span><b>${p.count}</b></button>`).join('')}
      </div>

      <div class="sheet-actions">
        <button class="btn tint wide" data-act="apply-filters">Show ${n} ${n === 1 ? 'moment' : 'moments'}</button>
      </div>
    </div>`;
}
const filterSheet = anchor => { filterPopOpen = wantsPopover(anchor); openSheet(filterSheetBody(), 'tall', anchor); };
function refreshFilterSheet() {
  const body = $('#sheet-root .sheet-body');
  if (!body || !$('.fsheet', body)) return;
  const pos = body.scrollTop;
  body.innerHTML = filterSheetBody();
  body.scrollTop = pos;
}

/* ── settings sheet ────────────────────────────────────────── */
function settingsSheet(err = '') {
  const { kind, url, at } = state.src;
  openSheet(`
    <div class="ssheet">
      <h2>Data source</h2>
      <div class="srccard card">
        <span class="srcic">${icon('table')}</span>
        <div>
          <b>${kind === 'sheet' ? 'Google Sheet' : 'Sample data'}</b>
          <small>${kind === 'sheet'
            ? esc(shortUrl(url)) + (at ? ` · synced ${new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : '')
            : 'Transcribed from the Pod Timeline photo'}</small>
        </div>
        ${kind === 'sheet' ? `<button class="hbtn" data-act="sheet-refresh" aria-label="Refresh">${icon('refresh')}</button>` : ''}
      </div>

      <h4>Connect a Google Sheet</h4>
      <p class="hint">The whole app builds itself from one spreadsheet. In Google Sheets choose
      <b>Share → Anyone with the link</b> (or <b>File → Share → Publish to web → CSV</b>), then paste the link here.
      Columns: Year · Exact Date · Person · Event Type · Location · Type · Related People · Notes · Photo (a link to an image).</p>
      <div class="urlrow">
        <input id="sheet-url" type="url" placeholder="https://docs.google.com/spreadsheets/…" value="${esc(kind === 'sheet' ? url : '')}" autocomplete="off">
      </div>
      ${err ? `<p class="errline">${esc(err)}</p>` : ''}
      <div class="sheet-actions">
        <button class="btn tint wide" data-act="sheet-connect">${icon('arrow')} Sync from sheet</button>
        ${kind === 'sheet' ? `<button class="btn wide" data-act="sheet-sample">Use sample data</button>` : ''}
      </div>
      <p class="rowref">Pod Timeline · built for the web, dressed like an app</p>
    </div>`);
}
const shortUrl = u => { try { const x = new URL(u); return x.hostname + x.pathname.slice(0, 26) + '…'; } catch { return u.slice(0, 40); } };

/* ── Google Sheets CSV loading ─────────────────────────────── */
function csvUrl(input) {
  const u = String(input || '').trim();
  const pub = u.match(/docs\.google\.com\/spreadsheets\/d\/e\/([^/]+)\/pub/);
  if (pub) {
    const gid = (u.match(/[?&#]gid=(\d+)/) || [])[1];
    return `https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv${gid ? `&gid=${gid}` : ''}`;
  }
  const doc = u.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (doc) {
    const gid = (u.match(/[?&#]gid=(\d+)/) || [])[1];
    return `https://docs.google.com/spreadsheets/d/${doc[1]}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`;
  }
  return u; // direct CSV link
}

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(c => c.trim() !== '')) rows.push(row);
  return rows;
}

function sheetToSeed(rows) {
  if (!rows.length) throw new Error('The sheet looks empty.');
  const norm = h => String(h).toLowerCase().replace(/[^a-z]/g, '');
  const heads = rows[0].map(norm);
  const idx = pred => heads.findIndex(pred);
  const col = {
    year:   idx(h => h === 'year'),
    date:   idx(h => h.includes('exactdate') || h === 'date' || h === 'exact'),
    person: idx(h => h === 'person' || h === 'people' || h === 'who'),
    etype:  idx(h => h.includes('eventtype') || h === 'event' || h === 'kind'),
    loc:    idx(h => h.includes('location') || h === 'place' || h === 'where'),
    scope:  idx(h => h === 'type' || h === 'scope' || h === 'podself'),
    rel:    idx(h => h.includes('related')),
    note:   idx(h => h.includes('note') || h.includes('description') || h.includes('what')),
    photo:  idx(h => h.includes('photo') || h.includes('image') || h.includes('picture')),
  };
  if (col.person < 0 && col.note < 0) throw new Error('Couldn’t find Person or Notes columns in that sheet.');
  const cell = (r, i) => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');
  return rows.slice(1).map(r => {
    const yRaw = cell(r, col.year);
    const y = (yRaw.match(/\d{4}/) || [])[0];
    return {
      y: y ? +y : null,
      yq: /\?/.test(yRaw) || /\?/.test(cell(r, col.date)),
      d: cell(r, col.date).replace(/\?/g, '').trim(),
      person: cell(r, col.person),
      type: cell(r, col.etype),
      loc: cell(r, col.loc),
      scope: normScope(cell(r, col.scope)),
      rel: cell(r, col.rel).split(/[,/]/).map(s => s.trim()).filter(Boolean),
      note: cell(r, col.note),
      photo: cell(r, col.photo),
    };
  }).filter(r => r.person || r.note);
}
const normScope = s => {
  const t = String(s || '').trim().toLowerCase();
  return t === 'pod' ? 'Pod' : t === 'self' ? 'Self' : String(s || '').trim();
};

async function connectSheet(url, { silent = false } = {}) {
  const target = csvUrl(url);
  const res = await fetch(target, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Google said no (HTTP ${res.status}). Is the sheet shared with “Anyone with the link”?`);
  const text = await res.text();
  if (/^\s*</.test(text)) throw new Error('That link returned a webpage, not data. Try “File → Share → Publish to web → CSV”.');
  const seed = sheetToSeed(parseCSV(text));
  if (!seed.length) throw new Error('The sheet parsed, but no rows had a person or a note.');
  state.events = buildEvents(seed);
  state.src = { kind: 'sheet', url, at: Date.now() };
  localStorage.setItem(LS_KEY, url);
  if (!silent) toast(`Synced ${seed.length} moments from your sheet`);
}

/* ── full-screen search ────────────────────────────────────── */
let searchOpen = false, sQuery = '';
const LS_RECENTS = 'podtl.recents';
const recents = () => { try { return JSON.parse(localStorage.getItem(LS_RECENTS)) || []; } catch { return []; } };
function saveRecent(q) {
  const t = q.trim();
  if (t.length < 2) return;
  const list = [t, ...recents().filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
  localStorage.setItem(LS_RECENTS, JSON.stringify(list));
}

const hi = (text, q) => {
  if (!q) return esc(text);
  const rx = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return String(text).split(rx).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
};

function searchBodyHTML() {
  const q = sQuery.trim();
  if (!q) {
    const rec = recents();
    const people = allPeople().slice(0, 8);
    const places = allPlaces().slice(0, 6);
    const kinds = TYPE_ORDER.filter(t => state.events.some(e => e.type === t));
    return `
    ${rec.length ? `
    <div class="s-sec" style="--s:0">
      <div class="s-sechead"><h4>Recent</h4><button class="s-mini" data-act="search-clear-recents">Clear</button></div>
      <div class="chipwrap">${rec.map(r => `<button class="chip" data-act="search-sugg" data-v="${esc(r)}">${icon('clock')}<span>${esc(r)}</span></button>`).join('')}</div>
    </div>` : ''}
    <div class="s-sec" style="--s:1">
      <h4>People</h4>
      <div class="chipwrap">${people.map(p => `<button class="chip pchip" data-act="search-sugg" data-v="${esc(p.name)}">${avatar(p.name, 'xs')}<span>${esc(p.name)}</span></button>`).join('')}</div>
    </div>
    <div class="s-sec" style="--s:2">
      <h4>Places</h4>
      <div class="chipwrap">${places.map(p => `<button class="chip lchip" data-act="search-sugg" data-v="${esc(p.name)}">${icon('pin')}<span>${esc(p.name)}</span></button>`).join('')}</div>
    </div>
    <div class="s-sec" style="--s:3">
      <h4>Kinds</h4>
      <div class="chipwrap">${kinds.map(t => typeChip(t, null, false).replace('data-act="ftype"', 'data-act="search-sugg"')).join('')}</div>
    </div>
    <div class="s-sec s-randwrap" style="--s:4">
      <button class="btn wide" data-act="search-random">${icon('spark')} Surprise me with a moment</button>
    </div>`;
  }

  const qq = q.toLowerCase();
  const evs = state.events.filter(e =>
    [e.note, e.person, e.rel.join(' '), e.loc, e.type, e.when.label, e.year].join(' ').toLowerCase().includes(qq));
  const people = allPeople().filter(p => p.name.toLowerCase().includes(qq));
  const places = allPlaces().filter(p => p.name.toLowerCase().includes(qq));
  const kinds = TYPE_ORDER.filter(t => state.events.some(e => e.type === t) && t.toLowerCase().includes(qq));

  if (!evs.length && !people.length && !places.length && !kinds.length) {
    return `<div class="empty s-empty">
      <div class="empty-ic">${icon('search')}</div>
      <h3>No results for “${esc(q)}”</h3>
      <p>Try a name, a place, or a word from a moment.</p>
    </div>`;
  }

  let i = 0;
  return `
  ${evs.length ? `<div class="s-sec" style="--s:0">
    <button class="btn tint wide" data-act="search-apply">${icon('clock')} Show ${evs.length} ${evs.length === 1 ? 'moment' : 'moments'} in Timeline</button>
  </div>` : ''}
  ${people.length ? `<div class="s-sec" style="--s:1">
    <h4>People</h4>
    <div class="chipwrap">${people.map(p => `<button class="chip pchip" data-act="person-sheet" data-v="${esc(p.name)}">${avatar(p.name, 'xs')}<span>${hi(p.name, q)}</span><b>${p.count}</b></button>`).join('')}</div>
  </div>` : ''}
  ${places.length ? `<div class="s-sec" style="--s:2">
    <h4>Places</h4>
    <div class="chipwrap">${places.map(p => `<button class="chip lchip" data-act="fplace-go" data-v="${esc(p.name)}">${icon('pin')}<span>${hi(p.name, q)}</span><b>${p.count}</b></button>`).join('')}</div>
  </div>` : ''}
  ${kinds.length ? `<div class="s-sec" style="--s:2">
    <h4>Kinds</h4>
    <div class="chipwrap">${kinds.map(t => `<button class="chip tchip" style="--tc:${typeVar(t)}" data-act="ftype-go" data-v="${esc(t)}">${typeIcon(t)}<span>${hi(t, q)}</span></button>`).join('')}</div>
  </div>` : ''}
  ${evs.length ? `<div class="s-sec" style="--s:3">
    <h4>Moments</h4>
    ${evs.slice(0, 40).map(e => `
    <button class="s-row" style="--i:${i++}" data-act="event-sheet" data-v="${e.id}">
      <span class="mini-dot" style="--tc:${typeVar(e.type)}"></span>
      <span class="s-main">
        <b>${hi(e.note.length > 110 ? e.note.slice(0, 110) + '…' : e.note, q)}</b>
        <small>${esc(e.when.label)}${e.person ? ` · ${esc(e.person)}` : ''}${e.loc ? ` · ${esc(e.loc.split(',')[0])}` : ''}</small>
      </span>
      ${icon('chevron', 'chev')}
    </button>`).join('')}
    ${evs.length > 40 ? `<p class="g-note">Showing 40 of ${evs.length} — keep typing to narrow down</p>` : ''}
  </div>` : ''}`;
}

let sTimer = null;
function renderSearchBody() {
  const body = $('#s-body');
  if (body) body.innerHTML = searchBodyHTML();
}
function openSearch() {
  if (searchOpen) return;
  searchOpen = true;
  sQuery = state.q;
  const root = $('#search-root');
  root.innerHTML = `
  <div class="s-panel">
    <div class="s-head">
      <label class="searchwrap s-input">${icon('search')}
        <input id="sq" type="search" placeholder="Search moments, people, places" value="${esc(sQuery)}" autocomplete="off" enterkeyhint="search">
      </label>
      <button class="s-cancel" data-act="close-search">Cancel</button>
    </div>
    <div class="s-body" id="s-body">${searchBodyHTML()}</div>
  </div>`;
  document.body.classList.add('searching');
  const input = $('#sq');
  input.addEventListener('input', () => {
    clearTimeout(sTimer);
    sTimer = setTimeout(() => { sQuery = input.value; renderSearchBody(); }, 110);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add('open');
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }));
}
function closeSearch() {
  if (!searchOpen) return;
  searchOpen = false;
  const root = $('#search-root');
  root.classList.remove('open');
  document.body.classList.remove('searching');
  setTimeout(() => { if (!searchOpen) root.innerHTML = ''; }, 380);
}
function applySearch() {
  state.q = sQuery.trim();
  saveRecent(state.q);
  closeSearch();
  if (state.view !== 'timeline') { state.view = 'timeline'; }
  render();
}

/* ── presentation mode ─────────────────────────────────────── */
let presOpen = false, presIdx = 0, presDir = 1, presSlides = [];
let presTimer = null, presIdleTimer = null;
/* photo choreography state: read-delay timer, physics frame, stage props */
let presPhotoTimer = null, presPhotoRaf = null, presFlyer = null, presPrintbar = null;
let presLanded = new Set();
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildSlides() {
  const evs = filtered();
  const slides = [];
  let year;
  for (const e of evs) {
    const y = e.year ?? 'Undated';
    if (y !== year) {
      year = y;
      slides.push({ kind: 'year', year: y, count: evs.filter(x => (x.year ?? 'Undated') === y).length });
    }
    slides.push({ kind: 'event', e });
  }
  return slides;
}

function slideHTML(s) {
  if (s.kind === 'year') {
    return `<div class="p-slide year">
      <h2>${esc(String(s.year))}</h2>
      <p>${s.count} ${s.count === 1 ? 'moment' : 'moments'}</p>
    </div>`;
  }
  const e = s.e;
  const pairs = firstMeets().get(e.id) || [];
  const ppl = [e.person, ...e.rel].filter(Boolean);
  // each slide's print lands at its own small deterministic tilt
  const tilt = (((presIdx * 41) % 8) - 3.5).toFixed(1);
  // photo-less slides get a ghosted hedcut of the moment's main face
  const hed = e.photo ? null : [e.person, ...e.rel].map(hedcut).find(Boolean);
  return `<div class="p-slide ev${e.photo ? ' has-photo' : ''}" style="--tc:${typeVar(e.type)}">
    ${hed ? `<div class="p-hed" aria-hidden="true"><img src="${esc(hed)}" alt="" decoding="async" draggable="false"></div>` : ''}
    <div class="p-meta">
      <span class="tbadge big">${typeIcon(e.type)}<span>${esc(e.type)}</span></span>
      <span class="p-date">${icon('calendar')}${esc(e.when.label)}</span>
      ${e.loc ? `<span class="p-date">${icon('pin')}${esc(e.loc)}</span>` : ''}
      ${scopePill(e.scope)}
    </div>
    <p class="p-note${e.note.length > 130 ? ' long' : ''}">${esc(e.note)}</p>
    ${pairs.length ? `<div class="p-firsts">${pairs.slice(0, 3).map(([a, b]) =>
      `<span class="fpair big">${icon('spark')}${esc(a)} met ${esc(b)}</span>`).join('')}
      ${pairs.length > 3 ? `<span class="fpair big more">+${pairs.length - 3} more firsts</span>` : ''}</div>` : ''}
    ${ppl.length ? `<div class="p-people">${ppl.map((n, i) =>
      `<span class="p-person" style="--i:${i}">${avatar(n, 'xl')}<span>${esc(n)}</span></span>`).join('')}</div>` : ''}
    ${e.photo ? `
    <div class="p-photo" data-act="photo-view" data-v="${e.id}" role="button" tabindex="0"
      aria-label="View photo full size" style="--ar:${photoRatio(e.photo)};--tilt:${tilt}deg">
      <figure class="p-photo-fig">
        <img src="${esc(e.photo.src)}" alt="${esc(photoAlt(e))}" decoding="async" draggable="false">
      </figure>
    </div>` : ''}
  </div>`;
}

/* photo print-and-drop: after a beat for reading, the slide's photo slowly
   feeds down from the top edge of the screen like a print coming out of a
   slot, hangs for a moment, then falls under gravity — bouncing and
   tilting — into its place in the scene */
function cancelSlidePhoto() {
  clearTimeout(presPhotoTimer); presPhotoTimer = null;
  cancelAnimationFrame(presPhotoRaf); presPhotoRaf = null;
  presFlyer?.remove(); presFlyer = null;
  presPrintbar?.remove(); presPrintbar = null;
}

function armSlidePhoto() {
  const slot = $('#p-slide-wrap .p-photo');
  if (!slot) return;
  if (presLanded.has(presIdx)) { slot.classList.add('landed'); return; }
  if (reducedMotion()) {
    presPhotoTimer = setTimeout(() => {
      slot.classList.add('landed');
      presLanded.add(presIdx);
    }, 900);
    return;
  }
  presPhotoTimer = setTimeout(() => startPhotoPrint(slot), 2400);
}

function startPhotoPrint(slot) {
  const stage = $('.p-stage');
  if (!stage || !slot.isConnected) return;
  // nobody's watching a hidden tab — and its throttled timers would tear
  // the choreography apart. Just set the photo in place.
  if (document.hidden) { landPhoto(slot); return; }
  const img = slot.querySelector('img');
  if (!img.complete) {
    // paper's not in the tray yet — print as soon as the photo loads
    img.addEventListener('load', () => { if (presOpen && slot.isConnected) startPhotoPrint(slot); }, { once: true });
    img.addEventListener('error', () => slot.classList.add('broken'), { once: true });
    return;
  }
  if (!img.naturalWidth) { slot.classList.add('broken'); return; }

  const rect = slot.getBoundingClientRect();
  const tiltT = parseFloat(slot.style.getPropertyValue('--tilt')) || 0;

  presPrintbar = document.createElement('div');
  presPrintbar.className = 'p-printslot';
  presPrintbar.style.left = rect.left - 14 + 'px';
  presPrintbar.style.width = rect.width + 28 + 'px';
  stage.appendChild(presPrintbar);

  presFlyer = document.createElement('div');
  presFlyer.className = 'p-flyer';
  presFlyer.style.left = rect.left + 'px';
  presFlyer.style.width = rect.width + 'px';
  presFlyer.innerHTML = slot.querySelector('.p-photo-fig').outerHTML;
  presFlyer.style.transform = `translateY(${-Math.ceil(rect.height) - 8}px)`;
  stage.appendChild(presFlyer);

  const PRINT_MS = 2300, HANG_Y = 14, HOLD_MS = 320;
  presPhotoRaf = requestAnimationFrame(() => { presPhotoRaf = requestAnimationFrame(() => {
    if (!presFlyer) return;
    presPrintbar?.classList.add('on');
    presFlyer.classList.add('printing');
    presFlyer.style.transform = `translateY(${HANG_Y}px)`;
  }); });
  // transitionend is unreliable if the tab loses focus — pace by clock
  presPhotoTimer = setTimeout(() => {
    presPhotoTimer = setTimeout(() => dropPhoto(slot, tiltT, HANG_Y), HOLD_MS);
  }, PRINT_MS + 60);
}

function dropPhoto(slot, tiltT, y0) {
  if (!presFlyer || !slot.isConnected) return;
  cancelAnimationFrame(presPhotoRaf); presPhotoRaf = null; // a late print-start frame must not fire mid-drop
  if (document.hidden) { landPhoto(slot); return; }
  const fig = presFlyer.querySelector('.p-photo-fig');
  presFlyer.classList.remove('printing');
  presPrintbar?.classList.remove('on');
  const yT = slot.getBoundingClientRect().top;
  if (yT <= y0 + 4) { landPhoto(slot); return; }

  const G = 3400, REST = 0.33;
  let y = y0, v = 0, a = 0, av = 6, bounces = 0, settled = false;
  let last = performance.now();
  const step = now => {
    if (document.hidden) { landPhoto(slot); return; } // tab hidden mid-fall: settle instantly
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    v += G * dt; y += v * dt;
    // the tilt is a damped spring the bounces keep kicking
    av += ((tiltT - a) * 90 - av * 7) * dt;
    a += av * dt;
    if (y >= yT) {
      y = yT;
      const impact = Math.abs(v);
      if (impact < 170 || bounces >= 2) settled = true;
      else {
        v = -v * REST; bounces++;
        av += (bounces % 2 ? -1 : 1) * Math.min(34, impact / 55);
      }
    }
    presFlyer.style.transform = `translateY(${y}px)`;
    fig.style.transform = `rotate(${a.toFixed(2)}deg)`;
    if (!settled) { presPhotoRaf = requestAnimationFrame(step); return; }
    // let the last few degrees of tilt ease out, then swap in the real slot
    fig.style.transition = 'transform .3s var(--spring)';
    fig.style.transform = `rotate(${tiltT}deg)`;
    presPhotoTimer = setTimeout(() => landPhoto(slot), 300);
  };
  presPhotoRaf = requestAnimationFrame(step);
}

function landPhoto(slot) {
  slot.classList.add('landed');
  presLanded.add(presIdx);
  cancelSlidePhoto();
}

function renderSlide() {
  const wrap = $('#p-slide-wrap');
  if (!wrap) return;
  cancelSlidePhoto();
  const s = presSlides[presIdx];
  wrap.innerHTML = slideHTML(s);
  wrap.firstElementChild.classList.add(presDir >= 0 ? 'fwd' : 'back');
  armSlidePhoto();

  // the glow lives on a persistent stage layer, decoupled from the slide's
  // entrance transform — it cross-morphs color and drifts per slide
  const bg = $('#p-bg');
  if (bg) {
    if (s.kind === 'event') {
      bg.style.setProperty('--glow', `color-mix(in srgb, ${typeVar(s.e.type)} 18%, transparent)`);
      bg.style.setProperty('--g1x', `${58 + ((presIdx * 37) % 30)}%`);
      bg.style.setProperty('--g1y', `${6 + ((presIdx * 23) % 22)}%`);
      bg.style.setProperty('--g2x', `${4 + ((presIdx * 29) % 26)}%`);
    } else {
      bg.style.setProperty('--glow', 'transparent');
    }
  }

  $('#p-bar').style.width = `${((presIdx + 1) / presSlides.length) * 100}%`;
  $('#p-count').textContent = `${presIdx + 1} / ${presSlides.length}`;
  $('.p-nav.prev')?.classList.toggle('off', presIdx === 0);
  $('.p-nav.next')?.classList.toggle('off', presIdx === presSlides.length - 1);
}

function presGo(dir) {
  const next = presIdx + dir;
  if (next < 0 || next >= presSlides.length) {
    if (dir > 0) presPlayStop();
    return;
  }
  presIdx = next; presDir = dir;
  renderSlide();
  if (presTimer) presArmAuto(); // restart the clock for the slide we're now on
}

/* autoplay paces itself per slide: photo slides get extra dwell so the
   print-and-drop can finish and the picture can actually be looked at */
function presArmAuto() {
  clearTimeout(presTimer);
  const s = presSlides[presIdx];
  presTimer = setTimeout(() => presGo(1), s?.kind === 'event' && s.e.photo ? 9600 : 7000);
}
function presPlayStop() {
  clearTimeout(presTimer); presTimer = null;
  const b = $('#p-play');
  if (b) b.innerHTML = icon('play');
}
function presPlayToggle() {
  if (presTimer) { presPlayStop(); return; }
  $('#p-play').innerHTML = icon('pause');
  presArmAuto();
  presGo(1);
}

function armPresIdle(stage) {
  const wake = () => {
    stage.classList.remove('idle');
    clearTimeout(presIdleTimer);
    presIdleTimer = setTimeout(() => stage.classList.add('idle'), 3200);
  };
  stage.addEventListener('pointermove', wake);
  wake();
}

function openPresent() {
  presSlides = buildSlides();
  if (!presSlides.length) { toast('Nothing to present — adjust the filters first'); return; }
  presOpen = true; presIdx = 0; presDir = 1;
  presLanded = new Set();
  document.body.classList.add('presenting');
  const root = $('#present-root');
  root.innerHTML = `
  <div class="p-stage">
    <div class="p-top">
      <div class="p-progress"><i id="p-bar"></i></div>
      <div class="p-controls">
        <span id="p-count" class="p-countlabel"></span>
        <button class="hbtn p-btn" id="p-play" data-act="pres-play" aria-label="Autoplay">${icon('play')}</button>
        <button class="hbtn p-btn" data-act="pres-close" aria-label="Exit presentation">${icon('x')}</button>
      </div>
    </div>
    <div class="p-bg" id="p-bg" aria-hidden="true"></div>
    <div class="p-zone left" data-act="pres-prev" aria-hidden="true"></div>
    <div class="p-zone right" data-act="pres-next" aria-hidden="true"></div>
    <div id="p-slide-wrap"></div>
    <button class="p-nav prev" data-act="pres-prev" aria-label="Previous">${icon('chevleft')}</button>
    <button class="p-nav next" data-act="pres-next" aria-label="Next">${icon('chevron')}</button>
  </div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  renderSlide();
  armPresIdle(root.querySelector('.p-stage'));
  document.documentElement.requestFullscreen?.().catch(() => {});
}

function closePresent(exitFs = true) {
  if (!presOpen) return;
  presOpen = false;
  presPlayStop();
  cancelSlidePhoto();
  clearTimeout(presIdleTimer);
  const root = $('#present-root');
  root.classList.remove('open');
  document.body.classList.remove('presenting');
  setTimeout(() => { if (!presOpen) root.innerHTML = ''; }, 450);
  if (exitFs && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && presOpen) closePresent(false);
});

/* ── photo viewer (full-size, native-feel zoom & pan) ──────── */
/* transform model: the image sits flex-centered at its "fit" (contain)
   size; everything else is translate(tx,ty) scale(s) around the center.
   Pinch, wheel, double-tap, momentum pans, rubber-band edges, and a
   swipe-down dismissal — the gestures a photo viewer is expected to have. */
const PV = {
  open: false, e: null, sourceEl: null,
  natW: 4, natH: 3, s: 1, tx: 0, ty: 0,
  ptrs: new Map(), gs: null, moved: false,
  vx: 0, vy: 0, raf: null, tapTimer: null, lastTap: 0, lastTapX: 0, lastTapY: 0,
  dismissY: 0,
};
const pvClamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function pvFit(s = 1) {
  const r = Math.min(innerWidth / PV.natW, innerHeight / PV.natH);
  return { fitW: PV.natW * r * s, fitH: PV.natH * r * s };
}
function pvBounds(s = PV.s) {
  const { fitW, fitH } = pvFit(s);
  return { mx: Math.max(0, (fitW - innerWidth) / 2), my: Math.max(0, (fitH - innerHeight) / 2) };
}
function pvApply(s, tx, ty) {
  PV.s = s; PV.tx = tx; PV.ty = ty;
  const img = $('#pv-img');
  if (img) img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  $('#pv')?.classList.toggle('zoomed', s > 1.02);
}
/* interrupt any in-flight transition and adopt wherever it actually is */
function pvFreeze() {
  const img = $('#pv-img');
  if (!img || !img.style.transition) return;
  const m = new DOMMatrixReadOnly(getComputedStyle(img).transform);
  img.style.transition = '';
  pvApply(m.a || 1, m.e, m.f);
}

function openPhoto(id, sourceEl) {
  const e = state.events.find(x => x.id === id);
  if (!e?.photo || PV.open) return;
  if (presTimer) presPlayStop(); // don't let autoplay change slides underneath
  Object.assign(PV, { open: true, e, sourceEl: sourceEl || null, s: 1, tx: 0, ty: 0, vx: 0, vy: 0, moved: false, dismissY: 0 });
  PV.ptrs.clear(); PV.gs = null;
  PV.natW = e.photo.w || 4; PV.natH = e.photo.h || 3;

  $('#photo-root').innerHTML = `
  <div class="pv" id="pv">
    <div class="pv-bd"></div>
    <div class="pv-stage" id="pv-stage">
      <img class="pv-img" id="pv-img" src="${esc(e.photo.src)}" alt="${esc(photoAlt(e))}" draggable="false">
    </div>
    <button class="pv-close" data-act="photo-close" aria-label="Close photo">${icon('x')}</button>
    <div class="pv-cap">
      <b>${esc(e.note.length > 130 ? e.note.slice(0, 130) + '…' : e.note)}</b>
      <small>${esc(e.when.label)}${e.person ? ' · ' + esc(e.person) : ''}${e.loc ? ' · ' + esc(e.loc.split(',')[0]) : ''}</small>
    </div>
  </div>`;
  document.body.classList.add('viewing');
  requestAnimationFrame(() => $('#pv')?.classList.add('bd-in'));

  const img = $('#pv-img');
  const begin = () => {
    if (!PV.open || !$('#pv-img')) return;
    if (img.naturalWidth) { PV.natW = img.naturalWidth; PV.natH = img.naturalHeight; }
    pvLayout();
    pvEnter();
    pvBind();
  };
  if (img.complete && img.naturalWidth) begin();
  else { img.addEventListener('load', begin, { once: true }); img.addEventListener('error', () => closePhoto('instant'), { once: true }); }
}

function pvLayout() {
  const img = $('#pv-img');
  if (!img) return;
  const { fitW, fitH } = pvFit();
  img.style.width = fitW + 'px';
  img.style.height = fitH + 'px';
}

const pvSourceImg = () => {
  const el = PV.sourceEl;
  if (!el?.isConnected) return null;
  const im = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (!im) return null;
  const r = im.getBoundingClientRect();
  return (r.width > 4 && r.bottom > 0 && r.top < innerHeight) ? im : null;
};

/* genie in: grow from the thumbnail that was tapped */
function pvEnter() {
  const img = $('#pv-img'), pv = $('#pv');
  const srcImg = pvSourceImg();
  const { fitW } = pvFit();
  if (srcImg && !reducedMotion()) {
    const r = srcImg.getBoundingClientRect();
    pvApply(Math.max(r.width / fitW, 0.04), r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
    img.getBoundingClientRect(); // commit the start frame
  } else {
    pvApply(0.9, 0, innerHeight * 0.03);
    img.style.opacity = '0';
  }
  img.style.transition = 'transform .46s var(--spring), opacity .32s ease';
  img.style.opacity = '1';
  pvApply(1, 0, 0);
  pv.classList.add('in');
  setTimeout(() => { const i = $('#pv-img'); if (i) i.style.transition = ''; }, 500);
}

function closePhoto(mode = 'auto') {
  if (!PV.open) return;
  PV.open = false;
  cancelAnimationFrame(PV.raf); PV.raf = null;
  clearTimeout(PV.tapTimer);
  const pv = $('#pv'), img = $('#pv-img'), stage = $('#pv-stage');
  pv?.classList.remove('in', 'bd-in');
  const srcImg = mode === 'auto' ? pvSourceImg() : null;
  if (img && mode !== 'instant' && !reducedMotion()) {
    if (mode === 'drop') {
      stage.style.transition = 'transform .34s ease-in, opacity .3s ease';
      stage.style.transform = `translateY(${PV.dismissY + innerHeight * 0.5}px) scale(.86)`;
      stage.style.opacity = '0';
    } else if (srcImg) {
      const r = srcImg.getBoundingClientRect();
      const { fitW } = pvFit();
      img.style.transition = 'transform .4s var(--spring), opacity .34s ease .1s';
      pvApply(Math.max(r.width / fitW, 0.04), r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
      img.style.opacity = '0';
    } else {
      img.style.transition = 'transform .32s ease, opacity .28s ease';
      pvApply(PV.s * 0.92, PV.tx, PV.ty + 36);
      img.style.opacity = '0';
    }
  }
  document.body.classList.remove('viewing');
  const src = PV.sourceEl;
  PV.sourceEl = null; PV.e = null;
  setTimeout(() => { if (!PV.open) $('#photo-root').innerHTML = ''; }, mode === 'instant' ? 0 : 430);
  if (src?.isConnected && src.tabIndex >= 0) src.focus({ preventScroll: true });
}

/* gesture plumbing */
function pvBind() {
  const stage = $('#pv-stage');
  if (!stage) return;
  stage.addEventListener('pointerdown', pvDown);
  stage.addEventListener('pointermove', pvMove);
  stage.addEventListener('pointerup', pvUp);
  stage.addEventListener('pointercancel', pvUp);
  stage.addEventListener('wheel', pvWheel, { passive: false });
  stage.addEventListener('gesturestart', ev => ev.preventDefault()); // legacy Safari pinch
}

const pvMid = () => {
  const [a, b] = [...PV.ptrs.values()];
  return { x: (a.x + b.x) / 2 - innerWidth / 2, y: (a.y + b.y) / 2 - innerHeight / 2, d: Math.hypot(a.x - b.x, a.y - b.y) };
};

function pvDown(ev) {
  const stage = $('#pv-stage');
  try { stage.setPointerCapture(ev.pointerId); } catch { /* synthetic or stale pointer */ }
  cancelAnimationFrame(PV.raf); PV.raf = null;
  pvFreeze();
  PV.ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (PV.ptrs.size === 1) {
    PV.moved = false;
    PV.vx = PV.vy = 0;
    PV.gs = { kind: PV.s > 1.02 ? 'pan' : 'press', x0: ev.clientX, y0: ev.clientY, tx0: PV.tx, ty0: PV.ty, t0: performance.now(), lx: ev.clientX, ly: ev.clientY, lt: performance.now() };
  } else if (PV.ptrs.size === 2) {
    const m = pvMid();
    PV.gs = { kind: 'pinch', s0: PV.s, tx0: PV.tx, ty0: PV.ty, m0: m, d0: Math.max(m.d, 12) };
  }
}

function pvMove(ev) {
  if (!PV.ptrs.has(ev.pointerId) || !PV.gs) return;
  PV.ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  const g = PV.gs;

  if (g.kind === 'pinch' && PV.ptrs.size >= 2) {
    const m = pvMid();
    let s = g.s0 * m.d / g.d0;
    s = s < 1 ? 1 - (1 - s) * 0.45 : s > 5 ? 5 + (s - 5) * 0.18 : s; // rubbery limits
    const k = s / g.s0;
    pvApply(s, m.x - (g.m0.x - g.tx0) * k, m.y - (g.m0.y - g.ty0) * k);
    PV.moved = true;
    return;
  }

  const dx = ev.clientX - g.x0, dy = ev.clientY - g.y0;
  if (Math.hypot(dx, dy) > 7) PV.moved = true;

  if (g.kind === 'pan') {
    const now = performance.now(), dt = Math.max(now - g.lt, 1);
    PV.vx = 0.82 * PV.vx + 0.18 * ((ev.clientX - g.lx) / dt * 1000);
    PV.vy = 0.82 * PV.vy + 0.18 * ((ev.clientY - g.ly) / dt * 1000);
    g.lx = ev.clientX; g.ly = ev.clientY; g.lt = now;
    const { mx, my } = pvBounds();
    const rub = (v, m) => v < -m ? -m + (v + m) * 0.16 : v > m ? m + (v - m) * 0.16 : v;
    pvApply(PV.s, rub(g.tx0 + dx, mx), rub(g.ty0 + dy, my));
  } else if (g.kind === 'press' && PV.moved) {
    // unzoomed vertical drag = pull the photo off the screen
    PV.dismissY = dy;
    const stage = $('#pv-stage'), pv = $('#pv');
    const k = Math.min(Math.abs(dy) / 340, 1);
    stage.style.transform = `translateY(${dy}px) scale(${1 - k * 0.1})`;
    pv.style.setProperty('--bd', String(1 - k * 0.72));
  }
}

function pvUp(ev) {
  if (!PV.ptrs.has(ev.pointerId)) return;
  PV.ptrs.delete(ev.pointerId);
  const g = PV.gs;

  if (PV.ptrs.size === 1 && g?.kind === 'pinch') {
    // one finger lifted mid-pinch: continue as a pan
    const p = [...PV.ptrs.values()][0];
    PV.gs = { kind: 'pan', x0: p.x, y0: p.y, tx0: PV.tx, ty0: PV.ty, t0: performance.now(), lx: p.x, ly: p.y, lt: performance.now() };
    return;
  }
  if (PV.ptrs.size) return;
  PV.gs = null;
  if (!g) return;

  if (g.kind === 'press' && PV.moved) {
    if (Math.abs(PV.dismissY) > 96 || Math.abs(PV.vy) > 640) { closePhoto('drop'); return; }
    const stage = $('#pv-stage'), pv = $('#pv');
    stage.style.transition = 'transform .38s var(--spring)';
    stage.style.transform = '';
    pv.style.setProperty('--bd', '1');
    setTimeout(() => { const s = $('#pv-stage'); if (s) s.style.transition = ''; }, 400);
    PV.dismissY = 0;
    return;
  }

  if (!PV.moved) { pvTap(ev); return; }

  if (g.kind === 'pinch' || PV.s !== pvClamp(PV.s, 1, 5)) { pvSettle(); return; }
  if (g.kind === 'pan') {
    const { mx, my } = pvBounds();
    if (PV.tx !== pvClamp(PV.tx, -mx, mx) || PV.ty !== pvClamp(PV.ty, -my, my)) pvSettle();
    else if (Math.hypot(PV.vx, PV.vy) > 160) pvFling();
  }
}

function pvTap(ev) {
  const now = performance.now();
  const isDouble = now - PV.lastTap < 300 && Math.hypot(ev.clientX - PV.lastTapX, ev.clientY - PV.lastTapY) < 44;
  PV.lastTap = now; PV.lastTapX = ev.clientX; PV.lastTapY = ev.clientY;
  clearTimeout(PV.tapTimer);
  if (isDouble) { PV.lastTap = 0; pvDoubleZoom(ev.clientX, ev.clientY); return; }
  // pointer capture retargets events to the stage, so hit-test by geometry
  const r = $('#pv-img')?.getBoundingClientRect();
  const onImg = !!r && ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  PV.tapTimer = setTimeout(() => {
    if (!PV.open) return;
    if (onImg) $('#pv')?.classList.toggle('chromeless');
    else closePhoto();
  }, 270);
}

function pvDoubleZoom(cx, cy) {
  const img = $('#pv-img');
  if (!img) return;
  let s, tx, ty;
  if (PV.s > 1.02) { s = 1; tx = 0; ty = 0; }
  else {
    s = 2.6;
    const px = cx - innerWidth / 2, py = cy - innerHeight / 2;
    const k = s / PV.s;
    const { mx, my } = pvBounds(s);
    tx = pvClamp(px - (px - PV.tx) * k, -mx, mx);
    ty = pvClamp(py - (py - PV.ty) * k, -my, my);
  }
  img.style.transition = 'transform .4s var(--spring)';
  pvApply(s, tx, ty);
  setTimeout(() => { const i = $('#pv-img'); if (i) i.style.transition = ''; }, 420);
}

function pvWheel(ev) {
  ev.preventDefault();
  pvFreeze();
  const factor = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.011 : 0.0023));
  const s = pvClamp(PV.s * factor, 1, 5);
  const px = ev.clientX - innerWidth / 2, py = ev.clientY - innerHeight / 2;
  const k = s / PV.s;
  const { mx, my } = pvBounds(s);
  pvApply(s, pvClamp(px - (px - PV.tx) * k, -mx, mx), pvClamp(py - (py - PV.ty) * k, -my, my));
}

function pvSettle() {
  const img = $('#pv-img');
  if (!img) return;
  const s = pvClamp(PV.s, 1, 5);
  const { mx, my } = pvBounds(s);
  const tx = s <= 1.001 ? 0 : pvClamp(PV.tx, -mx, mx);
  const ty = s <= 1.001 ? 0 : pvClamp(PV.ty, -my, my);
  if (s === PV.s && tx === PV.tx && ty === PV.ty) return;
  img.style.transition = 'transform .36s var(--spring)';
  pvApply(s, tx, ty);
  setTimeout(() => { const i = $('#pv-img'); if (i) i.style.transition = ''; }, 380);
}

function pvFling() {
  let last = performance.now();
  const step = now => {
    if (!PV.open) return;
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const decay = Math.exp(-dt * 5.4);
    PV.vx *= decay; PV.vy *= decay;
    const { mx, my } = pvBounds();
    let tx = PV.tx + PV.vx * dt, ty = PV.ty + PV.vy * dt;
    if (tx <= -mx || tx >= mx) { tx = pvClamp(tx, -mx, mx); PV.vx = 0; }
    if (ty <= -my || ty >= my) { ty = pvClamp(ty, -my, my); PV.vy = 0; }
    pvApply(PV.s, tx, ty);
    if (Math.hypot(PV.vx, PV.vy) > 24) PV.raf = requestAnimationFrame(step);
  };
  PV.raf = requestAnimationFrame(step);
}

addEventListener('resize', () => { if (PV.open) { pvLayout(); pvSettle(); } });

/* ── toast ─────────────────────────────────────────────────── */
let toastTimer = null;
function toast(msg) {
  const root = $('#toast-root');
  root.innerHTML = `<div class="toast">${esc(msg)}</div>`;
  requestAnimationFrame(() => root.firstElementChild.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => root.firstElementChild?.classList.remove('show'), 2600);
}

/* ── interactions ──────────────────────────────────────────── */
const toggle = (set, v) => set.has(v) ? set.delete(v) : set.add(v);

function goTimeline() {
  const dir = -1;
  state.view = 'timeline';
  state.scroll.timeline = 0;
  closeSheet();
  closeSearch();
  window.FWIENDS_CHAT?.closeView?.();
  render({ dir, restoreScroll: false });
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, v = el.dataset.v;

  switch (act) {
    case 'chat-tab': window.FWIENDS_CHAT?.toggle(); break;

    case 'tab': {
      window.FWIENDS_CHAT?.closeView?.();
      if (v === state.view) { window.scrollTo({ top: 0, behavior: 'smooth' }); break; }
      state.scroll[state.view] = window.scrollY;
      const dir = VIEWS.indexOf(v) - VIEWS.indexOf(state.view);
      state.view = v;
      state._anim = true;
      render({ dir });
      break;
    }
    case 'event-sheet':  eventSheet(v); break;
    case 'person-sheet': personSheet(v); break;
    case 'settings-sheet': settingsSheet(); break;
    case 'filter-sheet': filterSheet(el); break;
    case 'close-sheet':  closeSheet(); break;
    case 'apply-filters': closeSheet(); if (state.view !== 'timeline') goTimeline(); else render(); break;

    case 'set-mode':
      if (v !== state.mode) {
        state.mode = v;
        localStorage.setItem(LS_MODE, v);
        state._anim = false;
        render({ restoreScroll: false });
      }
      break;

    case 'pick': pickerSheet(el.dataset.k, el); break;
    case 'opt-all': pickerSet(el.dataset.k).clear(); softRender(); refreshPickerSheet(); break;
    case 'opt': {
      const k = el.dataset.k;
      toggle(pickerSet(k), k === 'year' ? +v : v);
      softRender(); refreshPickerSheet();
      break;
    }

    case 'gcompare': toggle(state.compare, v); softRender(); break;
    case 'cmp-clear': state.compare.clear(); softRender(); break;

    case 'photo-view': openPhoto(v, el); break;
    case 'photo-close': closePhoto(); break;

    case 'pres-open': openPresent(); break;
    case 'pres-close': closePresent(); break;
    case 'pres-next': presGo(1); break;
    case 'pres-prev': presGo(-1); break;
    case 'pres-play': presPlayToggle(); break;

    case 'open-search': openSearch(); break;
    case 'close-search': closeSearch(); break;
    case 'search-apply': applySearch(); break;
    case 'search-sugg': {
      sQuery = v;
      const input = $('#sq');
      if (input) { input.value = v; input.focus({ preventScroll: true }); }
      renderSearchBody();
      break;
    }
    case 'search-clear-recents': localStorage.removeItem(LS_RECENTS); renderSearchBody(); break;
    case 'search-random': {
      const evs = state.events;
      if (evs.length) eventSheet(evs[Math.floor(Math.random() * evs.length)].id);
      break;
    }

    case 'ftype':  toggle(state.types, v);  sheetOpen ? (softRender(), refreshFilterSheet()) : render(); break;
    case 'fperson': toggle(state.people, v); sheetOpen ? (softRender(), refreshFilterSheet()) : render(); break;
    case 'fplace': toggle(state.places, v); sheetOpen ? (softRender(), refreshFilterSheet()) : render(); break;
    case 'fyear':  toggle(state.years, +v || v); sheetOpen ? (softRender(), refreshFilterSheet()) : render(); break;
    case 'fscope': state.scope = v; sheetOpen ? (softRender(), refreshFilterSheet()) : render(); break;

    case 'ftype-go':   state.types = new Set([v]); goTimeline(); break;
    case 'fperson-go': state.people = new Set([v]); goTimeline(); break;
    case 'fplace-go':  state.places = new Set([v]); goTimeline(); break;
    case 'fyear-go':   state.years = new Set([+v]); goTimeline(); break;

    case 'clear-filters':
      state.types.clear(); state.people.clear(); state.places.clear();
      state.years.clear(); state.scope = ''; state.q = '';
      if (sheetOpen) { softRender(); refreshFilterSheet(); refreshPickerSheet(); }
      else { render(); toast('Filters cleared'); }
      break;
    case 'clear-q': state.q = ''; render(); break;

    case 'sheet-connect': {
      const url = $('#sheet-url')?.value.trim();
      if (!url) { settingsSheet('Paste a Google Sheets link first.'); break; }
      el.classList.add('busy');
      connectSheet(url)
        .then(() => { closeSheet(); state.view = 'timeline'; render(); })
        .catch(err => settingsSheet(err.message || 'Couldn’t load that sheet.'));
      break;
    }
    case 'sheet-refresh':
      connectSheet(state.src.url)
        .then(() => { closeSheet(); render(); })
        .catch(err => settingsSheet(err.message || 'Couldn’t refresh.'));
      break;
    case 'sheet-sample':
      localStorage.removeItem(LS_KEY);
      state.events = buildEvents(window.POD_SEED);
      state.src = { kind: 'sample', url: '', at: null };
      closeSheet(); render(); toast('Back to sample data');
      break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (PV.open) closePhoto();
    else if (sheetOpen) closeSheet();
    else if (presOpen) closePresent();
    else if (searchOpen) closeSearch();
  }
  // photo figures are role="button" spans/figures — honor Enter and Space
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[data-act="photo-view"]')) {
    e.preventDefault(); e.target.click(); return;
  }
  if (presOpen && !PV.open && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); presGo(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); presGo(-1); }
    if (e.key.toLowerCase() === 'p') presPlayToggle();
  }
  if (e.key === 'Enter' && e.target.id === 'sheet-url') $('[data-act="sheet-connect"]')?.click();
  if (e.key === 'Enter' && e.target.id === 'sq') applySearch();
});

/* compact top bar on scroll */
addEventListener('scroll', () => {
  $('#cbar').classList.toggle('on', window.scrollY > 64);
}, { passive: true });

/* ── data bridge for the AI assistant widget ───────────────── */
window.FWIENDS = {
  // the entire dataset, in plain rows the archivist can reason over
  data: () => state.events.map(e => ({
    year: e.year, when: e.when.label, person: e.person, kind: e.type,
    place: e.loc, scope: e.scope, with: e.rel, note: e.note,
  })),
  face: name => hedcut(name),
  hue: name => hueOf(name),
  openPerson: name => personSheet(name),
};

/* ── boot ──────────────────────────────────────────────────── */
async function boot() {
  state.events = buildEvents(window.POD_SEED);
  state._anim = true;
  render();
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try { await connectSheet(saved, { silent: true }); render(); toast('Synced from your sheet'); }
    catch { toast('Couldn’t reach your sheet — showing sample data'); }
  }
}
boot();
})();
