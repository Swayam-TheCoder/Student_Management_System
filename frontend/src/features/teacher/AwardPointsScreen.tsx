import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
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
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  const preselectedId = route.params?.preselectedStudentId;
  const preselectedName = route.params?.preselectedStudentName;

  const [studentList, setStudentList] = useState<StudentDetail[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(preselectedId || null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>(preselectedName || '');
  const [pointsInput, setPointsInput] = useState<string>('25');
  const [selectedType, setSelectedType] = useState<TransactionType>('ACADEMIC');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    studentApi.getStudents(undefined, 0, 100).then((res) => {
      setStudentList(res.content);
      if (preselectedId) {
        const found = res.content.find((s) => s.id === preselectedId);
        if (found) {
          setSelectedStudentName(`${found.firstName} ${found.lastName} (${found.studentIdNumber})`);
        }
      }
    });
  }, [preselectedId]);

  const handleStudentSelect = (student: StudentDetail) => {
    setSelectedStudentId(student.id);
    setSelectedStudentName(`${student.firstName} ${student.lastName} (${student.studentIdNumber})`);
  };

  const handleQuickPointSelect = (pts: number) => {
    setPointsInput(pts.toString());
  };

  const handleSubmit = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedStudentId) {
      setErrorMessage('Please select a student');
      return;
    }

    const points = parseInt(pointsInput, 10);
    if (isNaN(points) || points === 0) {
      setErrorMessage('Points value must be a valid non-zero number');
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setErrorMessage('Reason must be at least 3 characters');
      return;
    }

    const actionText = points > 0 ? 'award' : 'deduct';
    const absPoints = Math.abs(points);

    Alert.alert(
      'Confirm Point Allocation',
      `Are you sure you want to ${actionText} ${absPoints} points ${points > 0 ? 'to' : 'from'
      } ${selectedStudentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const res = await pointApi.awardPoints({
                studentId: selectedStudentId,
                points,
                transactionType: selectedType,
                reason: reason.trim(),
              });

              setSuccessMessage(
                `Success! ${points > 0 ? '+' : ''}${points} points allocated. New balance: ${res.updatedTotalPoints
                } pts.`
              );
              setReason('');
              dispatch(refreshLeaderboard());
            } catch (err: any) {
              const msg =
                err?.response?.data?.message || 'Failed to award points. Please check inputs.';
              setErrorMessage(msg);
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

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
              Recognize merit, active participation, or apply disciplinary score deductions
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
              Target Student
            </Text>
            {selectedStudentName ? (
              <View style={[styles.selectedStudentBox, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="person-circle-outline" size={22} color={theme.primary} />
                <Text style={[styles.selectedStudentText, { color: theme.text }]}>
                  {selectedStudentName}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.pickerHint, { color: theme.textSecondary }]}>
              Choose from class roster:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.studentsRow}
              contentContainerStyle={{ gap: 8 }}
            >
              {studentList.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.75}
                  onPress={() => handleStudentSelect(s)}
                  style={[
                    styles.studentChip,
                    {
                      backgroundColor:
                        selectedStudentId === s.id ? theme.primary : theme.inputBackground,
                    },
                    Platform.select({ web: { cursor: 'pointer' } as any }),
                  ]}
                >
                  <Text
                    style={[
                      styles.studentChipText,
                      { color: selectedStudentId === s.id ? '#ffffff' : theme.text },
                    ]}
                  >
                    {s.firstName} {s.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            title={parseInt(pointsInput, 10) < 0 ? 'Deduct Points' : 'Award Points'}
            variant={parseInt(pointsInput, 10) < 0 ? 'danger' : 'primary'}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginLeft: spacing.sm,
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
});
