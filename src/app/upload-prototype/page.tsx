'use client';

import { Quicksand } from 'next/font/google';
import { useRef, useState } from 'react';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const CHUNK = 4 * 1024 * 1024;

type LogLine = { msg: string; type: 'ok' | 'err' | 'inf' | 'default' };

export default function UploadPrototypePage() {
  const [apiKey, setApiKey] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  function addLog(msg: string, type: LogLine['type'] = 'default') {
    setLogs((prev) => [...prev, { msg, type }]);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 0);
  }

  async function callApi(
    method: string,
    path: string,
    body?: BodyInit,
    extra: HeadersInit = {}
  ) {
    const res = await fetch(path, {
      method,
      headers: { 'x-api-key': apiKey, ...extra },
      body,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: Error & { status?: number; json?: unknown } = new Error(
        (json as { message?: string }).message ?? res.statusText
      );
      err.status = res.status;
      err.json = json;
      throw err;
    }
    return json as Record<string, unknown>;
  }

  async function run() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setHint('Pick a file first');
      return;
    }
    setHint(null);

    setLogs([]);
    setProgress(null);
    setBusy(true);

    const totalChunks = Math.ceil(file.size / CHUNK);
    addLog(
      `File: ${file.name}  (${(file.size / 1024 / 1024).toFixed(2)} MiB, ${totalChunks} chunks)`,
      'inf'
    );

    try {
      addLog('Creating session…');
      const session = await callApi(
        'POST',
        '/api/upload/chunk-session',
        JSON.stringify({
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          total_chunks: totalChunks,
          total_size_bytes: file.size,
        }),
        { 'Content-Type': 'application/json' }
      );
      addLog(`session_id: ${session.session_id}`, 'ok');

      for (let i = 0; i < totalChunks; i++) {
        const buf = await file.slice(i * CHUNK, (i + 1) * CHUNK).arrayBuffer();
        addLog(`Chunk ${i + 1}/${totalChunks} (${buf.byteLength} bytes)`);
        await callApi('PUT', '/api/upload/chunk', buf, {
          'x-session-id': session.session_id as string,
          'x-chunk-index': String(i),
          'Content-Type': 'application/octet-stream',
        });
        setProgress({ done: i + 1, total: totalChunks });
        addLog(`Chunk ${i + 1} done`, 'ok');
      }

      addLog('Completing upload (Arweave)…');
      const result = await callApi(
        'POST',
        '/api/upload/chunk-complete',
        JSON.stringify({ session_id: session.session_id }),
        { 'Content-Type': 'application/json' }
      );
      addLog(`✓ URI: ${result.uri}`, 'ok');
    } catch (e: unknown) {
      const err = e as Error & { status?: number; json?: unknown };
      addLog(`Error ${err.status ?? ''}: ${err.message}`, 'err');
      if (err.json) addLog(JSON.stringify(err.json, null, 2), 'err');
    } finally {
      setBusy(false);
    }
  }

  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0;

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
            Chunk upload lab
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: '#78716c',
              fontWeight: 500,
            }}
          >
            Chunked uploads, one friendly prototype
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
          <span style={pill}>📁</span> File
        </label>
        <div
          style={{
            marginBottom: 14,
            padding: '14px 16px',
            borderRadius: 16,
            border: '2px dashed rgba(168, 85, 247, 0.35)',
            background: 'rgba(250, 245, 255, 0.6)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            style={{
              width: '100%',
              fontSize: 13,
              fontWeight: 600,
              color: '#57534e',
              cursor: 'pointer',
            }}
          />
        </div>

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
          {busy ? 'Uploading…' : 'Start upload'}
        </button>

        {progress && (
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#57534e',
              }}
            >
              <span>Progress</span>
              <span style={{ color: '#a855f7' }}>{pct}%</span>
            </div>
            <div
              style={{
                background: 'rgba(243, 232, 255, 0.9)',
                borderRadius: 999,
                height: 14,
                overflow: 'hidden',
                border: '1px solid rgba(233, 213, 255, 0.8)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg, #c084fc, #f472b6, #fb923c)',
                  transition: 'width 0.25s ease-out',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#a8a29e',
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              {progress.done} / {progress.total} chunks
            </div>
          </div>
        )}

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
            ref={logRef}
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
            {logs.length === 0 && (
              <span style={{ color: '#a8a29e', fontWeight: 500 }}>
                Step-by-step messages will show up here
              </span>
            )}
            {logs.map((l, i) => (
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
