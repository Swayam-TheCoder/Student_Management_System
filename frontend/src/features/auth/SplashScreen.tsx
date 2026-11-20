import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { restoreAuth } from '../../store/slices/authSlice';
import { spacing, typography } from '../../theme';

export const SplashScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { isRestoringAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name="school" size={54} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Student Management</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Academic Performance & Point System
      </Text>
      {isRestoringAuth && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Restoring session...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  loadingWrapper: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.sm,
  },
});

