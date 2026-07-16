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
  arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  heart:    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  star:     '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  userplus: '<path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><line x1="19.5" y1="8" x2="19.5" y2="14"/><line x1="22.5" y1="11" x2="16.5" y2="11"/>',
  case:     '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  box:      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  link:     '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  spark:    '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/>',
  table:    '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>',
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
const avatar = (name, cls = '') => {
  const h = hueOf(name);
  return `<span class="avatar ${cls}" style="background:linear-gradient(135deg, hsl(${h} 72% 58%), hsl(${(h + 24) % 360} 72% 42%))">${esc(initials(name))}</span>`;
};

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
const VIEW_TITLE = { timeline: 'Timeline', people: 'People', places: 'Places', insights: 'Insights' };
const LS_KEY = 'podtl.sheet.v1';

const state = {
  view: 'timeline',
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
        sort: (r.y ?? 9999) * 10000 + when.m * 100 + when.day,
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
function eventCard(e, i) {
  return `
  <article class="card ev" data-act="event-sheet" data-v="${e.id}" style="--tc:${typeVar(e.type)};--i:${i % 8}" tabindex="0">
    <span class="raildot"></span>
    <header class="ev-head">
      <span class="tbadge">${typeIcon(e.type)}<span>${esc(e.type)}</span></span>
      <time>${esc(e.when.label)}</time>
    </header>
    <p class="ev-note">${esc(e.note)}</p>
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
  const groups = new Map();
  for (const e of evs) {
    const k = e.year ?? 'Undated';
    (groups.get(k) || groups.set(k, []).get(k)).push(e);
  }
  let i = 0;
  return [...groups.entries()].map(([year, list]) => `
    <section class="ygroup" id="yg-${year}" data-year="${year}">
      <div class="yhead"><h2>${year}</h2><span>${list.length} ${list.length === 1 ? 'moment' : 'moments'}</span></div>
      <div class="rail">${list.map(e => eventCard(e, i++)).join('')}</div>
    </section>`).join('');
}

function activeFilterChips() {
  const bits = [];
  for (const t of state.types) bits.push(['ftype', t, typeIcon(t) + esc(t)]);
  for (const p of state.people) bits.push(['fperson', p, avatar(p, 'xs') + esc(p)]);
  for (const l of state.places) bits.push(['fplace', l, icon('pin') + esc(l)]);
  for (const y of state.years) bits.push(['fyear', y, icon('calendar') + esc(y)]);
  if (state.scope) bits.push(['fscope', state.scope, esc(state.scope)]);
  if (!bits.length) return '';
  return `<div class="chiprow active-filters">
    ${bits.map(([act, v, label]) =>
      `<button class="chip fchip on" data-act="${act}" data-v="${esc(v)}">${label}${icon('x', 'xs-ic')}</button>`).join('')}
    <button class="chip clear" data-act="clear-filters">Clear all</button>
  </div>`;
}

function timelineHTML() {
  const evs = filtered();
  const [y0, y1] = yearsRange();
  const total = state.events.length;
  const typeCounts = new Map();
  for (const e of state.events) typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
  const presentTypes = TYPE_ORDER.filter(t => typeCounts.has(t));
  const years = [...new Set(state.events.map(e => e.year).filter(Boolean))].sort();
  const fc = filterCount();

  return `
  <div class="view v-timeline">
    <div class="lhead">
      <div class="lrow">
        <h1>Timeline</h1>
        <div class="hbtns">
          <button class="hbtn" data-act="settings-sheet" aria-label="Data source & settings">${icon('gear')}</button>
          <button class="hbtn${fc ? ' badged' : ''}" data-act="filter-sheet" aria-label="Filters" data-badge="${fc || ''}">${icon('sliders')}</button>
        </div>
      </div>
      <p class="sub">${evs.length === total ? total : evs.length + ' of ' + total} moments${y0 ? ` · ${y0}–${y1}` : ''}${state.src.kind === 'sheet' ? ' · synced' : ''}</p>
      <label class="searchwrap">${icon('search')}<input id="q" type="search" placeholder="Search moments, people, places" value="${esc(state.q)}" autocomplete="off">${state.q ? `<button class="clearq" data-act="clear-q" aria-label="Clear search">${icon('x')}</button>` : ''}</label>
      <div class="chiprow">
        <button class="chip tchip all${state.types.size ? '' : ' on'}" data-act="ftype-all">All</button>
        ${presentTypes.map(t => typeChip(t, typeCounts.get(t), state.types.has(t))).join('')}
      </div>
      ${years.length > 1 ? `<div class="chiprow yearrow">${years.map(y =>
        `<button class="chip ypill" data-act="jump-year" data-v="${y}">${y}</button>`).join('')}</div>` : ''}
      ${activeFilterChips()}
    </div>
    <div id="tl-content" class="tl-content">${timelineGroupsHTML()}</div>
  </div>`;
}

/* ── people view ───────────────────────────────────────────── */
function peopleHTML() {
  const people = allPeople();
  return `
  <div class="view v-people">
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
  <div class="view v-places">
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
  <div class="view v-insights">
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

let revealIO = null, yearIO = null;
function afterRender() {
  $('#cbar-title').textContent = VIEW_TITLE[state.view];

  $$('#tabbar .tab').forEach(b => b.classList.toggle('on', b.dataset.v === state.view));

  const q = $('#q');
  if (q) q.addEventListener('input', onSearch);

  revealIO?.disconnect();
  revealIO = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.card').forEach(c => revealIO.observe(c));

  yearIO?.disconnect();
  const groups = $$('.ygroup');
  if (groups.length) {
    yearIO = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) {
          const y = en.target.dataset.year;
          $$('.ypill').forEach(p => p.classList.toggle('on', p.dataset.v === y));
        }
      }
    }, { rootMargin: '-25% 0px -65% 0px' });
    groups.forEach(g => yearIO.observe(g));
  }
}

