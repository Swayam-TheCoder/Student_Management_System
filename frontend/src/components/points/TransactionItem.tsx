import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { PointTransaction } from '../../types/points';
import { formatDate, formatPoints, formatTransactionType } from '../../utils/formatters';
import { spacing, typography } from '../../theme';
import { Badge } from '../common/Badge';

interface TransactionItemProps {
  transaction: PointTransaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { theme } = useTheme();
  const isPositive = transaction.points > 0;

  let badgeVariant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'primary';
  if (transaction.transactionType === 'ACADEMIC') badgeVariant = 'success';
  else if (transaction.transactionType === 'PENALTY') badgeVariant = 'danger';
  else if (transaction.transactionType === 'BEHAVIOR') badgeVariant = 'primary';
  else if (transaction.transactionType === 'PARTICIPATION') badgeVariant = 'warning';
  else badgeVariant = 'neutral';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Badge
          label={formatTransactionType(transaction.transactionType)}
          variant={badgeVariant}
          size="sm"
        />
        <View
          style={[
            styles.pointsTag,
            {
              backgroundColor: isPositive ? theme.successLight : theme.dangerLight,
            },
          ]}
        >
          <Text
            style={[
              styles.pointsText,
              { color: isPositive ? theme.success : theme.danger },
            ]}
          >
            {formatPoints(transaction.points)} pts
          </Text>
        </View>
      </View>

      <Text style={[styles.reason, { color: theme.text }]}>
        {transaction.reason}
      </Text>

      <View style={styles.footerRow}>
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
          Awarded by: {transaction.teacherName}
        </Text>
        <Text style={[styles.dateText, { color: theme.textMuted }]}>
          {formatDate(transaction.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pointsTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  reason: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginVertical: spacing.xs,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  dateText: {
    fontSize: typography.sizes.xs,
  },
});

