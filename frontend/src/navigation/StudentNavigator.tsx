import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StudentDashboardScreen } from '../features/student/StudentDashboardScreen';
import { LeaderboardScreen } from '../features/leaderboard/LeaderboardScreen';
import { PointHistoryScreen } from '../features/student/PointHistoryScreen';
import { StudentProfileScreen } from '../features/student/StudentProfileScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { StudentTabParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<StudentTabParamList>();

export const StudentNavigator: React.FC = () => {
  const { theme } = useTheme();

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
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'StudentDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'PointHistory') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'StudentProfile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Ranks' }}
      />
      <Tab.Screen
        name="PointHistory"
        component={PointHistoryScreen}
        options={{ tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

