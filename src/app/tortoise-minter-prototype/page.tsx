'use client';

import { useState } from 'react';

const CHAIN_ID = 84532;
const CONTRACTS = {
  TORSTest: '0x1c3879b9dabA1B51253b109726C44bb391cae8c5',
  TortoiseShell: '0x5220C7656B1556E2FfAfcb8663033409a4cAAaeE',
  TortoiseV1: '0x0713940762CC2abB896A5722ce4e725da46dbb56',
  TortoiseMinter: '0x2a805A41A599BbBf8610D8926cfc2c43c7940d9f',
} as const;
const TOKEN_PREVIEW_IMAGE =
  'https://f5bojvhqsjmobhlkvve2uyhj63dy5zkfnodpmematzhltwef4bsa.turbo-gateway.com/L0Lk1PCSWOCdaq1JqmDp9seO5UVrhvYRgJ5OudiF4GQ';
const BASESCAN_TX = (hash: string) => `https://sepolia.basescan.org/tx/${hash}`;

const CREATE_DEFAULTS = {
  contract: {
    name: 'Tortoise Minter Testing',
    uri: 'ar://NcnJ06VcRcaBekXbwUxRQn-A5QT4QWHS3G2HPCfMijI',
  },
  token: {
    tokenMetadataURI: 'ar://NcnJ06VcRcaBekXbwUxRQn-A5QT4QWHS3G2HPCfMijI',
    createReferral: '0x749B7b7A6944d72266Be9500FC8C221B6A7554Ce',
    salesConfig: {
      type: 'erc20Mint',
      pricePerToken: '1000000',
      saleStart: '0',
      saleEnd: '18446744073709551615',
      currency: '0x14196F08a4Fa0B66B7331bC40dd6bCd8A1dEeA9F',
    },
    mintToCreatorCount: 1,
    payoutRecipient: '0xaf1452d289e22fbd0dea9d5097353c72a90fac33',
  },
  chainId: CHAIN_ID,
} as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '1px 3px',
        borderRadius: 3,
        fontSize: 11,
        lineHeight: 1,
        color: copied ? '#22c55e' : '#bbb',
        transition: 'color 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? '✓' : '⎘'}
    </button>
  );
}

type Tab = 'create' | 'collect';
interface CreateResult {
  contractAddress: string;
  tokenId: string;
  hash: string;
}
interface CollectResult {
  hash: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: 'block',
          fontSize: 10,
          color: '#999',
          marginBottom: 3,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '6px 8px',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          fontSize: 12,
          border: '1px solid #ddd',
          borderRadius: 3,
        }}
      />
    </div>
  );
}

