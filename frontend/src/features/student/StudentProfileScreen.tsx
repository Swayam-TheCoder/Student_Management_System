import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { formatDate } from '../../utils/formatters';
import { spacing, typography } from '../../theme';

export const StudentProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user, studentProfile } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScreenContainer maxWidth={640}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Avatar Card */}
        <Card style={styles.profileHeaderCard}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="person" size={52} color={theme.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user?.email}
          </Text>
          <View style={styles.badgeRow}>
            <Badge label="STUDENT" variant="primary" size="sm" />
            <Badge label="Active Enrollment" variant="success" size="sm" />
          </View>
        </Card>

        {/* Academic Details Card */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Academic Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="id-card-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Student ID Number
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {studentProfile?.studentIdNumber ?? 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="bookmark-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Grade / Class Level
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {studentProfile?.gradeLevel ?? 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="trophy-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Total Point Balance
              </Text>
            </View>
            <Text
              style={[
                styles.detailValue,
                { color: theme.primary, fontWeight: typography.weights.bold },
              ]}
            >
              {studentProfile?.totalPoints ?? 0} pts
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailLabelGroup}>
              <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Registered Date
              </Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(user?.createdAt || '')}
            </Text>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color={theme.primary} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarLarge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  logoutBtn: {
    marginTop: spacing.md,
  },
});
