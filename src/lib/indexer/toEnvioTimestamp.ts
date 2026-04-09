function toChainTimestamp(timestamp: number): number {
  return Math.floor(timestamp / 1000);
}

export function toEnvioTimestamp(msTimestamp: number | null): number {
  return toChainTimestamp(msTimestamp ?? new Date(0).getTime());
}
