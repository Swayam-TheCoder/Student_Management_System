import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { getDefaultBaseUrl } from '../../utils/env';
import { secureStorage } from '../../utils/secureStorage';
import { apiClient } from '../../api/client';
import { spacing, typography } from '../../theme';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [apiUrl, setApiUrl] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    secureStorage.getCustomApiUrl().then((saved) => {
      setApiUrl(saved || getDefaultBaseUrl());
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) {
      const def = getDefaultBaseUrl();
      setApiUrl(def);
      await secureStorage.saveCustomApiUrl(def);
    } else {
      await secureStorage.saveCustomApiUrl(apiUrl.trim());
    }
    setIsEditingUrl(false);
    testConnection();
  };

  const handleResetApiUrl = async () => {
    const def = getDefaultBaseUrl();
    setApiUrl(def);
    await secureStorage.saveCustomApiUrl(def);
    setIsEditingUrl(false);
    testConnection();
  };

  const testConnection = async () => {
    setTestResult('Testing...');
    try {
      const res = await apiClient.get('/health');
      if (res.data?.success) {
        setTestResult('Connected (Status: UP)');
      } else {
        setTestResult('Unexpected response');
      }
    } catch (e: any) {
      setTestResult('Connection failed. Verify server is running.');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Application preferences and account details
          </Text>
        </View>

        {/* Appearance Card */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Appearance</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={22}
                color={theme.primary}
                style={{ marginRight: spacing.sm }}
              />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>

        {/* Account Details */}
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Current Session</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>User</Text>
            <Text style={[styles.settingValue, { color: theme.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Role</Text>
            <Badge label={user?.role ?? 'STUDENT'} variant="primary" size="sm" />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[styles.settingValue, { color: theme.text }]}>{user?.email}</Text>
          </View>
        </Card>

        {/* System & Connection Info */}
        <Card>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Backend Server URL</Text>
            <TouchableOpacity onPress={() => setIsEditingUrl(!isEditingUrl)}>
              <Text style={[styles.editLink, { color: theme.primary }]}>
                {isEditingUrl ? 'Cancel' : 'Edit URL'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingUrl ? (
            <View style={styles.editUrlBox}>
              <TextInput
                value={apiUrl}
                onChangeText={setApiUrl}
                autoCapitalize="none"
                style={[
                  styles.urlInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />
              <View style={styles.urlBtnRow}>
                <Button
                  title="Save & Test"
                  onPress={handleSaveApiUrl}
                  size="sm"
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Button
                  title="Reset Default"
                  variant="secondary"
                  onPress={handleResetApiUrl}
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>API Host</Text>
              <Text style={[styles.settingValue, { color: theme.text }]} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          )}

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Connection Test</Text>
            <TouchableOpacity onPress={testConnection}>
              <Text style={[styles.settingValue, { color: theme.primary, fontWeight: typography.weights.bold }]}>
                {testResult || 'Ping Server'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>Security</Text>
            <Text style={[styles.settingValue, { color: theme.success }]}>
              HMAC-SHA256 Bearer JWT
            </Text>
          </View>
        </Card>

        {/* Sign Out Action */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => dispatch(logout())}
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
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  editLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  editUrlBox: {
    marginVertical: spacing.sm,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  urlBtnRow: {
    flexDirection: 'row',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  settingTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  settingDesc: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  settingValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    maxWidth: '65%',
  },
  logoutBtn: {
    marginTop: spacing.md,
  },
});
