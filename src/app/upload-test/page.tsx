'use client';

import { useRef, useState } from 'react';

const CHUNK = 4 * 1024 * 1024;

type LogLine = { msg: string; type: 'ok' | 'err' | 'inf' | 'default' };

export default function UploadTestPage() {
  const [apiKey, setApiKey] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
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
      alert('Please select a file');
      return;
    }

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
      style={{
        fontFamily: 'monospace',
        maxWidth: 640,
        margin: '40px auto',
        padding: '0 16px',
        background: '#111',
        color: '#eee',
        minHeight: '100vh',
      }}
    >
      <h2>Chunk Upload Prototype</h2>

      <label style={labelStyle}>API Key (x-api-key)</label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="your-api-key"
        style={inputStyle}
      />

      <label style={labelStyle}>File</label>
      <input ref={fileRef} type="file" style={{ marginBottom: 16 }} />

      <br />
      <button onClick={run} disabled={busy} style={btnStyle(busy)}>
        {busy ? 'Uploading…' : 'Upload'}
      </button>

      {progress && (
        <div style={{ marginTop: 20 }}>
          <div style={{ background: '#222', borderRadius: 4, height: 20 }}>
            <div
              style={{
                height: '100%',
                background: '#2563eb',
                borderRadius: 4,
                width: `${pct}%`,
                transition: 'width 0.2s',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            {progress.done} / {progress.total} chunks ({pct}%)
          </div>
        </div>
      )}

      <div
        ref={logRef}
        style={{
          marginTop: 20,
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          height: 260,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {logs.map((l, i) => (
          <span
            key={i}
            style={{
              color:
                l.type === 'ok'
                  ? '#4ade80'
                  : l.type === 'err'
                    ? '#f87171'
                    : l.type === 'inf'
                      ? '#93c5fd'
                      : '#eee',
            }}
          >
            {`[${new Date().toLocaleTimeString()}] ${l.msg}\n`}
          </span>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontSize: 12,
  color: '#aaa',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  background: '#222',
  border: '1px solid #444',
  color: '#eee',
  borderRadius: 4,
  marginBottom: 16,
  fontFamily: 'monospace',
};
const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '10px 24px',
  background: disabled ? '#444' : '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 14,
});
