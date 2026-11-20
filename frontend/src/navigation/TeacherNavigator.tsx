import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TeacherDashboardScreen } from '../features/teacher/TeacherDashboardScreen';
import { StudentDirectoryScreen } from '../features/teacher/StudentDirectoryScreen';
import { AwardPointsScreen } from '../features/teacher/AwardPointsScreen';
import { StudentDetailsScreen } from '../features/teacher/StudentDetailsScreen';
import { LeaderboardScreen } from '../features/leaderboard/LeaderboardScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { TeacherStackParamList, TeacherTabParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<TeacherTabParamList>();
const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherTabs: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          ...Platform.select({
            web: {
              boxShadow: isDark
                ? '0 -2px 10px rgba(0, 0, 0, 0.4)'
                : '0 -2px 10px rgba(15, 23, 42, 0.05)',
            } as any,
          }),
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'TeacherDashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'StudentDirectory') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AwardPoints') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TeacherDashboard"
        component={TeacherDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="StudentDirectory"
        component={StudentDirectoryScreen}
        options={{ tabBarLabel: 'Students' }}
      />
      <Tab.Screen
        name="AwardPoints"
        component={AwardPointsScreen}
        options={{ tabBarLabel: 'Award' }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Leaderboard' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export const TeacherNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TeacherTabs"
        component={TeacherTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentDetails"
        component={StudentDetailsScreen}
        options={{ title: 'Student Dossier' }}
      />
    </Stack.Navigator>
  );
};
