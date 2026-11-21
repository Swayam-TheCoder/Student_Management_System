import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { refreshProfile } from '../../store/slices/authSlice';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { classApi } from '../../api/classApi';
import { PointTransaction } from '../../types/points';
import { ClassEnrollment } from '../../types/class';
import { StudentTabParamList, RootStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
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
  const [enrolledClasses, setEnrolledClasses] = useState<ClassEnrollment[]>([]);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Join Class Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [enrollmentCodeInput, setEnrollmentCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const studentProfileId = studentProfile?.id;

  const loadDashboardData = useCallback(async () => {
    if (!studentProfileId) return;

    try {
      const [txRes, lbRes, classesRes] = await Promise.all([
        studentApi.getStudentTransactions(studentProfileId, 0, 3),
        leaderboardApi.getLeaderboard(0, 100),
        classApi.getEnrolledClasses(),
      ]);

      setRecentTransactions(txRes.content);
      setEnrolledClasses(classesRes);

      const myEntry = lbRes.content.find((e) => e.studentId === studentProfileId);
      if (myEntry) {
        setCurrentRank(myEntry.rank);
      }

      dispatch(refreshProfile());
    } catch (e) {
      console.warn('Failed to load student dashboard data', e);
    }
  }, [studentProfileId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleJoinClass = async () => {
    setJoinError(null);
    setJoinSuccess(null);

    const cleanCode = enrollmentCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a valid class enrollment code');
      return;
    }

    setIsJoining(true);
    try {
      const res = await classApi.joinClass({ enrollmentCode: cleanCode });
      setJoinSuccess(`Enrolled successfully in ${res.className} (${res.teacherName})!`);
      setEnrollmentCodeInput('');
      await loadDashboardData();
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinSuccess(null);
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to enroll. Please check the code and try again.';
      setJoinError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenContainer maxWidth={960}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              style={[
                styles.heroActionBtn,
                Platform.select({ web: { cursor: 'pointer' } as any }),
              ]}
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
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="time-outline" size={22} color={theme.primary} />
            </View>
            <View style={styles.quickNavTextCol}>
              <Text style={[styles.quickNavTitle, { color: theme.text }]}>Point History</Text>
              <Text style={[styles.quickNavSub, { color: theme.textMuted }]}>
                View all transactions
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsJoinModalOpen(true)}
            style={[
              styles.quickNavBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: theme.successLight }]}>
              <Ionicons name="add-circle-outline" size={22} color={theme.success} />
            </View>
            <View style={styles.quickNavTextCol}>
              <Text style={[styles.quickNavTitle, { color: theme.text }]}>Join Class</Text>
              <Text style={[styles.quickNavSub, { color: theme.textMuted }]}>
                Enter teacher's code
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Enrolled Classes & Faculty */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Classes & Faculty</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Classes you are currently enrolled in
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsJoinModalOpen(true)}
            style={[
              styles.joinClassHeaderBtn,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <Ionicons name="add" size={16} color={theme.primary} />
            <Text style={[styles.joinClassHeaderBtnText, { color: theme.primary }]}>
              Join Class
            </Text>
          </TouchableOpacity>
        </View>

        {enrolledClasses.length === 0 ? (
          <Card style={styles.emptyEnrolledCard}>
            <Ionicons name="school-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyEnrolledTitle, { color: theme.text }]}>
              Not Enrolled in Any Class
            </Text>
            <Text style={[styles.emptyEnrolledSub, { color: theme.textSecondary }]}>
              Ask your teacher for their class enrollment code to join their roster and start earning points.
            </Text>
            <Button
              title="Join a Class Now"
              onPress={() => setIsJoinModalOpen(true)}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ) : (
          enrolledClasses.map((cls) => (
            <Card key={cls.id} style={styles.enrolledClassCard}>
              <View style={styles.enrolledClassRow}>
                <View
                  style={[
                    styles.enrolledIconBox,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Ionicons name="school" size={20} color={theme.primary} />
                </View>
                <View style={styles.enrolledInfo}>
                  <Text style={[styles.enrolledClassName, { color: theme.text }]}>
                    {cls.className}
                  </Text>
                  <Text style={[styles.enrolledTeacher, { color: theme.textSecondary }]}>
                    Faculty: {cls.teacherName} • {cls.subject} ({cls.section})
                  </Text>
                  <Text style={[styles.enrolledDate, { color: theme.textMuted }]}>
                    Enrolled {formatDate(cls.enrolledAt)}
                  </Text>
                </View>
                <Badge label="Enrolled" variant="success" size="sm" />
              </View>
            </Card>
          ))
        )}

        {/* Recent Transactions Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Point Activity</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PointHistory')}
            style={Platform.select({ web: { cursor: 'pointer' } as any })}
          >
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

      {/* Join Class Modal */}
      <Modal
        visible={isJoinModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsJoinModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="key-outline" size={22} color={theme.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Join a Class
              </Text>
            </View>

            {joinSuccess && (
              <View style={[styles.modalBanner, { backgroundColor: theme.successLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.modalBannerText, { color: theme.success }]}>
                  {joinSuccess}
                </Text>
              </View>
            )}

            {joinError && (
              <View style={[styles.modalBanner, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle" size={16} color={theme.danger} />
                <Text style={[styles.modalBannerText, { color: theme.danger }]}>
                  {joinError}
                </Text>
              </View>
            )}

            <Input
              label="Class Enrollment Code"
              placeholder="e.g. CLS-8X2K9P"
              autoCapitalize="characters"
              value={enrollmentCodeInput}
              onChangeText={setEnrollmentCodeInput}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsJoinModalOpen(false)}
                disabled={isJoining}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Enroll in Class"
                variant="primary"
                onPress={handleJoinClass}
                loading={isJoining}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
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
    padding: spacing.xl,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    gap: 4,
  },
  rankBadgeText: {
    color: '#fbbf24',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  heroPointsValue: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: typography.weights.extrabold,
    marginVertical: spacing.sm,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroHint: {
    color: '#94a3b8',
    fontSize: typography.sizes.xs,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.full,
    gap: 4,
  },
  heroActionBtnText: {
    color: '#ffffff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
    width: '100%',
  },
  quickNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
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
  quickNavTextCol: {
    flex: 1,
  },
  quickNavTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  quickNavSub: {
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
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  sectionActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  joinClassHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
  },
  joinClassHeaderBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
  },
  emptyEnrolledCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyEnrolledTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  emptyEnrolledSub: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    maxWidth: 360,
  },
  enrolledClassCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  enrolledClassRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrolledIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  enrolledInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  enrolledClassName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  enrolledTeacher: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  enrolledDate: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
      } as any,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  modalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalBannerText: {
    marginLeft: 6,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
