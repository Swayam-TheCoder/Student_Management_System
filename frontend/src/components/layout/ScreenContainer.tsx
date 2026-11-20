import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  maxWidth?: number;
  centered?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
  maxWidth,
  centered = false,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.background },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View
        style={[
          styles.content,
          maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : null,
          centered && styles.centeredContent,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        minHeight: '100vh' as any,
      },
    }),
  },
  content: {
    flex: 1,
    width: '100%',
  },
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
