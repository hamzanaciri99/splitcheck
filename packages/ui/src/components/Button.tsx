import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

type Props = PressableProps & {
  children: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
};

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-surface-alt',
  outline: 'bg-transparent border border-border',
  ghost: 'bg-transparent',
  destructive: 'bg-transparent border border-negative/40',
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: 'text-accent-foreground',
  secondary: 'text-text-primary',
  outline: 'text-text-primary',
  ghost: 'text-text-secondary',
  destructive: 'text-negative',
};

const VARIANT_SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: '#0D0D0F',
  secondary: '#F5F5F5',
  outline: '#F5F5F5',
  ghost: '#9A9AA0',
  destructive: '#F0A9A3',
};

export function Button({
  children,
  variant = 'primary',
  fullWidth,
  loading,
  disabled,
  className,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-full px-6 py-3.5 ${VARIANT_CONTAINER[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-40' : ''} ${className ?? ''}`}
      style={style}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_SPINNER_COLOR[variant]} />
      ) : (
        <Text className={`text-[15px] font-semibold ${VARIANT_TEXT[variant]}`}>{children}</Text>
      )}
    </Pressable>
  );
}