function TxLink({ hash }: { hash: string }) {
  return (
    <a
      href={BASESCAN_TX(hash)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#1a73e8', wordBreak: 'break-all', fontSize: 11 }}
    >
      {hash}
    </a>
  );
}

export default function TortoiseMinterPrototype() {
  const [tab, setTab] = useState<Tab>('create');

  const [creatorAddress, setCreatorAddress] = useState('');
  const [priceUsdc, setPriceUsdc] = useState('1');
  const [mintToCreatorCount, setMintToCreatorCount] = useState('1');
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<CreateResult | null>(null);
  const [createError, setCreateError] = useState('');

  const [collectionAddress, setCollectionAddress] = useState('');
  const [tokenId, setTokenId] = useState('1');
  const [amount, setAmount] = useState('1');
  const [apiKey, setApiKey] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<CollectResult | null>(
    null
  );
  const [collectError, setCollectError] = useState('');

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    setCreateResult(null);
    try {
      const pricePerToken = String(
        Math.round(parseFloat(priceUsdc) * 1_000_000)
      );
      const res = await fetch('/api/moment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...CREATE_DEFAULTS,
          account: creatorAddress,
          token: {
            ...CREATE_DEFAULTS.token,
            payoutRecipient: creatorAddress,
            mintToCreatorCount: parseInt(mintToCreatorCount, 10),
            salesConfig: {
              ...CREATE_DEFAULTS.token.salesConfig,
              pricePerToken,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Create failed');
      setCreateResult(data);
      setCollectionAddress(data.contractAddress);
      setTokenId(data.tokenId);
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCollect = async () => {
    setCollecting(true);
    setCollectError('');
    setCollectResult(null);
    try {
      const res = await fetch('/api/moment/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({
          moment: { tokenId, collectionAddress, chainId: CHAIN_ID },
          comment: '',
          amount: parseInt(amount, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Collect failed');
      setCollectResult(data);
    } catch (e: any) {
      setCollectError(e.message);
    } finally {
      setCollecting(false);
    }
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '2px 0',
    fontFamily: 'monospace',
    fontWeight: active ? 700 : 400,
    background: 'none',
    color: active ? '#111' : '#bbb',
    border: 'none',
    borderBottom: active ? '2px solid #111' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: 11,
  });

  const submitBtn: React.CSSProperties = {
    padding: '7px 20px',
    fontFamily: 'monospace',
    fontWeight: 600,
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 12,
    opacity: creating || collecting ? 0.6 : 1,
    marginTop: 4,
  };

  const defaults: [string, string][] = [
    ['Contract name', CREATE_DEFAULTS.contract.name],
    ['Contract URI', CREATE_DEFAULTS.contract.uri],
    ['Token metadata URI', CREATE_DEFAULTS.token.tokenMetadataURI],
    ['Create referral', CREATE_DEFAULTS.token.createReferral],
    ['Payout recipient', creatorAddress || '(same as account)'],
    ['Price per token', `${priceUsdc} USDC`],
    ['Sale type', CREATE_DEFAULTS.token.salesConfig.type],
    ['Currency (USDC)', CREATE_DEFAULTS.token.salesConfig.currency],
    ['Sale start', 'immediate'],
    ['Sale end', 'open edition'],
    ['Mint to creator', mintToCreatorCount],
    ['Chain ID', String(CHAIN_ID)],
  ];

  return (
    <main
      style={{
        fontFamily: 'monospace',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* ── Col 1: Image + Deployed Addresses ── */}
      <div
        style={{
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TOKEN_PREVIEW_IMAGE}
          alt="Token preview"
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            objectPosition: 'left',
            display: 'block',
            flexShrink: 0,
          }}
        />
        <div style={{ padding: '14px 16px', overflow: 'auto', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
            TortoiseMinter Prototype
          </div>
          <div style={{ color: '#aaa', fontSize: 10, marginBottom: 12 }}>
            Base Sepolia · Chain {CHAIN_ID}
          </div>
          {(Object.entries(CONTRACTS) as [string, string][]).map(
            ([name, addr]) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    color: '#777',
                    fontWeight: 700,
                    fontSize: 10,
                    marginBottom: 2,
                  }}
                >
                  {name}
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}
                >
                  <div
                    style={{
                      color: '#444',
                      wordBreak: 'break-all',
                      fontSize: 10,
                    }}
                  >
                    {addr}
                  </div>
                  <CopyButton text={addr} />
                </div>
              </div>
            )
          )}
        </div>
        {/* end inner padding div */}
      </div>
      {/* end Col 1 */}

      {/* ── Col 2: Tabs + Defaults + Form ── */}
      <div
        style={{
          padding: '14px 16px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
          <button
            style={tabBtn(tab === 'create')}
            onClick={() => setTab('create')}
          >
            Create
          </button>
          <button
            style={tabBtn(tab === 'collect')}
            onClick={() => setTab('collect')}
          >
            Collect
          </button>
        </div>

        {tab === 'create' && (
          <>
            {/* Defaults */}
            <div
              style={{
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 5,
                padding: '8px 10px',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 10,
                  color: '#555',
                  marginBottom: 4,
                }}
              >
                Defaults
              </div>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  fontSize: 10,
                }}
              >
                <tbody>
                  {defaults.map(([k, v]) => (
                    <tr key={k}>
                      <td
                        style={{
                          color: '#aaa',
                          paddingRight: 8,
                          whiteSpace: 'nowrap',
                          verticalAlign: 'top',
                          paddingBottom: 3,
                        }}
                      >
                        {k}
                      </td>
                      <td
                        style={{
                          wordBreak: 'break-all',
                          color: '#444',
                          paddingBottom: 3,
                        }}
                      >
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form */}
            <div>
              <Field
                label="Price per Token (USDC)"
                value={priceUsdc}
                onChange={setPriceUsdc}
                placeholder="1"
              />
              <Field
                label="Mint to Creator (quantity)"
                value={mintToCreatorCount}
                onChange={setMintToCreatorCount}
                placeholder="1"
              />
              <Field
                label="Account / Payout Recipient"
                value={creatorAddress}
                onChange={setCreatorAddress}
                placeholder="0x..."
              />
              <button
                style={submitBtn}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              {createError && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: '#fff3f3',
                    border: '1px solid #f5c6c6',
                    borderRadius: 4,
                    color: '#c0392b',
                    fontSize: 11,
                  }}
                >
                  {createError}
                </div>
              )}
              {createResult && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: '#f6fff6',
                    border: '1px solid #b2dfb2',
                    borderRadius: 4,
                    fontSize: 11,
                    lineHeight: 1.8,
                  }}
                >
                  <div>
                    <b>Contract</b>
                    <br />
                    {createResult.contractAddress}
                  </div>
                  <div>
                    <b>Token ID</b>
                    <br />
                    {createResult.tokenId}
                  </div>
                  <div>
                    <b>Tx</b>
                    <br />
                    <TxLink hash={createResult.hash} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'collect' && (
          <div>
            <Field
              label="Collection Address"
              value={collectionAddress}
              onChange={setCollectionAddress}
              placeholder="0x..."
            />
            <Field
              label="Token ID"
              value={tokenId}
              onChange={setTokenId}
              placeholder="1"
            />
            <Field
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="1"
            />
            <Field
              label="API Key"
              value={apiKey}
              onChange={setApiKey}
              placeholder="your-api-key"
              type="password"
            />
            <button
              style={submitBtn}
              onClick={handleCollect}
              disabled={collecting}
            >
              {collecting ? 'Collecting...' : 'Collect'}
            </button>
            {collectError && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: '#fff3f3',
                  border: '1px solid #f5c6c6',
                  borderRadius: 4,
                  color: '#c0392b',
                  fontSize: 11,
                }}
              >
                {collectError}
              </div>
            )}
            {collectResult && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: '#f6fff6',
                  border: '1px solid #b2dfb2',
                  borderRadius: 4,
                  fontSize: 11,
                  lineHeight: 1.8,
                }}
              >
                <div>
                  <b>Tx</b>
                  <br />
                  <TxLink hash={collectResult.hash} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
