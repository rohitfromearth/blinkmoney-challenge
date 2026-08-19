export type ChallengeStatus = 'active' | 'completed' | 'expired';

export type ChallengePurpose = 'emergency' | 'travel' | 'gadget' | 'custom';

export interface Challenge {
  id: string;
  title: string;
  purpose: ChallengePurpose;

  targetAmountPaise: number;
  savedAmountPaise: number;

  durationDays: number;

  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD

  dailyTargetPaise: number;

  currentStreak: number;
  longestStreak: number;

  xp: number;

  status: ChallengeStatus;

  lastCheckInDate: string | null;
}

export interface ChallengeDraft {
  purpose: ChallengePurpose;
  targetAmountPaise: number;
  durationDays: number;
}

export const CHALLENGE_PURPOSES = [
  'emergency',
  'travel',
  'gadget',
  'custom',
] as const satisfies readonly ChallengePurpose[];
