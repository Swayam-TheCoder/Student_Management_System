import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { studentApi } from '../../api/studentApi';
import { PointTransaction } from '../../types/points';
import { spacing, typography } from '../../theme';

export const PointHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const { studentProfile } = useAppSelector((state) => state.auth);

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const studentId = studentProfile?.id;

  const fetchTransactions = useCallback(
    async (pageToLoad: number, refresh: boolean = false) => {
      if (!studentId) return;

      if (refresh) {
        setIsRefreshing(true);
      } else if (pageToLoad > 0) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await studentApi.getStudentTransactions(studentId, pageToLoad, 15);
        if (refresh || pageToLoad === 0) {
          setTransactions(res.content);
        } else {
          setTransactions((prev) => [...prev, ...res.content]);
        }
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.warn('Failed to load transaction history', e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    fetchTransactions(0);
  }, [fetchTransactions]);

  const onRefresh = () => {
    fetchTransactions(0, true);
  };

  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && page + 1 < totalPages) {
      fetchTransactions(page + 1);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Point Transaction History</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            All points awarded or adjusted by your teachers
          </Text>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            contentContainerStyle={styles.listContent}
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
                icon="receipt-outline"
                title="No transaction records"
                subtitle="Your academic and extracurricular points history will show here."
              />
            }
            ListFooterComponent={
              isLoadingMore ? (
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
    paddingBottom: spacing.sm,
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

