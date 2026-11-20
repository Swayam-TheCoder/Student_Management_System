import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { refreshProfile } from '../../store/slices/authSlice';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { PointTransaction } from '../../types/points';
import { StudentTabParamList, RootStackParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

type StudentDashboardNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'StudentDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface StudentDashboardProps {
  navigation: StudentDashboardNavProp;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { user, studentProfile } = useAppSelector((state) => state.auth);

  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([]);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const studentProfileId = studentProfile?.id;

  const loadDashboardData = useCallback(async () => {
    if (!studentProfileId) return;

    try {
      // 1. Fetch recent transactions (latest 3)
      const txRes = await studentApi.getStudentTransactions(studentProfileId, 0, 3);
      setRecentTransactions(txRes.content);

      // 2. Fetch leaderboard page 0 to discover rank
      const lbRes = await leaderboardApi.getLeaderboard(0, 100);
      const myEntry = lbRes.content.find((e) => e.studentId === studentProfileId);
      if (myEntry) {
        setCurrentRank(myEntry.rank);
      }

      // 3. Refresh user profile points
      dispatch(refreshProfile());
    } catch (e) {
      console.warn('Failed to load student dashboard data', e);
    }
  }, [studentProfileId, dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
              Hello, Welcome back 👋
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.userMeta, { color: theme.textMuted }]}>
              {studentProfile?.studentIdNumber} • {studentProfile?.gradeLevel}
            </Text>
          </View>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
            ]}
          >
            <Ionicons name="person" size={24} color={theme.primary} />
          </View>
        </View>

        {/* Hero Score Card */}
        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#1e1b4b' : '#4338ca',
              borderColor: 'transparent',
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle}>Total Merits & Points</Text>
            {currentRank !== null && (
              <View style={styles.rankBadge}>
                <Ionicons name="trophy" size={14} color="#fbbf24" />
                <Text style={styles.rankBadgeText}>Rank #{currentRank}</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroPointsValue}>{studentProfile?.totalPoints ?? 0}</Text>

          <View style={styles.heroBottomRow}>
            <Text style={styles.heroHint}>Keep up the outstanding effort!</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Leaderboard')}
              style={styles.heroActionBtn}
            >
              <Text style={styles.heroActionBtnText}>Leaderboard</Text>
              <Ionicons name="arrow-forward" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Nav Row */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PointHistory')}
            style={[
              styles.quickNavBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="time-outline" size={22} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.quickNavTitle, { color: theme.text }]}>Point History</Text>
              <Text style={[styles.quickNavSub, { color: theme.textMuted }]}>
                View all transactions
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudentProfile')}
            style={[
              styles.quickNavBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: theme.successLight }]}>
              <Ionicons name="id-card-outline" size={22} color={theme.success} />
            </View>
            <View>
              <Text style={[styles.quickNavTitle, { color: theme.text }]}>My Profile</Text>
              <Text style={[styles.quickNavSub, { color: theme.textMuted }]}>
                Academic details
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PointHistory')}>
            <Text style={[styles.sectionActionText, { color: theme.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        ) : (
          <EmptyState
            icon="ribbon-outline"
            title="No activity recorded yet"
            subtitle="Points awarded by your teachers will appear here."
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  userMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.xl,
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#cbd5e1',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.full,
  },
  rankBadgeText: {
    color: '#fbbf24',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
  },
  heroPointsValue: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: typography.weights.extrabold,
    marginVertical: spacing.sm,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: spacing.sm,
  },
  heroHint: {
    color: '#cbd5e1',
    fontSize: typography.sizes.xs,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionBtnText: {
    color: '#ffffff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginRight: 4,
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickNavBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
  },
  quickNavIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  quickNavTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  quickNavSub: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  sectionActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});

