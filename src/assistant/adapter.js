/* Client for the Fwiends archivist. Submits the question + the entire
   dataset to the Netlify background function, then polls for the answer
   card — long answers never time out on the client, we just keep
   pulling until the card lands. Falls back to a local mock when the
   functions aren't there (static dev server). */

const FN = '/.netlify/functions';
const POLL_MS = 1300;
const DEADLINE_MS = 120000;

export const parseCard = text => {
  try {
    const card = JSON.parse(text);
    return card && typeof card === 'object' && typeof card.answer === 'string' ? card : null;
  } catch {
    return null;
  }
};

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('aborted', 'AbortError'));
      },
      { once: true },
    );
  });

/* offline/local fallback so the widget is fully drivable without a deploy */
async function mockAsk(question, events, signal) {
  await sleep(900, signal);
  const q = question.toLowerCase();
  const note = 'Local demo answer — deploy to Netlify for the real archivist.';
  const years = [...new Set(events.map(e => e.year).filter(Boolean))].sort();
  if (/how (many|long)|count|number/.test(q)) {
    return {
      kind: 'number', value: String(events.length), unit: 'moments', people: [],
      answer: `The pod's story holds ${events.length} moments so far.`, detail: note,
    };
  }
  if (/\bwho\b|which people|people/.test(q)) {
    return {
      kind: 'people', value: '', unit: '', people: ['Melissa Torrey', 'Brandon Strong'],
      answer: 'Melissa Torrey and Brandon Strong — it all starts with them.', detail: note,
    };
  }
  if (/where|place|city/.test(q)) {
    return {
      kind: 'place', value: 'Austin, TX', unit: '', people: [],
      answer: 'Austin, TX is where the pod’s threads keep crossing.', detail: note,
    };
  }
  if (/year|when|what.*time/.test(q)) {
    return {
      kind: 'year', value: String(years[Math.floor(years.length / 2)] ?? 2015), unit: '', people: [],
      answer: 'Right in the middle of the story.', detail: note,
    };
  }
  return {
    kind: 'text', value: '', unit: '', people: [],
    answer: 'Ask me about the people, places, years, and firsts of the pod.', detail: note,
  };
}

/** Ask the archivist. Resolves with an answer card. */
export async function askArchivist(question, { history = '', signal } = {}) {
  const events = window.FWIENDS?.data?.() ?? [];
  const id = crypto.randomUUID();

  let submitted;
  try {
    submitted = await fetch(`${FN}/ask-background`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, question, events, history }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    return mockAsk(question, events, signal); // no server at all (file/static dev)
  }
  // 404/405/501: no functions here (plain static server) — demo locally
  if ([404, 405, 501].includes(submitted.status)) return mockAsk(question, events, signal);
  if (!submitted.ok && submitted.status !== 202) {
    throw new Error(`The archivist is unreachable right now (HTTP ${submitted.status}).`);
  }

  const deadline = Date.now() + DEADLINE_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS, signal);
    let res;
    try {
      res = await fetch(`${FN}/answer?id=${id}`, { signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      continue; // transient network blip — keep pulling
    }
    if (!res.ok) continue;
    const job = await res.json();
    if (job.status === 'done' && job.card) return job.card;
    if (job.status === 'error') throw new Error(job.message || 'Something went wrong.');
  }
  throw new Error('The archivist is taking too long — try asking again.');
}
