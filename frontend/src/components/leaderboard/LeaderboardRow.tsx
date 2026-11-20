import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LeaderboardEntry } from '../../types/leaderboard';
import { spacing, typography } from '../../theme';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isCurrentUser }) => {
  const { theme, isDark } = useTheme();

  let rankBg = theme.inputBackground;
  let rankColor = theme.textSecondary;

  if (entry.rank === 1) {
    rankBg = theme.podiumGold + '25';
    rankColor = theme.podiumGold;
  } else if (entry.rank === 2) {
    rankBg = theme.podiumSilver + '35';
    rankColor = theme.podiumSilver;
  } else if (entry.rank === 3) {
    rankBg = theme.podiumBronze + '25';
    rankColor = theme.podiumBronze;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrentUser
            ? theme.primaryLight + (isDark ? '40' : '80')
            : theme.card,
          borderColor: isCurrentUser ? theme.primary : theme.border,
        },
      ]}
    >
      {/* Rank Number Circle */}
      <View style={[styles.rankCircle, { backgroundColor: rankBg }]}>
        <Text style={[styles.rankText, { color: rankColor }]}>#{entry.rank}</Text>
      </View>

      {/* Student Information */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {entry.studentName}
          </Text>
          {isCurrentUser && (
            <View style={[styles.youTag, { backgroundColor: theme.primary }]}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subText, { color: theme.textSecondary }]}>
          {entry.studentIdNumber} • {entry.gradeLevel}
        </Text>
      </View>

      {/* Total Points */}
      <View style={[styles.pointsBadge, { backgroundColor: theme.inputBackground }]}>
        <Text style={[styles.pointsValue, { color: theme.primary }]}>
          {entry.totalPoints}
        </Text>
        <Text style={[styles.pointsUnit, { color: theme.textMuted }]}>pts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  rankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  youTag: {
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  youText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  subText: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  pointsBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    minWidth: 54,
  },
  pointsValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  pointsUnit: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
});

