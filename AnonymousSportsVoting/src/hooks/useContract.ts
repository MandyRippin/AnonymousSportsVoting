import { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export function useContract() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);

      // Create read-only contract initially
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      setContract(contract);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError('MetaMask not detected');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAddress(address);
      setIsConnected(true);

      // Create contract with signer
      const contractWithSigner = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractWithSigner);

      // Check admin status
      const adminAddress = await contractWithSigner.admin();
      setIsAdmin(adminAddress.toLowerCase() === address.toLowerCase());

      return address;
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setAddress('');
    setIsAdmin(false);
    setIsConnected(false);

    // Reset to read-only contract
    if (provider) {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      setContract(contract);
    }
  };

  return {
    contract,
    provider,
    signer,
    address,
    isAdmin,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
  };
}
