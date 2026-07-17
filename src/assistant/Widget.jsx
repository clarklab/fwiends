/* The Fwiends archivist — an assistant built on assistant-ui
   primitives (Thread / Composer) with typed answer cards: big year
   chips, counts with units, hedcut faces for people.

   Two layouts, both deterministic (no popper math, nothing can leave
   the viewport): a fixed corner panel behind a spark bubble on wide
   screens, and a full non-overlay Chat view opened from its own tab
   in the bottom nav on phones. */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  useMessagePartText,
} from '@assistant-ui/react';
import { askArchivist, parseCard } from './adapter.js';

const WIDE_MQ = '(min-width: 900px)';

const SparkIcon = props => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z" />
  </svg>
);

const initials = name =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .join('')
    .toUpperCase();

function Face({ name }) {
  const src = window.FWIENDS?.face?.(name);
  const hue = window.FWIENDS?.hue?.(name) ?? 211;
  return (
    <button
      className="aiw-face"
      type="button"
      title={name}
      onClick={() => window.FWIENDS?.openPerson?.(name)}
    >
      {src ? (
        <span className="aiw-face-hed"><img src={src} alt="" draggable="false" /></span>
      ) : (
        <span
          className="aiw-face-fallback"
          style={{ background: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${(hue + 24) % 360} 72% 42%))` }}
        >
          {initials(name)}
        </span>
      )}
      <span className="aiw-face-name">{name.split(' ')[0]}</span>
    </button>
  );
}

function AnswerCard({ card }) {
  const big =
    card.kind === 'year' ? (
      <div className="aiw-big aiw-big-year">{card.value}</div>
    ) : card.kind === 'number' ? (
      <div className="aiw-big aiw-big-number">
        {card.value}
        {card.unit ? <span className="aiw-unit">{card.unit}</span> : null}
      </div>
    ) : card.kind === 'people' && card.people?.length ? (
      <div className="aiw-faces">
        {card.people.map(name => <Face key={name} name={name} />)}
      </div>
    ) : card.kind === 'place' ? (
      <div className="aiw-big aiw-big-place">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {card.value}
      </div>
    ) : null;

  return (
    <div className={`aiw-card aiw-card-${card.kind}`}>
      {big}
      <p className="aiw-answer">{card.answer}</p>
      {card.detail ? <p className="aiw-detail">{card.detail}</p> : null}
    </div>
  );
}

/* assistant text part → parsed card (or plain prose if it isn't one) */
function AnswerText() {
  const { text } = useMessagePartText();
  const card = parseCard(text);
  if (card?.error) return <div className="aiw-card aiw-error">{card.answer}</div>;
  if (card) return <AnswerCard card={card} />;
  return <div className="aiw-card aiw-card-text"><p className="aiw-answer">{text}</p></div>;
}

function Thinking() {
  return (
    <div className="aiw-card aiw-thinking">
      <span className="aiw-dots"><i /><i /><i /></span>
      Reading the pod’s history…
    </div>
  );
}

const UserMessage = () => (
  <MessagePrimitive.Root className="aiw-msg aiw-msg-user">
    <div className="aiw-user-bubble"><MessagePrimitive.Parts /></div>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => (
  <MessagePrimitive.Root className="aiw-msg aiw-msg-assistant">
    <MessagePrimitive.Parts components={{ Text: AnswerText }} />
  </MessagePrimitive.Root>
);

const SUGGESTIONS = [
  'Who met first?',
  'How many moments happened in Austin?',
  'What year did the pod really come together?',
  'How long have Melissa and Brandon been together?',
];

const msgText = m =>
  (Array.isArray(m.content) ? m.content : [])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('\n')
    .trim();

export default function Widget() {
  const [messages, setMessages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(null);

  const onNew = useCallback(async message => {
    const question = msgText(message);
    if (!question) return;
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: [{ type: 'text', text: question }] };

    let history = '';
    setMessages(prev => {
      // compact transcript so follow-ups keep their context
      history = prev
        .map(m => {
          if (m.role === 'user') return `Q: ${msgText(m)}`;
          const card = parseCard(msgText(m));
          return card && !card.error ? `A: ${card.answer}` : null;
        })
        .filter(Boolean)
        .slice(-8)
        .join('\n');
      return [...prev, userMsg];
    });

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    try {
      const card = await askArchivist(question, { history, signal: controller.signal });
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: [{ type: 'text', text: JSON.stringify(card) }] },
      ]);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        const card = { error: true, answer: String(err?.message || 'Something went wrong.') };
        setMessages(prev => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: [{ type: 'text', text: JSON.stringify(card) }] },
        ]);
      }
    } finally {
      abortRef.current = null;
      setIsRunning(false);
    }
  }, []);

  const onCancel = useCallback(async () => {
    abortRef.current?.abort();
  }, []);

  const runtime = useExternalStoreRuntime({
    messages,
    isRunning,
    onNew,
    onCancel,
    convertMessage: m => m,
  });

  /* layout mode + open state, shared with the vanilla app via a bridge */
  const [wide, setWide] = useState(() => matchMedia(WIDE_MQ).matches);
  const [open, setOpen] = useState(false);
  const wideRef = useRef(wide);
  wideRef.current = wide;

  useEffect(() => {
    const mq = matchMedia(WIDE_MQ);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    window.FWIENDS_CHAT = {
      toggle: () => setOpen(o => !o),
      close: () => setOpen(false),
      // only the full-view (phone) layout closes on app navigation
      closeView: () => { if (!wideRef.current) setOpen(false); },
    };
    return () => { delete window.FWIENDS_CHAT; };
  }, []);

  // the phone layout behaves like a view: chat tab lit, page scroll held
  const viewMode = open && !wide;
  useEffect(() => {
    document.body.classList.toggle('chatting', viewMode);
    document.getElementById('tab-chat')?.classList.toggle('on', viewMode);
    return () => {
      document.body.classList.remove('chatting');
      document.getElementById('tab-chat')?.classList.remove('on');
    };
  }, [viewMode]);

  // Esc closes; on desktop, clicking outside the panel closes too
  // (except into sheets/photo viewer the chat itself opened)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    const onDown = e => {
      if (!wideRef.current) return;
      if (e.target.closest?.('.aiw-panel, .aiw-bubble, #sheet-root, #photo-root, #tab-chat')) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {wide ? (
        <button
          type="button"
          className="aiw-bubble"
          data-state={open ? 'open' : 'closed'}
          aria-label="Ask about the pod"
          onClick={() => setOpen(o => !o)}
        >
          <SparkIcon className="aiw-bubble-ic" />
        </button>
      ) : null}
      {open ? (
        <div className={viewMode ? 'aiw-panel aiw-viewmode' : 'aiw-panel'} role="dialog" aria-label="Ask the archivist">
          <header className="aiw-head">
            <span className="aiw-head-ic"><SparkIcon /></span>
            <div className="aiw-head-txt">
              <b>Ask the archivist</b>
              <small>Opus 4.8 over the whole pod history</small>
            </div>
            {wide ? (
              <button type="button" className="aiw-closebtn" aria-label="Close chat" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : null}
          </header>
          <ThreadPrimitive.Root className="aiw-thread">
            <ThreadPrimitive.Viewport className="aiw-viewport">
              <ThreadPrimitive.Empty>
                <div className="aiw-welcome">
                  <p>Every person, place, and moment of the pod — ask away.</p>
                  <div className="aiw-suggs">
                    {SUGGESTIONS.map(s => (
                      <ThreadPrimitive.Suggestion key={s} className="aiw-sugg" prompt={s} send>
                        {s}
                      </ThreadPrimitive.Suggestion>
                    ))}
                  </div>
                </div>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
              <ThreadPrimitive.If running>
                <Thinking />
              </ThreadPrimitive.If>
            </ThreadPrimitive.Viewport>
            <ComposerPrimitive.Root className="aiw-composer">
              <ComposerPrimitive.Input
                className="aiw-input"
                placeholder="Ask about the pod…"
                rows={1}
                autoFocus={wide}
              />
              <ComposerPrimitive.Send className="aiw-send" aria-label="Ask">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </ThreadPrimitive.Root>
        </div>
      ) : null}
    </AssistantRuntimeProvider>
  );
}
