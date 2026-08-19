import {
  CHALLENGE_PURPOSES,
  type Challenge,
  type ChallengeDraft,
  type ChallengePurpose,
  type ChallengeStatus,
} from './types';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function assertIntegerPaise(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer number of paise.`);
  }
}

function parseCalendarDate(date: string): Date {
  const match = DATE_PATTERN.exec(date);
  if (!match) {
    throw new Error(`Invalid date "${date}". Expected YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date "${date}".`);
  }

  return parsed;
}

function formatCalendarDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDailyTarget(
  targetAmountPaise: number,
  durationDays: number,
): number {
  assertIntegerPaise(targetAmountPaise, 'Target amount');
  if (targetAmountPaise <= 0) {
    throw new Error('Target amount must be greater than 0 paise.');
  }
  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    throw new Error('Duration must be an integer greater than 0 days.');
  }

  return Math.ceil(targetAmountPaise / durationDays);
}

export function calculateProgressRatio(
  savedAmountPaise: number,
  targetAmountPaise: number,
): number {
  assertIntegerPaise(savedAmountPaise, 'Saved amount');
  assertIntegerPaise(targetAmountPaise, 'Target amount');
  if (savedAmountPaise < 0) {
    throw new Error('Saved amount must not be negative.');
  }
  if (targetAmountPaise <= 0) {
    throw new Error('Target amount must be greater than 0 paise.');
  }

  return Math.min(savedAmountPaise / targetAmountPaise, 1);
}

export function calculateRemainingAmount(
  savedAmountPaise: number,
  targetAmountPaise: number,
): number {
  assertIntegerPaise(savedAmountPaise, 'Saved amount');
  assertIntegerPaise(targetAmountPaise, 'Target amount');
  if (savedAmountPaise < 0) {
    throw new Error('Saved amount must not be negative.');
  }
  if (targetAmountPaise <= 0) {
    throw new Error('Target amount must be greater than 0 paise.');
  }

  return Math.max(targetAmountPaise - savedAmountPaise, 0);
}

export function formatRupees(amountPaise: number): string {
  assertIntegerPaise(amountPaise, 'Amount');
  if (amountPaise < 0) {
    throw new Error('Amount must not be negative.');
  }

  const rupees = Math.trunc(amountPaise / 100);
  const paise = amountPaise % 100;
  const rupeePart = rupees.toLocaleString('en-IN');

  if (paise === 0) {
    return `₹${rupeePart}`;
  }

  return `₹${rupeePart}.${String(paise).padStart(2, '0')}`;
}

export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, days: number): string {
  if (!Number.isInteger(days)) {
    throw new Error('Days to add must be an integer.');
  }

  const parsed = parseCalendarDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatCalendarDate(parsed);
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function calculateNextStreak(
  currentStreak: number,
  lastCheckInDate: string | null,
  today: string,
): number {
  if (!Number.isInteger(currentStreak) || currentStreak < 0) {
    throw new Error('Current streak must be an integer of 0 or more.');
  }

  parseCalendarDate(today);

  if (lastCheckInDate === null) {
    return 1;
  }

  parseCalendarDate(lastCheckInDate);

  if (lastCheckInDate === today) {
    return currentStreak;
  }

  if (addDays(lastCheckInDate, 1) === today) {
    return currentStreak + 1;
  }

  return 1;
}

export function isChallengeComplete(
  savedAmountPaise: number,
  targetAmountPaise: number,
): boolean {
  assertIntegerPaise(savedAmountPaise, 'Saved amount');
  assertIntegerPaise(targetAmountPaise, 'Target amount');
  if (savedAmountPaise < 0) {
    throw new Error('Saved amount must not be negative.');
  }
  if (targetAmountPaise < 0) {
    throw new Error('Target amount must not be negative.');
  }

  return savedAmountPaise >= targetAmountPaise;
}

export function isChallengeExpired(endDate: string, today: string): boolean {
  return daysBetween(endDate, today) > 0;
}

export function calculateRemainingDays(endDate: string, today: string): number {
  return Math.max(daysBetween(today, endDate) + 1, 0);
}

export function resolveChallengeStatus(
  challenge: Challenge,
  today: string,
): ChallengeStatus {
  if (isChallengeComplete(challenge.savedAmountPaise, challenge.targetAmountPaise)) {
    return 'completed';
  }

  if (isChallengeExpired(challenge.endDate, today)) {
    return 'expired';
  }

  return 'active';
}

function isChallengePurpose(value: string): value is ChallengePurpose {
  return (CHALLENGE_PURPOSES as readonly string[]).includes(value);
}

export function validateChallengeDraft(draft: ChallengeDraft): string[] {
  const errors: string[] = [];

  if (!isChallengePurpose(draft.purpose)) {
    errors.push('Purpose must be emergency, travel, gadget, or custom.');
  }

  if (!Number.isInteger(draft.targetAmountPaise) || draft.targetAmountPaise <= 0) {
    errors.push('Target amount must be an integer greater than 0 paise.');
  }

  if (!Number.isInteger(draft.durationDays) || draft.durationDays <= 0) {
    errors.push('Duration must be an integer greater than 0 days.');
  }

  return errors;
}
