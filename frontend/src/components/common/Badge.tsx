import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  let bg = theme.primaryLight;
  let textCol = theme.primary;

  if (variant === 'success') {
    bg = theme.successLight;
    textCol = theme.success;
  } else if (variant === 'warning') {
    bg = theme.warningLight;
    textCol = theme.warning;
  } else if (variant === 'danger') {
    bg = theme.dangerLight;
    textCol = theme.danger;
  } else if (variant === 'neutral') {
    bg = theme.inputBackground;
    textCol = theme.textSecondary;
  }

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textCol,
            fontSize: isSm ? typography.sizes.xs : typography.sizes.sm,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: spacing.borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.2,
  },
});
