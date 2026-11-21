import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { RouteProp, useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { classApi } from '../../api/classApi';
import { ClassRoom, ClassStudent } from '../../types/class';
import { TeacherStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type ClassDetailsRouteProp = RouteProp<TeacherStackParamList, 'ClassDetails'>;

interface ClassDetailsScreenProps {
  route: ClassDetailsRouteProp;
}

export const ClassDetailsScreen: React.FC<ClassDetailsScreenProps> = ({ route }) => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const { classId } = route.params;

  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enrollment Code Copy State
  const [copiedCode, setCopiedCode] = useState(false);

  // Regenerate Code Modal State
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadData = useCallback(async (query?: string, showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [classData, studentsData] = await Promise.all([
        classApi.getClassById(classId),
        classApi.getClassStudents(classId, query),
      ]);
      setClassRoom(classData);
      setStudents(studentsData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load classroom details. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData(searchQuery);
  }, [loadData, searchQuery]);

  const onRefresh = () => {
    loadData(searchQuery, true);
  };

  const handleCopyCode = () => {
    if (!classRoom) return;
    setCopiedCode(true);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(classRoom.enrollmentCode);
    }
    setTimeout(() => {
      setCopiedCode(false);
    }, 2500);
  };

  const handleRegenerateCode = async () => {
    if (!classRoom) return;
    setIsRegenerating(true);
    try {
      const updated = await classApi.regenerateCode(classRoom.id);
      setClassRoom(updated);
      setIsRegenerateModalOpen(false);
      setActionFeedback(`Enrollment code successfully regenerated: ${updated.enrollmentCode}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to regenerate code.';
      setErrorMessage(msg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const navigateToAwardPoints = (student: ClassStudent) => {
    navigation.navigate('TeacherTabs', {
      screen: 'AwardPoints',
      params: {
        preselectedStudentId: student.studentId,
        preselectedStudentName: `${student.firstName} ${student.lastName} (${student.studentIdNumber})`,
      },
    });
  };

  if (isLoading && !isRefreshing) {
    return (
      <ScreenContainer maxWidth={960}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading classroom roster...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (errorMessage && !classRoom) {
    return (
      <ScreenContainer maxWidth={960}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to Load Class</Text>
          <Text style={[styles.errorSub, { color: theme.textSecondary }]}>{errorMessage}</Text>
          <Button title="Retry" variant="primary" onPress={() => loadData(searchQuery)} style={{ marginTop: spacing.md }} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={960}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Navigation Back Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
              Platform.select({ web: { cursor: 'pointer' } as any }),
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={theme.text} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>Back to Classes</Text>
          </TouchableOpacity>
        </View>

        {actionFeedback && (
          <View style={[styles.feedbackBanner, { backgroundColor: theme.successLight }]}>
            <Ionicons name="checkmark-circle" size={18} color={theme.success} />
            <Text style={[styles.feedbackText, { color: theme.success }]}>{actionFeedback}</Text>
          </View>
        )}

        {/* Class Overview Hero Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewTitleCol}>
              <View style={styles.classBadgeRow}>
                <Badge label={classRoom?.subject || 'Class'} variant="primary" size="sm" />
                <Badge label={classRoom?.section || 'Sec'} variant="neutral" size="sm" style={{ marginLeft: 6 }} />
              </View>
              <Text style={[styles.className, { color: theme.text }]}>
                {classRoom?.className}
              </Text>
              <Text style={[styles.classInstructor, { color: theme.textSecondary }]}>
                Lead Faculty: {classRoom?.teacherName} • Created {classRoom?.createdAt ? formatDate(classRoom.createdAt) : ''}
              </Text>
            </View>

            {/* Quick Stats Pill */}
            <View style={[styles.studentCountBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people" size={20} color={theme.primary} />
              <Text style={[styles.studentCountNumber, { color: theme.primary }]}>
                {classRoom?.studentCount ?? 0}
              </Text>
              <Text style={[styles.studentCountLabel, { color: theme.primary }]}>
                {classRoom?.studentCount === 1 ? 'Student' : 'Students'}
              </Text>
            </View>
          </View>

          {/* Enrollment Code Management Panel */}
          <View style={[styles.codeSection, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
            <View style={styles.codeTextCol}>
              <Text style={[styles.codeSectionTitle, { color: theme.textSecondary }]}>
                CLASS ENROLLMENT CODE
              </Text>
              <Text style={[styles.codeSectionSub, { color: theme.textMuted }]}>
                Share this secure code with students to allow them to join this classroom
              </Text>
            </View>

            <View style={styles.codeActionsRow}>
              {/* Enrollment Code Box */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCopyCode}
                style={[
                  styles.codeDisplayBox,
                  {
                    backgroundColor: copiedCode ? theme.successLight : theme.card,
                    borderColor: copiedCode ? theme.success : theme.primary,
                  },
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Ionicons
                  name={copiedCode ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copiedCode ? theme.success : theme.primary}
                />
                <Text
                  style={[
                    styles.codeDisplayText,
                    { color: copiedCode ? theme.success : theme.primary },
                  ]}
                >
                  {copiedCode ? 'Copied!' : classRoom?.enrollmentCode}
                </Text>
              </TouchableOpacity>

              {/* Regenerate Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsRegenerateModalOpen(true)}
                style={[
                  styles.regenerateBtn,
                  { borderColor: theme.border, backgroundColor: theme.card },
                  Platform.select({ web: { cursor: 'pointer' } as any }),
                ]}
              >
                <Ionicons name="refresh-outline" size={15} color={theme.textSecondary} />
                <Text style={[styles.regenerateBtnText, { color: theme.textSecondary }]}>
                  New Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Enrolled Students Section Header & Search */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Enrolled Students ({students.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Students officially enrolled from PostgreSQL database
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <Input
          placeholder="Filter students by name or student ID number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: spacing.md }}
          leftIcon={<Ionicons name="search-outline" size={18} color={theme.textMuted} />}
        />

        {/* Enrolled Students Roster List */}
        {students.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={searchQuery ? 'No matching students found' : 'No Students Enrolled Yet'}
            subtitle={
              searchQuery
                ? `No students in this class match "${searchQuery}".`
                : `Share code "${classRoom?.enrollmentCode}" with your students so they can join this class from their dashboard.`
            }
          />
        ) : (
          students.map((student) => (
            <Card key={student.enrollmentId} style={styles.studentCard}>
              <View style={styles.studentRow}>
                {/* Avatar Icon */}
                <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </Text>
                </View>

                {/* Student Info */}
                <View style={styles.studentInfoCol}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.studentName, { color: theme.text }]}>
                      {student.firstName} {student.lastName}
                    </Text>
                    <Badge
                      label={`${student.totalPoints} pts`}
                      variant="primary"
                      size="sm"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                  <Text style={[styles.studentMeta, { color: theme.textSecondary }]}>
                    ID: {student.studentIdNumber} • {student.email} • {student.gradeLevel}
                  </Text>
                  <Text style={[styles.enrolledMeta, { color: theme.textMuted }]}>
                    Enrolled on {formatDate(student.enrolledAt)}
                  </Text>
                </View>

                {/* Quick Action: Award Points */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigateToAwardPoints(student)}
                  style={[
                    styles.awardActionBtn,
                    { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Ionicons name="add-circle" size={16} color={theme.primary} />
                  <Text style={[styles.awardActionText, { color: theme.primary }]}>
                    Award
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Regenerate Code Confirmation Modal */}
      <Modal
        visible={isRegenerateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRegenerateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: theme.warningLight }]}>
                <Ionicons name="key" size={22} color={theme.warning} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Regenerate Enrollment Code
              </Text>
            </View>

            <Text style={[styles.modalWarningText, { color: theme.textSecondary }]}>
              Are you sure you want to regenerate the enrollment code for <Text style={{ fontWeight: 'bold', color: theme.text }}>{classRoom?.className}</Text>?
            </Text>
            <Text style={[styles.modalWarningSub, { color: theme.textMuted }]}>
              • The previous code will immediately be deactivated for future enrollments.{'\n'}
              • All currently enrolled students ({classRoom?.studentCount ?? 0}) will remain enrolled with no interruption.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsRegenerateModalOpen(false)}
                disabled={isRegenerating}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Regenerate Code"
                variant="primary"
                onPress={handleRegenerateCode}
                loading={isRegenerating}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.sm,
  },
  errorSub: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  backButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  feedbackText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  overviewCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewTitleCol: {
    flex: 1,
    minWidth: 240,
  },
  classBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  className: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  classInstructor: {
    fontSize: typography.sizes.xs,
  },
  studentCountBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    minWidth: 90,
  },
  studentCountNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  studentCountLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  codeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
  },
  codeTextCol: {
    flex: 1,
    minWidth: 200,
  },
  codeSectionTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  codeSectionSub: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  codeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
    gap: 6,
  },
  codeDisplayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  regenerateBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  sectionHeaderRow: {
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
  studentCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  studentInfoCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  studentName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  studentMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  enrolledMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  awardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  awardActionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
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
    maxWidth: 460,
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
    marginBottom: spacing.sm,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  modalWarningText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  modalWarningSub: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
