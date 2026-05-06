'use client';

import { Quicksand } from 'next/font/google';
import { useState } from 'react';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type LogLine = { msg: string; type: 'ok' | 'err' | 'inf' | 'default' };

export default function UploadPrototypePage() {
  const [apiKey, setApiKey] = useState('');
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const logLines: LogLine[] = logs;

  function addLog(msg: string, type: LogLine['type'] = 'default') {
    setLogs((prev) => [...prev, { msg, type }]);
  }

  async function run() {
    if (!url.trim()) {
      setHint('Enter a URL first');
      return;
    }
    setHint(null);
    setLogs([]);
    setBusy(true);

    try {
      addLog(`Uploading from URL…`, 'inf');

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (json as { message?: string }).message ?? res.statusText;
        addLog(`Error ${res.status}: ${message}`, 'err');
        if (Object.keys(json).length > 1)
          addLog(JSON.stringify(json, null, 2), 'err');
        return;
      }

      addLog(`✓ URI: ${(json as { uri?: string }).uri}`, 'ok');
    } catch (e: unknown) {
      addLog(`Error: ${e instanceof Error ? e.message : String(e)}`, 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={quicksand.className}
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(160deg, #fff0f5 0%, #f3e8ff 35%, #e0f2fe 70%, #fef3c7 100%)',
        padding: 'clamp(24px, 5vw, 48px) 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: '0 auto',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 28,
          padding: '28px 26px 30px',
          boxShadow:
            '0 4px 24px rgba(168, 85, 247, 0.12), 0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div
            style={{ fontSize: 36, lineHeight: 1, marginBottom: 8 }}
            aria-hidden
          >
            ✨
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(120deg, #a855f7, #ec4899, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Upload lab
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: '#78716c',
              fontWeight: 500,
            }}
          >
            Upload from URL to Arweave
          </p>
        </div>

        <label style={labelStyle}>
          <span style={pill}>🔑</span> API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your x-api-key"
          style={inputStyle}
          autoComplete="off"
        />

        <label style={labelStyle}>
          <span style={pill}>🔗</span> File URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/file.mp4"
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13 }}
        />

        {hint && (
          <p
            role="status"
            style={{
              margin: '0 0 14px',
              padding: '10px 14px',
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              color: '#b45309',
              background: 'rgba(254, 243, 199, 0.85)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            {hint}
          </p>
        )}

        <button
          type="button"
          onClick={run}
          disabled={busy}
          style={{
            ...btnBase,
            opacity: busy ? 0.75 : 1,
            cursor: busy ? 'wait' : 'pointer',
            transform: busy ? 'scale(0.98)' : 'scale(1)',
            boxShadow: busy
              ? '0 2px 12px rgba(168, 85, 247, 0.25)'
              : '0 4px 18px rgba(236, 72, 153, 0.35), 0 2px 8px rgba(168, 85, 247, 0.25)',
          }}
        >
          {busy ? 'Uploading…' : 'Upload'}
        </button>

        <div style={{ marginTop: 22 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#78716c',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>📜</span> Log
          </div>
          <div
            style={{
              background: 'rgba(255, 251, 235, 0.65)',
              border: '1px solid rgba(254, 215, 170, 0.5)',
              borderRadius: 18,
              padding: '14px 14px',
              fontSize: 12,
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              height: 220,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.55,
            }}
          >
            {logLines.length === 0 && (
              <span style={{ color: '#a8a29e', fontWeight: 500 }}>
                Messages will appear here
              </span>
            )}
            {logLines.map((l, i) => (
              <span
                key={i}
                style={{
                  color:
                    l.type === 'ok'
                      ? '#059669'
                      : l.type === 'err'
                        ? '#dc2626'
                        : l.type === 'inf'
                          ? '#2563eb'
                          : '#44403c',
                  fontWeight: l.type === 'err' ? 600 : 400,
                }}
              >
                {`[${new Date().toLocaleTimeString()}] ${l.msg}\n`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const pill: React.CSSProperties = {
  display: 'inline-block',
  marginRight: 6,
  fontSize: 14,
  verticalAlign: 'middle',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
  color: '#57534e',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.95)',
  border: '2px solid rgba(233, 213, 255, 0.85)',
  color: '#292524',
  borderRadius: 14,
  marginBottom: 18,
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const btnBase: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  border: 'none',
  borderRadius: 16,
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
  transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
};
