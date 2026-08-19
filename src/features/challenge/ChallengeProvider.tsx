import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Challenge } from './types';

export interface ChallengeContextValue {
  challenge: Challenge | null;
  setChallenge: (challenge: Challenge) => void;
  updateChallenge: (updater: (challenge: Challenge) => Challenge) => void;
  clearChallenge: () => void;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challenge, setChallengeState] = useState<Challenge | null>(null);

  const setChallenge = useCallback((next: Challenge) => {
    setChallengeState(next);
  }, []);

  const updateChallenge = useCallback((updater: (current: Challenge) => Challenge) => {
    setChallengeState((current) => (current ? updater(current) : current));
  }, []);

  const clearChallenge = useCallback(() => {
    setChallengeState(null);
  }, []);

  const value = useMemo(
    () => ({ challenge, setChallenge, updateChallenge, clearChallenge }),
    [challenge, setChallenge, updateChallenge, clearChallenge],
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenge(): ChallengeContextValue {
  const value = useContext(ChallengeContext);
  if (!value) {
    throw new Error('useChallenge must be used within ChallengeProvider.');
  }
  return value;
}
