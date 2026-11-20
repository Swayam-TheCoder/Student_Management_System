import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PodiumCard } from '../../components/leaderboard/PodiumCard';
import { LeaderboardRow } from '../../components/leaderboard/LeaderboardRow';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchLeaderboard, refreshLeaderboard } from '../../store/slices/leaderboardSlice';
import { spacing, typography } from '../../theme';

export const LeaderboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { entries, page, hasNext, isLoading, isRefreshing } = useAppSelector(
    (state) => state.leaderboard
  );
  const { studentProfile } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLeaderboard({ page: 0, size: 20 }));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(refreshLeaderboard());
  };

  const onEndReached = () => {
    if (!isLoading && hasNext) {
      dispatch(fetchLeaderboard({ page: page + 1, size: 20, append: true }));
    }
  };

  const topThree = entries.slice(0, 3);
  const currentStudentId = studentProfile?.id;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Academic Leaderboard</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Competition rankings based on verified merits and achievements
          </Text>
        </View>

        {isLoading && entries.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => `${item.studentId}-${item.rank}`}
            renderItem={({ item }) => (
              <LeaderboardRow
                entry={item}
                isCurrentUser={item.studentId === currentStudentId}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              topThree.length > 0 ? (
                <PodiumCard topThree={topThree} currentStudentId={currentStudentId} />
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <EmptyState
                icon="trophy-outline"
                title="Leaderboard is empty"
                subtitle="Students and scores will populate here as points are awarded."
              />
            }
            ListFooterComponent={
              isLoading && entries.length > 0 ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});

