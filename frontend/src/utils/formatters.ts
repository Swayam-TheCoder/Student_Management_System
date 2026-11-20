import { TransactionType } from '../types/points';

export const formatPoints = (points: number): string => {
  if (points > 0) return `+${points}`;
  return `${points}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatRankOrdinal = (rank: number): string => {
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) {
    return `${rank}st`;
  }
  if (j === 2 && k !== 12) {
    return `${rank}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${rank}rd`;
  }
  return `${rank}th`;
};

export const formatTransactionType = (type: TransactionType): string => {
  switch (type) {
    case 'ACADEMIC':
      return 'Academic Excellence';
    case 'PARTICIPATION':
      return 'Active Participation';
    case 'BEHAVIOR':
      return 'Exemplary Conduct';
    case 'PENALTY':
      return 'Disciplinary Deduction';
    case 'ADJUSTMENT':
      return 'Score Adjustment';
    default:
      return type;
  }
};

