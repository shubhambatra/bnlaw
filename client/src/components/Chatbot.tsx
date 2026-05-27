import { useState, useEffect, useRef, useCallback } from 'react';
import content from '../content.json';
import { apiUrl } from '../lib/api';

const t = content.chatbot;

interface Question {
  id: number;
  question_text: string;
  order_index: number;
  type: 'text' | 'dropdown' | 'number' | 'email' | 'phone';
  options: string | null;
  required: number;
}

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

type Phase = 'idle' | 'loading' | 'chatting' | 'completing' | 'done' | 'error';

const SESSION_KEY = 'bnlaw_chat_session';

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && phase === 'chatting') inputRef.current?.focus();
  }, [open, phase, currentQ]);

  const addBotMessage = useCallback((text: string, delay = 600) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', text }]);
        resolve();
      }, delay);
    });
  }, []);

  const startSession = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await fetch(apiUrl('/api/chat/sessions'), { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error();
      const { sessionId: sid, questions: qs } = json.data as {
        sessionId: string;
        questions: Question[];
      };
      localStorage.setItem(SESSION_KEY, sid);
      setSessionId(sid);
      setQuestions(qs);
      setPhase('chatting');
      await addBotMessage(t.greeting);
      if (qs.length > 0) {
        await addBotMessage(qs[0].question_text);
        setCurrentQ(qs[0]);
      } else {
        setPhase('done');
      }
    } catch {
      setPhase('error');
      setError(t.networkError);
    }
  }, [addBotMessage]);

  const resumeSession = useCallback(
    async (sid: string) => {
      setPhase('loading');
      try {
        const res = await fetch(apiUrl(`/api/chat/sessions/${sid}`));
        if (!res.ok) {
          localStorage.removeItem(SESSION_KEY);
          await startSession();
          return;
        }
        const json = await res.json();
        const { session, questions: qs, responses } = json.data as {
          session: { status: string; current_question_order: number };
          questions: Question[];
          responses: { question_id: number; response_text: string }[];
        };

        if (session.status === 'completed') {
          setPhase('done');
          setMessages([
            { id: uid(), role: 'bot', text: t.greeting },
            ...responses.flatMap((r) => {
              const q = qs.find((x) => x.id === r.question_id);
              return q
                ? [
                    { id: uid(), role: 'bot' as const, text: q.question_text },
                    { id: uid(), role: 'user' as const, text: r.response_text },
                  ]
                : [];
            }),
            { id: uid(), role: 'bot', text: 'Thanks for sharing the details. We will analyse your case and get back to you shortly.' },
          ]);
          return;
        }

        setSessionId(sid);
        setQuestions(qs);

        const answeredIds = new Set(responses.map((r) => r.question_id));
        const history: Message[] = [{ id: uid(), role: 'bot', text: t.greeting }];
        for (const r of responses) {
          const q = qs.find((x) => x.id === r.question_id);
          if (q) {
            history.push({ id: uid(), role: 'bot', text: q.question_text });
            history.push({ id: uid(), role: 'user', text: r.response_text });
          }
        }
        setMessages(history);

        const next = qs.find((q) => !answeredIds.has(q.id)) ?? null;
        if (next) {
          setPhase('chatting');
          await addBotMessage(next.question_text, 0);
          setCurrentQ(next);
        } else {
          setPhase('chatting');
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
        await startSession();
      }
    },
    [addBotMessage, startSession],
  );

  useEffect(() => {
    if (!open || phase !== 'idle') return;
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      resumeSession(saved);
    } else {
      startSession();
    }
  }, [open, phase, startSession, resumeSession]);

  const handleSend = async () => {
    if (!input.trim() || !currentQ || !sessionId) return;
    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);

    try {
      const res = await fetch(apiUrl(`/api/chat/sessions/${sessionId}/respond`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: currentQ.id, response_text: text }),
      });
      const json = await res.json();
      if (!json.success) throw new Error();

      const { nextQuestion, allDone } = json.data as {
        nextQuestion: Question | null;
        allDone: boolean;
      };

      if (allDone) {
        setCurrentQ(null);
        setPhase('completing');
        await fetch(apiUrl(`/api/chat/sessions/${sessionId}/complete`), { method: 'POST' });
        await addBotMessage(t.completion[0]);
        await addBotMessage(t.completion[1]);
        setPhase('done');
      } else if (nextQuestion) {
        await addBotMessage(nextQuestion.question_text);
        setCurrentQ(nextQuestion);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'bot', text: t.error },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    localStorage.removeItem(SESSION_KEY);
    setPhase('idle');
    setMessages([]);
    setQuestions([]);
    setCurrentQ(null);
    setSessionId(null);
    setInput('');
    setError('');
  };

  const options = currentQ?.options ? (JSON.parse(currentQ.options) as string[]) : [];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-[#0f2167] hover:bg-[#1a3399] shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
          </svg>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9a84c] rounded-full" aria-hidden="true" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed inset-x-3 bottom-20 top-16 z-[90] sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[360px] sm:max-h-[540px] sm:top-auto bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          role="dialog"
          aria-label="Legal Assistant Chat"
        >
          {/* Header */}
          <div className="bg-[#0f2167] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
                <path d="M16 2L4 8v3h24V8L16 2zM4 27h24v2H4v-2zM7 13v12H5v2h22v-2h-2V13h-2v12h-4V13h-2v12h-4V13H7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{t.header.title}</p>
              <p className="text-white/50 text-xs">{t.header.subtitle}</p>
            </div>
            {phase === 'done' && (
              <button
                onClick={handleRestart}
                className="text-white/60 hover:text-white text-xs underline transition-colors"
              >
                {t.header.newChat}
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0">
            {phase === 'loading' && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#0f2167] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {phase === 'error' && (
              <div className="text-center py-6">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={handleRestart}
                  className="mt-3 text-[#0f2167] text-sm underline"
                >
                  Try again
                </button>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0f2167] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          {phase === 'chatting' && currentQ && (
            <div className="border-t border-gray-100 bg-white">
              {currentQ.type === 'dropdown' && options.length > 0 ? (
                <div className="p-3 flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setInput(opt);
                        setTimeout(() => handleSend(), 0);
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-[#0f2167] hover:text-white rounded-full transition-colors border border-gray-200"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-3">
                  <input
                    ref={inputRef}
                    type={currentQ.type === 'email' ? 'email' : currentQ.type === 'number' ? 'number' : currentQ.type === 'phone' ? 'tel' : 'text'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#0f2167]/20"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label="Send"
                    className="w-9 h-9 rounded-full bg-[#0f2167] disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'completing' && (
            <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              {t.submitting}
            </div>
          )}

          {phase === 'done' && (
            <div className="border-t border-gray-100 bg-white px-4 py-3 text-center text-xs text-gray-400">
              {t.done}
            </div>
          )}
        </div>
      )}
    </>
  );
}
