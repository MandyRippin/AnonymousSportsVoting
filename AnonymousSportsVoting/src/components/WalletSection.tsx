import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/utils';
import type { NetworkInfo } from '@/types';

interface WalletSectionProps {
  address: string;
  isConnected: boolean;
  onConnect: () => Promise<void>;
  provider: any;
}

export function WalletSection({ address, isConnected, onConnect, provider }: WalletSectionProps) {
  const [network, setNetwork] = useState<NetworkInfo | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (provider && isConnected) {
      provider.getNetwork().then((net: any) => {
        setNetwork({
          name: net.name,
          chainId: Number(net.chainId),
        });
      });
    }
  }, [provider, isConnected]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await onConnect();
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Wallet Connection</h2>
      <div className="wallet-info">
        <p>
          <strong>Status:</strong>{' '}
          <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
        </p>
        <p>
          <strong>Address:</strong>{' '}
          <span>{address ? formatAddress(address) : '-'}</span>
        </p>
        <p>
          <strong>Network:</strong>{' '}
          <span>
            {network ? `${network.name} (${network.chainId})` : '-'}
          </span>
        </p>
      </div>
      <button
        className="btn"
        onClick={handleConnect}
        disabled={connecting || isConnected}
      >
        {connecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect MetaMask'}
      </button>
    </div>
  );
}
