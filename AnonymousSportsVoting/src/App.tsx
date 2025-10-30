import { useState, useEffect } from 'react';
import { FhevmProvider, useFhevm } from '@fhevm/universal-sdk';
import { useContract } from '@/hooks/useContract';
import { useVotingEvent } from '@/hooks/useVotingEvent';
import { WalletSection } from '@/components/WalletSection';
import { AdminSection } from '@/components/AdminSection';
import { VotingSection } from '@/components/VotingSection';
import { ResultsSection } from '@/components/ResultsSection';
import { StatusMessage } from '@/components/StatusMessage';
import type { StatusMessage as StatusMessageType } from '@/types';
import './styles.css';

function VotingApp() {
  const { isInitialized, error: fhevmError } = useFhevm();
  const {
    contract,
    provider,
    address,
    isAdmin,
    isConnected,
    error: contractError,
    connectWallet,
  } = useContract();

  const {
    currentEvent,
    voterStatus,
    eventCandidates,
    isVotingActive,
    isAuthorized,
    loading: eventLoading,
    reloadEvent,
    reloadVoterStatus,
  } = useVotingEvent(contract, address);

  const [statusMessages, setStatusMessages] = useState<StatusMessageType[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  const addStatusMessage = (message: string, type: 'success' | 'error' | 'info') => {
    const id = messageIdCounter;
    setMessageIdCounter(prev => prev + 1);
    setStatusMessages(prev => [...prev, { id, message, type }]);
  };

  const removeStatusMessage = (id: number) => {
    setStatusMessages(prev => prev.filter(msg => msg.id !== id));
  };

  useEffect(() => {
    if (fhevmError) {
      addStatusMessage(`FHEVM Error: ${fhevmError.message}`, 'error');
    }
  }, [fhevmError]);

  useEffect(() => {
    if (contractError) {
      addStatusMessage(contractError, 'error');
    }
  }, [contractError]);

  useEffect(() => {
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          window.location.reload();
        } else {
          window.location.reload();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="container">
        <div className="header">
          <h1>Anonymous Sports Voting</h1>
          <p>Initializing FHEVM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Anonymous Sports Voting</h1>
        <p>Secure, Private, and Transparent Sports Event Voting</p>
      </div>

      <WalletSection
        address={address}
        isConnected={isConnected}
        onConnect={connectWallet}
        provider={provider}
      />

      {isConnected && (
        <>
          <AdminSection
            contract={contract}
            isAdmin={isAdmin}
            onStatusUpdate={addStatusMessage}
            onEventCreated={reloadEvent}
          />

          <VotingSection
            contract={contract}
            currentEvent={currentEvent}
            voterStatus={voterStatus}
            candidates={eventCandidates}
            isVotingActive={isVotingActive}
            isAuthorized={isAuthorized}
            onStatusUpdate={addStatusMessage}
            onVoteSubmitted={reloadVoterStatus}
          />

          <ResultsSection contract={contract} currentEvent={currentEvent} />
        </>
      )}

      <div id="statusMessages">
        {statusMessages.map(msg => (
          <StatusMessage
            key={msg.id}
            message={msg}
            onRemove={removeStatusMessage}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(window.ethereum);
    }
  }, []);

  if (!provider) {
    return (
      <div className="container">
        <div className="header">
          <h1>Anonymous Sports Voting</h1>
          <p>Please install MetaMask to continue</p>
        </div>
      </div>
    );
  }

  return (
    <FhevmProvider config={{ provider }}>
      <VotingApp />
    </FhevmProvider>
  );
}
