import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAuthError, register } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../types/navigation';
import { Role } from '../../types/auth';
import { spacing, typography } from '../../theme';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  // Student fields
  studentIdNumber: z.string().optional(),
  gradeLevel: z.string().optional(),
  // Teacher fields
  employeeId: z.string().optional(),
  department: z.string().optional(),
  invitationCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [roleValidationError, setRoleValidationError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      studentIdNumber: '',
      gradeLevel: '',
      employeeId: '',
      department: '',
      invitationCode: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setRoleValidationError(null);
    dispatch(clearAuthError());

    if (selectedRole === 'STUDENT') {
      if (!data.studentIdNumber?.trim()) {
        setRoleValidationError('Student ID number is required');
        return;
      }
      if (!data.gradeLevel?.trim()) {
        setRoleValidationError('Grade level is required');
        return;
      }
      dispatch(
        register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STUDENT',
          studentIdNumber: data.studentIdNumber.trim(),
          gradeLevel: data.gradeLevel.trim(),
        })
      );
    } else {
      if (!data.employeeId?.trim()) {
        setRoleValidationError('Employee ID is required');
        return;
      }
      if (!data.department?.trim()) {
        setRoleValidationError('Department is required');
        return;
      }
      if (!data.invitationCode?.trim()) {
        setRoleValidationError('Teacher invitation code is required');
        return;
      }
      dispatch(
        register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'TEACHER',
          employeeId: data.employeeId.trim(),
          department: data.department.trim(),
          invitationCode: data.invitationCode.trim(),
        })
      );
    }
  };

  const isStudent = selectedRole === 'STUDENT';

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join the academic reward and management system
            </Text>
          </View>

          {/* Role Selector Tabs */}
          <View
            style={[
              styles.roleTabsContainer,
              { backgroundColor: theme.inputBackground, borderColor: theme.border },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedRole('STUDENT');
                setRoleValidationError(null);
              }}
              style={[
                styles.roleTab,
                isStudent && [styles.activeRoleTab, { backgroundColor: theme.surface }],
              ]}
            >
              <Ionicons
                name="school-outline"
                size={18}
                color={isStudent ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.roleTabText,
                  { color: isStudent ? theme.primary : theme.textSecondary },
                  isStudent && { fontWeight: typography.weights.bold },
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedRole('TEACHER');
                setRoleValidationError(null);
              }}
              style={[
                styles.roleTab,
                !isStudent && [styles.activeRoleTab, { backgroundColor: theme.surface }],
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={18}
                color={!isStudent ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.roleTabText,
                  { color: !isStudent ? theme.primary : theme.textSecondary },
                  !isStudent && { fontWeight: typography.weights.bold },
                ]}
              >
                Teacher
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {(error || roleValidationError) && (
              <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle" size={18} color={theme.danger} />
                <Text style={[styles.errorBannerText, { color: theme.danger }]}>
                  {roleValidationError || error}
                </Text>
              </View>
            )}

            <View style={styles.nameRow}>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.halfInput}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="name@school.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  leftIcon={
                    <Ionicons name="mail-outline" size={20} color={theme.textMuted} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  isPassword
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                  }
                />
              )}
            />

            {/* Role specific inputs */}
            {isStudent ? (
              <>
                <Controller
                  control={control}
                  name="studentIdNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Student ID Number"
                      placeholder="e.g. STU-2026-001"
                      autoCapitalize="characters"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      leftIcon={
                        <Ionicons name="id-card-outline" size={20} color={theme.textMuted} />
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="gradeLevel"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Grade / Class Level"
                      placeholder="e.g. Grade 11, Class A"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      leftIcon={
                        <Ionicons name="bookmark-outline" size={20} color={theme.textMuted} />
                      }
                    />
                  )}
                />
              </>
            ) : (
              <>
                <Controller
                  control={control}
                  name="employeeId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Employee ID"
                      placeholder="e.g. EMP-2026-101"
                      autoCapitalize="characters"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      leftIcon={
                        <Ionicons name="id-card-outline" size={20} color={theme.textMuted} />
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="department"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Department"
                      placeholder="e.g. Science, Mathematics"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      leftIcon={
                        <Ionicons name="business-outline" size={20} color={theme.textMuted} />
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="invitationCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Teacher Invitation Secret"
                      placeholder="e.g. TEACHER_SECRET_2026"
                      autoCapitalize="none"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      leftIcon={
                        <Ionicons name="key-outline" size={20} color={theme.textMuted} />
                      }
                    />
                  )}
                />
              </>
            )}

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitButton}
            />

            {/* Switch to Login */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Already registered?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  dispatch(clearAuthError());
                  navigation.navigate('Login');
                }}
              >
                <Text style={[styles.footerLink, { color: theme.primary }]}>
                  Sign in here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: spacing.lg,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  activeRoleTab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.sm,
  },
  footerLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
