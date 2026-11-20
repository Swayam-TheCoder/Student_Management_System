import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { LeaderboardEntry } from '../../types/leaderboard';
import { TeacherTabParamList, TeacherStackParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

type TeacherDashboardNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TeacherTabParamList, 'TeacherDashboard'>,
  NativeStackNavigationProp<TeacherStackParamList>
>;

interface TeacherDashboardProps {
  navigation: TeacherDashboardNavProp;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { user, teacherProfile } = useAppSelector((state) => state.auth);

  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [topStudents, setTopStudents] = useState<LeaderboardEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // 1. Get total students count
      const studentsRes = await studentApi.getStudents(undefined, 0, 1);
      setTotalStudentsCount(studentsRes.totalElements);

      // 2. Get top 3 students preview
      const lbRes = await leaderboardApi.getLeaderboard(0, 3);
      setTopStudents(lbRes.content);
    } catch (e) {
      console.warn('Failed to load teacher dashboard', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
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
              Faculty Dashboard
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.deptText, { color: theme.textMuted }]}>
              {teacherProfile?.department} • ID: {teacherProfile?.employeeId}
            </Text>
          </View>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
            ]}
          >
            <Ionicons name="briefcase" size={24} color={theme.primary} />
          </View>
        </View>

        {/* Action Card: Award Points */}
        <Card
          style={[
            styles.ctaCard,
            { backgroundColor: isDark ? '#1e1b4b' : '#4338ca', borderColor: 'transparent' },
          ]}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Point Allocation & Adjustment</Text>
              <Text style={styles.ctaSub}>
                Recognize academic excellence or adjust disciplinary scores
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AwardPoints')}
              style={styles.ctaButton}
            >
              <Ionicons name="add-circle" size={18} color="#4338ca" />
              <Text style={styles.ctaButtonText}>Award Points</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StudentDirectory')}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {totalStudentsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Students
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Leaderboard')}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: theme.warningLight }]}>
              <Ionicons name="trophy" size={24} color={theme.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {topStudents.length > 0 ? `${topStudents[0].totalPoints} pts` : '0'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Top Score
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Students Preview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Achievers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
            <Text style={[styles.sectionActionText, { color: theme.primary }]}>
              View Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {topStudents.map((student) => (
          <Card key={student.studentId} style={styles.studentCard}>
            <View style={styles.studentCardRow}>
              <View style={[styles.rankBadge, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.rankText, { color: theme.primary }]}>
                  #{student.rank}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: theme.text }]}>
                  {student.studentName}
                </Text>
                <Text style={[styles.studentMeta, { color: theme.textSecondary }]}>
                  {student.studentIdNumber} • {student.gradeLevel}
                </Text>
              </View>
              <Badge
                label={`${student.totalPoints} pts`}
                variant="primary"
                size="md"
              />
            </View>
          </Card>
        ))}
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
  deptText: {
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
  ctaCard: {
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.xl,
    marginBottom: spacing.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  ctaTitle: {
    color: '#ffffff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  ctaSub: {
    color: '#cbd5e1',
    fontSize: typography.sizes.xs,
    lineHeight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
  },
  ctaButtonText: {
    color: '#4338ca',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 0.48,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
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
  studentCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  studentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  studentMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
});

