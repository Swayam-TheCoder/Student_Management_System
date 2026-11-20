import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();

  let backgroundColor = theme.primary;
  let textColor = '#ffffff';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = theme.surface;
    textColor = theme.text;
    borderColor = theme.border;
    borderWidth = 1.2;
  } else if (variant === 'danger') {
    backgroundColor = theme.danger;
    textColor = '#ffffff';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = theme.primary;
    borderColor = theme.primary;
    borderWidth = 1.5;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = theme.textSecondary;
  }

  const height = size === 'sm' ? 36 : size === 'lg' ? 52 : 46;
  const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 24 : 16;
  const fontSize =
    size === 'sm'
      ? typography.sizes.xs
      : size === 'lg'
        ? typography.sizes.lg
        : typography.sizes.sm;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          height,
          paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
        },
        Platform.select({
          web: {
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
          } as any,
        }),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize,
                marginLeft: icon ? spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
