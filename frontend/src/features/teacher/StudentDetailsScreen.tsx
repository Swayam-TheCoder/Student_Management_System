import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TransactionItem } from '../../components/points/TransactionItem';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { studentApi } from '../../api/studentApi';
import { StudentDetail } from '../../types/student';
import { PointTransaction } from '../../types/points';
import { TeacherStackParamList } from '../../types/navigation';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

type StudentDetailsRouteProp = RouteProp<TeacherStackParamList, 'StudentDetails'>;

interface StudentDetailsProps {
  route: StudentDetailsRouteProp;
  navigation: NativeStackNavigationProp<TeacherStackParamList>;
}

export const StudentDetailsScreen: React.FC<StudentDetailsProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { studentId } = route.params;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [studentData, txData] = await Promise.all([
        studentApi.getStudentById(studentId),
        studentApi.getStudentTransactions(studentId, 0, 10),
      ]);
      setStudent(studentData);
      setTransactions(txData.content);
    } catch (e) {
      console.warn('Failed to load student details', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const navigateToAwardPoints = () => {
    if (!student) return;
    navigation.navigate('TeacherTabs', {
      screen: 'AwardPoints',
      params: {
        preselectedStudentId: student.id,
        preselectedStudentName: `${student.firstName} ${student.lastName}`,
      },
    });
  };

  if (isLoading && !isRefreshing) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!student) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="Student not found"
          subtitle="The requested student profile could not be loaded."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Student Profile Card */}
            <Card style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={[styles.studentName, { color: theme.text }]}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={[styles.studentEmail, { color: theme.textSecondary }]}>
                    {student.email}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Badge label={student.studentIdNumber} variant="primary" size="sm" />
                    <View style={{ width: 6 }} />
                    <Badge label={student.gradeLevel} variant="neutral" size="sm" />
                  </View>
                </View>
              </View>

              {/* Total Points Highlight */}
              <View style={[styles.scoreBox, { backgroundColor: theme.inputBackground }]}>
                <View>
                  <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
                    Current Point Balance
                  </Text>
                  <Text style={[styles.scoreValue, { color: theme.primary }]}>
                    {student.totalPoints} pts
                  </Text>
                </View>
                <Button
                  title="Award / Adjust"
                  onPress={navigateToAwardPoints}
                  size="sm"
                  icon={<Ionicons name="add" size={16} color="#ffffff" />}
                />
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>
                  Enrolled on: {formatDate(student.createdAt)}
                </Text>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Transaction Ledger
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="ribbon-outline"
            title="No points recorded yet"
            subtitle="Award points to recognize this student's efforts."
          />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  studentEmail: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  scoreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginTop: spacing.md,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  metaRow: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 10,
  },
  sectionHeader: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});

