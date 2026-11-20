import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { useTheme } from '../context/ThemeContext';
import { SplashScreen } from '../features/auth/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { TeacherNavigator } from './TeacherNavigator';

export const RootNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isRestoringAuth, user } = useAppSelector((state) => state.auth);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  if (isRestoringAuth) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'STUDENT' ? (
        <StudentNavigator />
      ) : (
        <TeacherNavigator />
      )}
    </NavigationContainer>
  );
};

