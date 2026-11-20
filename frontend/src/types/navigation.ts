import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: { initialRole?: 'STUDENT' | 'TEACHER' } | undefined;
};

export type StudentTabParamList = {
  StudentDashboard: undefined;
  Leaderboard: undefined;
  PointHistory: undefined;
  StudentProfile: undefined;
  Settings: undefined;
};

export type TeacherTabParamList = {
  TeacherDashboard: undefined;
  StudentDirectory: undefined;
  AwardPoints: { preselectedStudentId?: number; preselectedStudentName?: string } | undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

export type TeacherStackParamList = {
  TeacherTabs: NavigatorScreenParams<TeacherTabParamList>;
  StudentDetails: { studentId: number };
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  StudentApp: NavigatorScreenParams<StudentTabParamList>;
  TeacherApp: NavigatorScreenParams<TeacherStackParamList>;
};

