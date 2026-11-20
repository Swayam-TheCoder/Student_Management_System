import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LeaderboardEntry } from '../../types/leaderboard';
import { spacing, typography } from '../../theme';

interface PodiumCardProps {
  topThree: LeaderboardEntry[];
  currentStudentId?: number;
}

export const PodiumCard: React.FC<PodiumCardProps> = ({ topThree, currentStudentId }) => {
  const { theme, isDark } = useTheme();

  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree.length > 1 ? topThree[1] : null;
  const third = topThree.length > 2 ? topThree[2] : null;

  const renderPodiumItem = (
    entry: LeaderboardEntry | null,
    place: 1 | 2 | 3,
    color: string
  ) => {
    if (!entry) {
      return <View style={styles.emptySlot} />;
    }

    const isCurrent = entry.studentId === currentStudentId;
    const height = place === 1 ? 140 : place === 2 ? 115 : 95;

    return (
      <View style={[styles.column, place === 1 && styles.firstPlaceColumn]}>
        {/* Crown or Medal */}
        <View style={[styles.avatarBadge, { backgroundColor: color + '25', borderColor: color }]}>
          <Ionicons
            name={place === 1 ? 'trophy' : 'medal'}
            size={place === 1 ? 26 : 20}
            color={color}
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.name,
            { color: theme.text },
            isCurrent && { color: theme.primary, fontWeight: typography.weights.bold },
          ]}
        >
          {entry.studentName}
        </Text>

        <Text style={[styles.pointsText, { color: color }]}>
          {entry.totalPoints} pts
        </Text>

        {/* Podium Stand */}
        <View
          style={[
            styles.stand,
            {
              height,
              backgroundColor: isDark ? theme.surface : theme.inputBackground,
              borderColor: color,
              borderTopWidth: 3,
            },
          ]}
        >
          <Text style={[styles.placeText, { color }]}>#{entry.rank}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderPodiumItem(second, 2, theme.podiumSilver)}
      {renderPodiumItem(first, 1, theme.podiumGold)}
      {renderPodiumItem(third, 3, theme.podiumBronze)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  firstPlaceColumn: {
    marginBottom: spacing.xs,
  },
  emptySlot: {
    flex: 1,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    maxWidth: 90,
    marginBottom: 2,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  stand: {
    width: '90%',
    borderTopLeftRadius: spacing.borderRadius.md,
    borderTopRightRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.sm,
  },
  placeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
});

