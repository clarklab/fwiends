/* The Fwiends archivist — a floating assistant built on assistant-ui
   primitives (AssistantModal / Thread / Composer) with typed answer
   cards: big year chips, counts with units, hedcut faces for people. */
import React, { useCallback, useRef, useState } from 'react';
import {
  AssistantModalPrimitive,
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useExternalStoreRuntime,
  useMessagePartText,
} from '@assistant-ui/react';
import { askArchivist, parseCard } from './adapter.js';

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

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModalPrimitive.Root>
        <AssistantModalPrimitive.Anchor className="aiw-anchor">
          <AssistantModalPrimitive.Trigger className="aiw-bubble" aria-label="Ask about the pod">
            <SparkIcon className="aiw-bubble-ic" />
          </AssistantModalPrimitive.Trigger>
        </AssistantModalPrimitive.Anchor>
        <AssistantModalPrimitive.Content className="aiw-panel" sideOffset={14} align="end">
          <header className="aiw-head">
            <span className="aiw-head-ic"><SparkIcon /></span>
            <div className="aiw-head-txt">
              <b>Ask the archivist</b>
              <small>Opus 4.8 over the whole pod history</small>
            </div>
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
                autoFocus
              />
              <ComposerPrimitive.Send className="aiw-send" aria-label="Ask">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </ComposerPrimitive.Send>
            </ComposerPrimitive.Root>
          </ThreadPrimitive.Root>
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
