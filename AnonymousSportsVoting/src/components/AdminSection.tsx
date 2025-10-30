import { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { isValidAddress } from '@/lib/utils';
import type { Candidate } from '@/types';

interface AdminSectionProps {
  contract: Contract | null;
  isAdmin: boolean;
  onStatusUpdate: (message: string, type: 'success' | 'error' | 'info') => void;
  onEventCreated: () => void;
}

export function AdminSection({ contract, isAdmin, onStatusUpdate, onEventCreated }: AdminSectionProps) {
  const [candidateName, setCandidateName] = useState('');
  const [candidateCategory, setCandidateCategory] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && isAdmin) {
      loadCandidates();
    }
  }, [contract, isAdmin]);

  const loadCandidates = async () => {
    if (!contract) return;

    try {
      const candidates: Candidate[] = [];
      for (let i = 1; i <= 20; i++) {
        try {
          const candidateInfo = await contract.getCandidateInfo(i);
          if (candidateInfo[2]) { // isActive
            candidates.push({
              id: i,
              name: candidateInfo[0],
              category: candidateInfo[1],
              isActive: candidateInfo[2],
            });
          }
        } catch (err) {
          break;
        }
      }
      setAllCandidates(candidates);
    } catch (err) {
      console.error('Error loading candidates:', err);
    }
  };

  const handleAddCandidate = async () => {
    if (!contract || !candidateName || !candidateCategory) {
      onStatusUpdate('Please enter both candidate name and category', 'error');
      return;
    }

    try {
      setLoading(true);
      onStatusUpdate('Adding candidate...', 'info');
      const tx = await contract.addCandidate(candidateName, candidateCategory);
      await tx.wait();

      onStatusUpdate(`Candidate "${candidateName}" added successfully!`, 'success');
      setCandidateName('');
      setCandidateCategory('');
      await loadCandidates();
    } catch (err: any) {
      onStatusUpdate(`Failed to add candidate: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeVoter = async () => {
    if (!contract || !isValidAddress(voterAddress)) {
      onStatusUpdate('Please enter a valid Ethereum address', 'error');
      return;
    }

    try {
      setLoading(true);
      onStatusUpdate('Authorizing voter...', 'info');
      const tx = await contract.authorizeVoter(voterAddress);
      await tx.wait();

      onStatusUpdate(`Voter ${voterAddress} authorized successfully!`, 'success');
      setVoterAddress('');
    } catch (err: any) {
      onStatusUpdate(`Failed to authorize voter: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!contract || !eventName || !eventDescription || selectedCandidateIds.length < 2) {
      onStatusUpdate('Please fill all fields and select at least 2 candidates', 'error');
      return;
    }

    try {
      setLoading(true);
      onStatusUpdate('Creating voting event...', 'info');
      const tx = await contract.createVotingEvent(eventName, eventDescription, selectedCandidateIds);
      await tx.wait();

      onStatusUpdate('Voting event created successfully!', 'success');
      setEventName('');
      setEventDescription('');
      setSelectedCandidateIds([]);
      onEventCreated();
    } catch (err: any) {
      onStatusUpdate(`Failed to create event: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndVoting = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      onStatusUpdate('Ending voting...', 'info');
      const currentEventId = await contract.currentEventId();
      const tx = await contract.endVoting(currentEventId);
      await tx.wait();

      onStatusUpdate('Voting ended successfully!', 'success');
      onEventCreated();
    } catch (err: any) {
      onStatusUpdate(`Failed to end voting: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealResults = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      onStatusUpdate('Requesting vote decryption...', 'info');
      const currentEventId = await contract.currentEventId();
      const tx = await contract.requestVoteDecryption(currentEventId);
      await tx.wait();

      onStatusUpdate('Results reveal requested successfully!', 'success');
      setTimeout(() => {
        onEventCreated();
      }, 5000);
    } catch (err: any) {
      onStatusUpdate(`Failed to reveal results: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCandidateSelection = (candidateId: number) => {
    setSelectedCandidateIds(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  return (
    <div className="card">
      <h2 className="section-title">Admin Functions</h2>

      <div className="grid">
        <div>
          <h3>Add Candidate</h3>
          <div className="form-group">
            <label htmlFor="candidateName">Candidate Name:</label>
            <input
              type="text"
              id="candidateName"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter candidate name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="candidateCategory">Category:</label>
            <input
              type="text"
              id="candidateCategory"
              value={candidateCategory}
              onChange={(e) => setCandidateCategory(e.target.value)}
              placeholder="e.g., Football, Basketball"
            />
          </div>
          <button className="btn" onClick={handleAddCandidate} disabled={loading}>
            Add Candidate
          </button>
        </div>

        <div>
          <h3>Authorize Voter</h3>
          <div className="form-group">
            <label htmlFor="voterAddress">Voter Address:</label>
            <input
              type="text"
              id="voterAddress"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <button className="btn" onClick={handleAuthorizeVoter} disabled={loading}>
            Authorize Voter
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Create Voting Event</h3>
        <div className="form-group">
          <label htmlFor="eventName">Event Name:</label>
          <input
            type="text"
            id="eventName"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., Best Football Player 2024"
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventDescription">Event Description:</label>
          <textarea
            id="eventDescription"
            rows={3}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="Describe the voting event..."
          />
        </div>
        <div className="form-group">
          <label>Select Candidates (click to toggle):</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {allCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => toggleCandidateSelection(candidate.id)}
                style={{
                  padding: '10px',
                  border: '2px solid',
                  borderColor: selectedCandidateIds.includes(candidate.id) ? '#3b82f6' : '#e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedCandidateIds.includes(candidate.id) ? '#dbeafe' : '#f7fafc',
                }}
              >
                {candidate.name} ({candidate.category})
              </div>
            ))}
          </div>
        </div>
        <button className="btn" onClick={handleCreateEvent} disabled={loading}>
          Create Voting Event
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Event Management</h3>
        <button className="btn" onClick={handleEndVoting} disabled={loading}>
          End Current Voting
        </button>
        <button className="btn" onClick={handleRevealResults} disabled={loading}>
          Reveal Results
        </button>
      </div>
    </div>
  );
}
