const msToBlockTs = (ms: number | null): number => Math.floor((ms ?? 0) / 1000);

export default msToBlockTs;