function render({ dir = 0, restoreScroll = true } = {}) {
  const main = $('#main');
  const doIt = () => {
    main.innerHTML = viewHTML();
    afterRender();
    if (restoreScroll) window.scrollTo({ top: state.scroll[state.view] || 0 });
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.dir = dir > 0 ? 'fwd' : dir < 0 ? 'back' : 'fade';
    document.startViewTransition(doIt);
  } else doIt();
}

function refreshTimelineContent() {
  const c = $('#tl-content');
  if (c) { c.innerHTML = timelineGroupsHTML(); $$('.card', c).forEach(el => revealIO.observe(el)); }
}

/* ── sheets (modal bottom sheets) ──────────────────────────── */
let sheetOpen = false;
function openSheet(html, cls = '') {
  const root = $('#sheet-root');
  root.innerHTML = `
    <div class="backdrop" data-act="close-sheet"></div>
    <div class="sheet ${cls}" role="dialog" aria-modal="true">
      <div class="grabber" data-drag></div>
      <div class="sheet-body">${html}</div>
    </div>`;
  document.body.classList.add('locked');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  sheetOpen = true;
  enableSheetDrag(root.querySelector('.sheet'));
}
function closeSheet() {
  const root = $('#sheet-root');
  if (!sheetOpen) return;
  root.classList.remove('open');
  sheetOpen = false;
  setTimeout(() => { if (!sheetOpen) { root.innerHTML = ''; document.body.classList.remove('locked'); } }, 320);
}
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
  openSheet(`
    <div class="esheet" style="--tc:${typeVar(e.type)}">
      <div class="esheet-top">
        <span class="tbadge big">${typeIcon(e.type)}<span>${esc(e.type)}</span></span>
        ${scopePill(e.scope)}
      </div>
      <p class="esheet-note">${esc(e.note)}</p>
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
            ${icon('chevron', 'chev')}
          </button>`).join('')}
      </div>
    </div>`);
}

/* ── filter sheet ──────────────────────────────────────────── */
function filterSheetBody() {
  const people = allPeople();
  const places = allPlaces();
  const years = [...new Set(state.events.map(e => e.year).filter(Boolean))].sort();
  const typeCounts = new Map();
  for (const e of state.events) typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
  const n = filtered().length;

  return `
    <div class="fsheet">
      <div class="fsheet-head"><h2>Filters</h2>
        <button class="btn ghost" data-act="clear-filters">Reset</button>
      </div>

      <h4>Scope</h4>
      <div class="seg">
        ${['', 'Pod', 'Self'].map(s =>
          `<button class="seg-btn${state.scope === s ? ' on' : ''}" data-act="fscope" data-v="${s}">${s || 'All'}</button>`).join('')}
      </div>

      <h4>Kind</h4>
      <div class="chipwrap">
        ${TYPE_ORDER.filter(t => typeCounts.has(t)).map(t => typeChip(t, typeCounts.get(t), state.types.has(t))).join('')}
      </div>

      <h4>People</h4>
      <div class="chipwrap">
        ${people.map(p => `
          <button class="chip pchip${state.people.has(p.name) ? ' on' : ''}" data-act="fperson" data-v="${esc(p.name)}">
            ${avatar(p.name, 'xs')}<span>${esc(p.name)}</span><b>${p.count}</b></button>`).join('')}
      </div>

      <h4>Places</h4>
      <div class="chipwrap">
        ${places.map(p => `
          <button class="chip lchip${state.places.has(p.name) ? ' on' : ''}" data-act="fplace" data-v="${esc(p.name)}">
            ${icon('pin')}<span>${esc(p.name)}</span><b>${p.count}</b></button>`).join('')}
      </div>

      <h4>Years</h4>
      <div class="chipwrap">
        ${years.map(y => `
          <button class="chip ypill${state.years.has(y) ? ' on' : ''}" data-act="fyear" data-v="${y}">${y}</button>`).join('')}
      </div>

      <div class="sheet-actions">
        <button class="btn tint wide" data-act="apply-filters">Show ${n} ${n === 1 ? 'moment' : 'moments'}</button>
      </div>
    </div>`;
}
const filterSheet = () => openSheet(filterSheetBody(), 'tall');
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
      Columns: Year · Exact Date · Person · Event Type · Location · Type · Related People · Notes.</p>
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
let searchTimer = null;
function onSearch(e) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.q = e.target.value;
    refreshTimelineContent();
  }, 120);
}

const toggle = (set, v) => set.has(v) ? set.delete(v) : set.add(v);

function goTimeline() {
  const dir = -1;
  state.view = 'timeline';
  state.scroll.timeline = 0;
  closeSheet();
  render({ dir, restoreScroll: false });
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, v = el.dataset.v;

  switch (act) {
    case 'tab': {
      if (v === state.view) { window.scrollTo({ top: 0, behavior: 'smooth' }); break; }
      state.scroll[state.view] = window.scrollY;
      const dir = VIEWS.indexOf(v) - VIEWS.indexOf(state.view);
      state.view = v;
      render({ dir });
      break;
    }
    case 'event-sheet':  eventSheet(v); break;
    case 'person-sheet': personSheet(v); break;
    case 'settings-sheet': settingsSheet(); break;
    case 'filter-sheet': filterSheet(); break;
    case 'close-sheet':  closeSheet(); break;
    case 'apply-filters': closeSheet(); if (state.view !== 'timeline') goTimeline(); else render(); break;

    case 'ftype-all': state.types.clear(); render(); break;
    case 'ftype':  toggle(state.types, v);  sheetOpen ? refreshFilterSheet() : render(); break;
    case 'fperson': toggle(state.people, v); sheetOpen ? refreshFilterSheet() : render(); break;
    case 'fplace': toggle(state.places, v); sheetOpen ? refreshFilterSheet() : render(); break;
    case 'fyear':  toggle(state.years, +v || v); sheetOpen ? refreshFilterSheet() : render(); break;
    case 'fscope': state.scope = v; sheetOpen ? refreshFilterSheet() : render(); break;

    case 'ftype-go':   state.types = new Set([v]); goTimeline(); break;
    case 'fperson-go': state.people = new Set([v]); goTimeline(); break;
    case 'fplace-go':  state.places = new Set([v]); goTimeline(); break;
    case 'fyear-go':   state.years = new Set([+v]); goTimeline(); break;

    case 'clear-filters':
      state.types.clear(); state.people.clear(); state.places.clear();
      state.years.clear(); state.scope = ''; state.q = '';
      sheetOpen ? refreshFilterSheet() : render();
      if (!sheetOpen) toast('Filters cleared');
      break;
    case 'clear-q': state.q = ''; render(); break;

    case 'jump-year': {
      const sec = $(`#yg-${v}`);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }

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
  if (e.key === 'Escape' && sheetOpen) closeSheet();
  if (e.key === 'Enter' && e.target.id === 'sheet-url') $('[data-act="sheet-connect"]')?.click();
});

/* compact top bar on scroll */
addEventListener('scroll', () => {
  $('#cbar').classList.toggle('on', window.scrollY > 64);
}, { passive: true });

/* ── boot ──────────────────────────────────────────────────── */
async function boot() {
  state.events = buildEvents(window.POD_SEED);
  render();
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try { await connectSheet(saved, { silent: true }); render(); toast('Synced from your sheet'); }
    catch { toast('Couldn’t reach your sheet — showing sample data'); }
  }
}
boot();
})();
