/* ============================================================
   Fwiends — “ask the archivist” background function
   ------------------------------------------------------------
   Receives { id, question, events, history }, asks Claude Opus 4.8
   through Netlify's AI Gateway (which injects ANTHROPIC_API_KEY and
   ANTHROPIC_BASE_URL at runtime), and writes the structured answer
   card to Netlify Blobs under the job id.

   It's a *-background function on purpose: Netlify replies 202 to
   the client immediately and gives this run up to 15 minutes, so a
   slow answer can never hit the synchronous 10-second wall. The
   client polls answer.mjs until the card lands.
   ============================================================ */
import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';

const KINDS = ['year', 'number', 'people', 'place', 'text'];

/* structured output schema: the API guarantees the reply parses */
const CARD_SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: KINDS },
    value: { type: 'string' },
    unit: { type: 'string' },
    people: { type: 'array', items: { type: 'string' } },
    answer: { type: 'string' },
    detail: { type: 'string' },
  },
  required: ['kind', 'value', 'unit', 'people', 'answer', 'detail'],
  additionalProperties: false,
};

const SYSTEM = `You are the Fwiends archivist — the expert on The Pod, a group of friends whose
shared history (people, places, and moments from a spreadsheet) is provided as JSON rows.
Answer the user's question about these relationships using ONLY the dataset.

Reply as one answer card. Pick "kind" by what the answer fundamentally is:
- "year": a single year. value = the year, e.g. "2015". unit = "".
- "number": a count or duration. value = the number, e.g. "12"; unit = what it counts, e.g. "years", "days", "moments", "people".
- "people": one or more specific people. people = their exact full names as written in the dataset. value = "", unit = "".
- "place": a location. value = the place as written, e.g. "Austin, TX". unit = "".
- "text": anything else. value = "", unit = "".
Unused fields must be "" (or [] for people).

"answer" is the quick answer — one short, friendly sentence. "detail" is at most two
sentences of supporting evidence from the data (dates, moments); "" if nothing to add.
Be precise with dates and math. If the data doesn't say, use kind "text" and say so honestly.`;

const clip = (s, n) => String(s ?? '').slice(0, n);

function normalizeCard(raw) {
  const card = raw && typeof raw === 'object' ? raw : {};
  const kind = KINDS.includes(card.kind) ? card.kind : 'text';
  return {
    kind,
    value: clip(card.value, 80),
    unit: clip(card.unit, 40),
    people: Array.isArray(card.people) ? card.people.slice(0, 8).map(p => clip(p, 60)) : [],
    answer: clip(card.answer, 300) || 'Hmm — I came back empty-handed.',
    detail: clip(card.detail, 500),
  };
}

export default async req => {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }
  const { id, question, events, history } = payload ?? {};
  if (typeof id !== 'string' || !/^[a-z0-9-]{8,64}$/i.test(id)) {
    return new Response('bad id', { status: 400 });
  }

  const store = getStore('pod-answers');
  try {
    await store.setJSON(id, { status: 'pending', at: Date.now() });

    const q = clip(question, 600).trim();
    if (!q) throw new Error('Ask me something about the pod first.');
    const rows = (Array.isArray(events) ? events : []).slice(0, 2000);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    });

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'low', // quick, simple answers — the dataset is tiny
        format: { type: 'json_schema', schema: CARD_SCHEMA },
      },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content:
            `DATASET (${rows.length} moments):\n${JSON.stringify(rows)}\n\n` +
            (history ? `EARLIER IN THIS CONVERSATION:\n${clip(history, 2000)}\n\n` : '') +
            `QUESTION: ${q}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      throw new Error('The archivist declined to answer that one.');
    }
    const text = response.content.find(b => b.type === 'text')?.text ?? '';
    const card = normalizeCard(JSON.parse(text));
    await store.setJSON(id, { status: 'done', card, at: Date.now() });
  } catch (err) {
    await store.setJSON(id, {
      status: 'error',
      message: clip(err?.message || 'Something went wrong.', 300),
      at: Date.now(),
    });
  }
  return new Response('accepted', { status: 202 });
};
