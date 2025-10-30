export function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp * 1000;
  return new Date(ms).toLocaleString();
}

export function formatAddress(address: string): string {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
