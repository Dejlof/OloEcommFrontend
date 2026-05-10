import { useState, useEffect, useRef } from 'react';
import { support } from '../api/api';
import { MessageCircle, X, Send, RotateCcw, Loader2 } from 'lucide-react';

// ── Link token replacement ────────────────────────────────────────────────────
const LINK_TOKENS = {
  '[REGISTER_LINK]':        '<a href="/register" class="chat-link">Register</a>',
  '[LOGIN_LINK]':           '<a href="/login" class="chat-link">Login</a>',
  '[TRACK_ORDER_LINK]':     '<a href="/orders" class="chat-link">Track Order</a>',
  '[SHOP_LINK]':            '<a href="/" class="chat-link">Shop Now</a>',
  '[CONTACT_SUPPORT_LINK]': '<a href="/contact" class="chat-link">Contact Support</a>',
};

function renderReply(text) {
  return Object.entries(LINK_TOKENS).reduce(
    (t, [token, html]) => t.replaceAll(token, html),
    text
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Single message bubble ─────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-green-900 text-orange-50 rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
        dangerouslySetInnerHTML={{ __html: isUser ? msg.text : renderReply(msg.text) }}
      />
      {!isUser && msg.sources?.length > 0 && (
        <p className="text-[10px] text-gray-400 px-1">
          Based on: {msg.sources.join(', ')}
        </p>
      )}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const resetChat = () => {
    setMessages([]);
    setSessionId('');
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const data = await support.chat(text, sessionId);
      if (data?.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [
        ...prev,
        {
          id:      Date.now() + 1,
          role:    'bot',
          text:    data?.reply ?? 'Sorry, I could not process that.',
          sources: data?.sources ?? [],
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: 'Something went wrong. Please try again.', sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <style>{`
        .chat-link { color: #15803d; text-decoration: underline; font-weight: 500; }
        .chat-link:hover { color: #166534; }
      `}</style>

      {/* ── Backdrop — mobile only, closes on tap ───────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Floating toggle button ───────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open support chat'}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-900 text-white shadow-lg flex items-center justify-center hover:bg-green-800 active:scale-95 transition-transform"
      >
        {open
          ? <X size={20} />
          : <MessageCircle size={22} />}
      </button>

      {/* ── Chat window ─────────────────────────────────────────── */}
      {open && (
        <div
          className={[
            'fixed z-50 bg-white flex flex-col overflow-hidden border border-gray-200 shadow-2xl',
            // Mobile: full-width bottom sheet
            'inset-x-0 bottom-0 rounded-t-2xl',
            // Desktop: floating panel
            'sm:inset-x-auto sm:left-auto sm:bottom-24 sm:right-5 sm:w-[370px] sm:rounded-2xl',
          ].join(' ')}
          style={{
            // Mobile: 82% of viewport height; desktop: capped below navbar
            height: '82vh',
            maxHeight: 'calc(100vh - 72px)',
          }}
        >
          {/* Drag handle — visible on mobile only */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-green-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-orange-300 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={17} className="text-green-900" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">OloEcomm Support</p>
                <p className="text-[10px] text-green-300 mt-0.5">
                  {sessionId ? 'Session active' : 'Start a conversation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  title="New chat"
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-green-800 transition"
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-green-800 transition"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <MessageCircle size={26} className="text-green-700" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Hi there! 👋</p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-[230px] leading-relaxed">
                  Ask me anything about orders, returns, payments, or our products.
                </p>
              </div>
            )}
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {loading && (
              <div className="flex items-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input — font-size 16px on mobile prevents iOS auto-zoom */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-base sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700 leading-relaxed"
              style={{ maxHeight: '96px', overflowY: 'auto' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl bg-green-900 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-40 transition flex-shrink-0"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
