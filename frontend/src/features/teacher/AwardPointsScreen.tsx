import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch } from '../../store/hooks';
import { refreshLeaderboard } from '../../store/slices/leaderboardSlice';
import { studentApi } from '../../api/studentApi';
import { pointApi } from '../../api/pointApi';
import { StudentDetail } from '../../types/student';
import { TransactionType } from '../../types/points';
import { TeacherTabParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

type AwardPointsRouteProp = RouteProp<TeacherTabParamList, 'AwardPoints'>;

interface AwardPointsScreenProps {
  route: AwardPointsRouteProp;
}

const TRANSACTION_TYPES: { type: TransactionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'ACADEMIC', label: 'Academic Excellence', icon: 'ribbon-outline' },
  { type: 'PARTICIPATION', label: 'Active Participation', icon: 'chatbubbles-outline' },
  { type: 'BEHAVIOR', label: 'Exemplary Conduct', icon: 'heart-outline' },
  { type: 'PENALTY', label: 'Disciplinary Penalty', icon: 'warning-outline' },
  { type: 'ADJUSTMENT', label: 'Manual Adjustment', icon: 'options-outline' },
];

export const AwardPointsScreen: React.FC<AwardPointsScreenProps> = ({ route }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const preselectedId = route.params?.preselectedStudentId;
  const preselectedName = route.params?.preselectedStudentName;

  const [studentList, setStudentList] = useState<StudentDetail[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(preselectedId || null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>(preselectedName || '');
  const [pointsInput, setPointsInput] = useState<string>('25');
  const [selectedType, setSelectedType] = useState<TransactionType>('ACADEMIC');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const loadEnrolledStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const res = await studentApi.getStudents(undefined, 0, 100);
      setStudentList(res.content);
      if (preselectedId) {
        const found = res.content.find((s) => s.id === preselectedId);
        if (found) {
          setSelectedStudentName(`${found.firstName} ${found.lastName} (${found.studentIdNumber})`);
        }
      }
    } catch (e) {
      console.warn('Failed to load enrolled students roster', e);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [preselectedId]);

  useFocusEffect(
    useCallback(() => {
      loadEnrolledStudents();
    }, [loadEnrolledStudents])
  );

  useEffect(() => {
    if (preselectedId && preselectedName) {
      setSelectedStudentId(preselectedId);
      setSelectedStudentName(preselectedName);
    }
  }, [preselectedId, preselectedName]);

  const handleStudentSelect = (student: StudentDetail) => {
    setSelectedStudentId(student.id);
    setSelectedStudentName(`${student.firstName} ${student.lastName} (${student.studentIdNumber})`);
  };

  const handleQuickPointSelect = (pts: number) => {
    setPointsInput(pts.toString());
  };

  const handleOpenConfirm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedStudentId) {
      setErrorMessage('Please select a student enrolled in your classes');
      return;
    }

    const points = parseInt(pointsInput, 10);
    if (isNaN(points) || points === 0) {
      setErrorMessage('Points value must be a valid non-zero integer');
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setErrorMessage('Reason must be at least 3 characters');
      return;
    }

    setIsConfirmModalVisible(true);
  };

  const handleExecuteAllocation = async () => {
    if (!selectedStudentId) return;

    const points = parseInt(pointsInput, 10);
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await pointApi.awardPoints({
        studentId: selectedStudentId,
        points,
        transactionType: selectedType,
        reason: reason.trim(),
      });

      setIsConfirmModalVisible(false);
      setSuccessMessage(
        `Success! ${points > 0 ? '+' : ''}${points} points allocated to ${res.studentName}. New balance: ${
          res.updatedTotalPoints
        } pts.`
      );
      setReason('');
      dispatch(refreshLeaderboard());
      // Refresh local list to show updated total points
      loadEnrolledStudents();
    } catch (err: any) {
      setIsConfirmModalVisible(false);
      const msg =
        err?.response?.data?.message || 'Failed to award points. Please check inputs and class authorization.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pointsValue = parseInt(pointsInput, 10) || 0;
  const isDeduction = pointsValue < 0 || selectedType === 'PENALTY';

  return (
    <ScreenContainer maxWidth={680}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Point Allocation & Adjustment</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Recognize merit, active participation, or apply disciplinary score adjustments
            </Text>
          </View>

          {successMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: theme.successLight }]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.feedbackText, { color: theme.success }]}>
                {successMessage}
              </Text>
            </View>
          )}

          {errorMessage && (
            <View style={[styles.feedbackBanner, { backgroundColor: theme.dangerLight }]}>
              <Ionicons name="alert-circle" size={20} color={theme.danger} />
              <Text style={[styles.feedbackText, { color: theme.danger }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Student Selector */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Target Student (Enrolled in Your Classes)
            </Text>

            {selectedStudentName ? (
              <View style={[styles.selectedStudentBox, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="person-circle-outline" size={24} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[styles.selectedStudentText, { color: theme.text }]}>
                    {selectedStudentName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStudentId(null);
                    setSelectedStudentName('');
                  }}
                  style={Platform.select({ web: { cursor: 'pointer' } as any })}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ) : null}

            {studentList.length === 0 ? (
              <View style={[styles.emptyRosterBox, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
                <Text style={[styles.emptyRosterText, { color: theme.textSecondary }]}>
                  No students are enrolled in your classes yet. Create a class from Dashboard and share your enrollment code to allow students to enroll.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TeacherDashboard')}
                  style={[styles.goToDashBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.goToDashBtnText}>Go to Class Management</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[styles.pickerHint, { color: theme.textSecondary }]}>
                  Choose from enrolled class roster:
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.studentsRow}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {studentList.map((s) => {
                    const isSelected = selectedStudentId === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.75}
                        onPress={() => handleStudentSelect(s)}
                        style={[
                          styles.studentChip,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.inputBackground,
                            borderColor: isSelected ? theme.primary : theme.border,
                            borderWidth: 1,
                          },
                          Platform.select({ web: { cursor: 'pointer' } as any }),
                        ]}
                      >
                        <Text
                          style={[
                            styles.studentChipText,
                            { color: isSelected ? '#ffffff' : theme.text },
                          ]}
                        >
                          {s.firstName} {s.lastName}
                        </Text>
                        <Badge
                          label={`${s.totalPoints} pts`}
                          variant={isSelected ? 'success' : 'neutral'}
                          size="sm"
                          style={{ marginLeft: 6 }}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </Card>

          {/* Transaction Type Picker */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Transaction Category
            </Text>
            <View style={styles.typesGrid}>
              {TRANSACTION_TYPES.map((t) => {
                const isSelected = selectedType === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    activeOpacity={0.8}
                    onPress={() => setSelectedType(t.type)}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.inputBackground,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                      Platform.select({ web: { cursor: 'pointer' } as any }),
                    ]}
                  >
                    <Ionicons
                      name={t.icon}
                      size={18}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: isSelected ? theme.primary : theme.text },
                        isSelected && { fontWeight: typography.weights.bold },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Points Amount */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Points Value
            </Text>

            {/* Quick Select Chips */}
            <View style={styles.quickPointsRow}>
              {[10, 25, 50, 100, -10, -25].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => handleQuickPointSelect(val)}
                  style={[
                    styles.quickPointChip,
                    {
                      backgroundColor:
                        pointsInput === val.toString()
                          ? theme.primary
                          : theme.inputBackground,
                    },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Text
                    style={{
                      color: pointsInput === val.toString() ? '#ffffff' : theme.text,
                      fontWeight: typography.weights.bold,
                      fontSize: typography.sizes.xs,
                    }}
                  >
                    {val > 0 ? `+${val}` : val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Custom Points Amount (Positive to award, Negative to deduct)"
              placeholder="e.g. 50 or -20"
              keyboardType="numbers-and-punctuation"
              value={pointsInput}
              onChangeText={setPointsInput}
            />
          </Card>

          {/* Reason Input */}
          <Card>
            <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
              Reason & Context (Required)
            </Text>
            <Input
              placeholder="Explain why points are being awarded or deducted..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: spacing.sm }}
            />
          </Card>

          <Button
            title={isDeduction ? 'Deduct Points' : 'Award Points'}
            variant={isDeduction ? 'danger' : 'primary'}
            onPress={handleOpenConfirm}
            loading={isSubmitting}
            disabled={studentList.length === 0}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Cross-Platform Confirmation Modal (Works 100% on Web & Native) */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconBox,
                  {
                    backgroundColor: isDeduction ? theme.dangerLight : theme.primaryLight,
                  },
                ]}
              >
                <Ionicons
                  name={isDeduction ? 'remove-circle-outline' : 'sparkles-outline'}
                  size={24}
                  color={isDeduction ? theme.danger : theme.primary}
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Confirm Point {isDeduction ? 'Deduction' : 'Allocation'}
              </Text>
            </View>

            <View style={[styles.modalBody, { backgroundColor: theme.inputBackground }]}>
              <View style={styles.modalDetailRow}>
                <Text style={[styles.modalDetailLabel, { color: theme.textSecondary }]}>
                  Student:
                </Text>
                <Text style={[styles.modalDetailValue, { color: theme.text }]}>
                  {selectedStudentName}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={[styles.modalDetailLabel, { color: theme.textSecondary }]}>
                  Amount:
                </Text>
                <Text
                  style={[
                    styles.modalDetailValue,
                    {
                      color: isDeduction ? theme.danger : theme.success,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                >
                  {pointsValue > 0 ? `+${pointsValue}` : pointsValue} points
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={[styles.modalDetailLabel, { color: theme.textSecondary }]}>
                  Category:
                </Text>
                <Text style={[styles.modalDetailValue, { color: theme.text }]}>
                  {TRANSACTION_TYPES.find((t) => t.type === selectedType)?.label || selectedType}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={[styles.modalDetailLabel, { color: theme.textSecondary }]}>
                  Reason:
                </Text>
                <Text style={[styles.modalDetailValue, { color: theme.text, flex: 1 }]}>
                  {reason.trim()}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setIsConfirmModalVisible(false)}
                disabled={isSubmitting}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title={isDeduction ? 'Confirm Deduct' : 'Confirm Award'}
                variant={isDeduction ? 'danger' : 'primary'}
                onPress={handleExecuteAllocation}
                loading={isSubmitting}
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  feedbackText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  cardSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  selectedStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
  },
  selectedStudentText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  emptyRosterBox: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  emptyRosterText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginVertical: spacing.sm,
    lineHeight: 18,
  },
  goToDashBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    marginTop: 4,
  },
  goToDashBtnText: {
    color: '#ffffff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  pickerHint: {
    fontSize: typography.sizes.xs,
    marginBottom: 6,
  },
  studentsRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
  },
  studentChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.2,
  },
  typeBtnText: {
    fontSize: typography.sizes.xs,
    marginLeft: 6,
    flex: 1,
  },
  quickPointsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickPointChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.borderRadius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  modalBody: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 8,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalDetailLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    width: 75,
  },
  modalDetailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    flex: 1,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
