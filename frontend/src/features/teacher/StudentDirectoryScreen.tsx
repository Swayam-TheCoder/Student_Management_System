import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { studentApi } from '../../api/studentApi';
import { StudentDetail } from '../../types/student';
import { TeacherStackParamList } from '../../types/navigation';
import { spacing, typography } from '../../theme';

interface StudentDirectoryProps {
  navigation: NativeStackNavigationProp<TeacherStackParamList>;
}

export const StudentDirectoryScreen: React.FC<StudentDirectoryProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchStudents = useCallback(
    async (pageToLoad: number, query: string, refresh: boolean = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageToLoad > 0) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await studentApi.getStudents(query, pageToLoad, 10);
        if (refresh || pageToLoad === 0) {
          setStudents(res.content);
        } else {
          setStudents((prev) => [...prev, ...res.content]);
        }
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.warn('Failed to load students directory', e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStudents(0, searchQuery);
  }, [fetchStudents, searchQuery]);

  const onRefresh = () => {
    fetchStudents(0, searchQuery, true);
  };

  const onEndReached = () => {
    if (!isLoading && !isLoadingMore && page + 1 < totalPages) {
      fetchStudents(page + 1, searchQuery);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Student Directory</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Search, review profiles, and view transaction history
          </Text>

          {/* Search Bar */}
          <Input
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            leftIcon={
              <Ionicons name="search-outline" size={20} color={theme.textMuted} />
            }
          />
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
              >
                <Card style={styles.studentCard}>
                  <View style={styles.cardRow}>
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: theme.primaryLight },
                      ]}
                    >
                      <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item.firstName.charAt(0)}
                        {item.lastName.charAt(0)}
                      </Text>
                    </View>

                    <View style={styles.infoCol}>
                      <Text style={[styles.studentName, { color: theme.text }]}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={[styles.studentMeta, { color: theme.textSecondary }]}>
                        {item.studentIdNumber} • {item.gradeLevel}
                      </Text>
                    </View>

                    <View style={styles.pointsCol}>
                      <Badge
                        label={`${item.totalPoints} pts`}
                        variant="primary"
                        size="md"
                      />
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.textMuted}
                        style={{ marginTop: 4, alignSelf: 'center' }}
                      />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
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
                icon="people-outline"
                title="No students found"
                subtitle="Try searching with a different name or student ID number."
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
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    marginBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  studentCard: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  studentMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  pointsCol: {
    alignItems: 'flex-end',
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

