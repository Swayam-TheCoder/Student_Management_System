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
import { CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { studentApi } from '../../api/studentApi';
import { leaderboardApi } from '../../api/leaderboardApi';
import { classApi } from '../../api/classApi';
import { LeaderboardEntry } from '../../types/leaderboard';
import { ClassRoom } from '../../types/class';
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
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create Class Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSection, setNewSection] = useState('');
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [studentsRes, lbRes, classesRes] = await Promise.all([
        studentApi.getStudents(undefined, 0, 1),
        leaderboardApi.getLeaderboard(0, 3),
        classApi.getMyClasses(),
      ]);

      setTotalStudentsCount(studentsRes.totalElements);
      setTopStudents(lbRes.content);
      setClasses(classesRes);
    } catch (e) {
      console.warn('Failed to load teacher dashboard', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateClass = async () => {
    setCreateError(null);
    if (!newClassName.trim() || !newSubject.trim() || !newSection.trim()) {
      setCreateError('Please complete all fields (Class Name, Subject, and Section)');
      return;
    }

    setIsCreatingClass(true);
    try {
      await classApi.createClass({
        className: newClassName.trim(),
        subject: newSubject.trim(),
        section: newSection.trim(),
      });
      setNewClassName('');
      setNewSubject('');
      setNewSection('');
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create class. Please try again.';
      setCreateError(msg);
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
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
              Faculty & Staff Dashboard
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
                Recognize academic excellence, classroom conduct, or apply disciplinary adjustments to enrolled students
              </Text>
            </View>
            <View style={styles.ctaButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AwardPoints')}
                style={[
                  styles.ctaButton,
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Ionicons name="add-circle" size={18} color="#4338ca" />
                <Text style={styles.ctaButtonText}>Award Points</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsCreateModalOpen(true)}
                style={[
                  styles.ctaSecondaryButton,
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Ionicons name="school-outline" size={18} color="#ffffff" />
                <Text style={styles.ctaSecondaryButtonText}>New Class</Text>
              </TouchableOpacity>
            </View>
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
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people" size={22} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {totalStudentsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Enrolled Students
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: theme.successLight }]}>
              <Ionicons name="book" size={22} color={theme.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {classes.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Classes
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Leaderboard')}
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: theme.warningLight }]}>
              <Ionicons name="trophy" size={22} color={theme.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {topStudents.length > 0 ? `${topStudents[0].totalPoints} pts` : '0 pts'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Top Score
            </Text>
          </TouchableOpacity>
        </View>

        {/* Classes & Enrollment Codes Management */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Classes & Enrollment Codes</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Share code with students so they can enroll and receive points
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCreateModalOpen(true)}
            style={[
              styles.newClassHeaderBtn,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <Ionicons name="add" size={16} color={theme.primary} />
            <Text style={[styles.newClassHeaderBtnText, { color: theme.primary }]}>
              Create Class
            </Text>
          </TouchableOpacity>
        </View>

        {classes.length === 0 ? (
          <Card style={styles.emptyClassCard}>
            <Ionicons name="school-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyClassTitle, { color: theme.text }]}>
              No Classes Created Yet
            </Text>
            <Text style={[styles.emptyClassSub, { color: theme.textSecondary }]}>
              Create your first classroom group to generate an enrollment code for your students.
            </Text>
            <Button
              title="Create My First Class"
              onPress={() => setIsCreateModalOpen(true)}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ) : (
          classes.map((cls) => (
            <Card key={cls.id} style={styles.classCard}>
              <View style={styles.classCardRow}>
                <View
                  style={[
                    styles.classIconBox,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Ionicons name="school" size={20} color={theme.primary} />
                </View>

                <View style={styles.classInfo}>
                  <Text style={[styles.className, { color: theme.text }]}>
                    {cls.className}
                  </Text>
                  <Text style={[styles.classMeta, { color: theme.textSecondary }]}>
                    {cls.subject} • {cls.section} • {cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}
                  </Text>
                </View>

                {/* Enrollment Code Pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCopyCode(cls.enrollmentCode)}
                  style={[
                    styles.codeBadge,
                    {
                      backgroundColor: copiedCode === cls.enrollmentCode ? theme.successLight : theme.inputBackground,
                      borderColor: copiedCode === cls.enrollmentCode ? theme.success : theme.border,
                    },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Ionicons
                    name={copiedCode === cls.enrollmentCode ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={copiedCode === cls.enrollmentCode ? theme.success : theme.primary}
                  />
                  <Text
                    style={[
                      styles.codeBadgeText,
                      {
                        color: copiedCode === cls.enrollmentCode ? theme.success : theme.primary,
                      },
                    ]}
                  >
                    {copiedCode === cls.enrollmentCode ? 'Copied!' : cls.enrollmentCode}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        {/* Top Students Preview */}
        <View style={[styles.sectionHeaderRow, { marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Achievers</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            style={Platform.select({ web: { cursor: 'pointer' } as any })}
          >
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

      {/* Create Class Modal */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
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
                <Ionicons name="school" size={22} color={theme.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Create New Classroom
              </Text>
            </View>

            {createError && (
              <View style={[styles.modalErrorBanner, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle" size={16} color={theme.danger} />
                <Text style={[styles.modalErrorText, { color: theme.danger }]}>
                  {createError}
                </Text>
              </View>
            )}

            <Input
              label="Class Name"
              placeholder="e.g. AP Computer Science A"
              value={newClassName}
              onChangeText={setNewClassName}
            />

            <Input
              label="Subject"
              placeholder="e.g. Computer Science"
              value={newSubject}
              onChangeText={setNewSubject}
            />

            <Input
              label="Section / Period"
              placeholder="e.g. Section 1A or Period 3"
              value={newSection}
              onChangeText={setNewSection}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsCreateModalOpen(false)}
                disabled={isCreatingClass}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Create Class"
                variant="primary"
                onPress={handleCreateClass}
                loading={isCreatingClass}
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
    flexWrap: 'wrap',
    gap: 12,
  },
  ctaTextContainer: {
    flex: 1,
    minWidth: 200,
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
    lineHeight: 18,
  },
  ctaButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: spacing.borderRadius.full,
  },
  ctaButtonText: {
    color: '#4338ca',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
    marginLeft: 6,
  },
  ctaSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ctaSecondaryButtonText: {
    color: '#ffffff',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
    width: '100%',
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  sectionActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  newClassHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
  },
  newClassHeaderBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
  },
  emptyClassCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyClassTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  emptyClassSub: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
    maxWidth: 360,
  },
  classCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  classCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  classInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  className: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  classMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  codeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
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
    marginRight: spacing.sm,
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  studentMeta: {
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
    maxWidth: 480,
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
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalErrorText: {
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
