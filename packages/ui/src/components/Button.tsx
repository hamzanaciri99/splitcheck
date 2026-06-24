import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'sm';

type Props = PressableProps & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
};

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface-container',
  outline: 'bg-transparent border border-primary',
  ghost: 'bg-transparent',
  destructive: 'bg-transparent border border-error/40',
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-on-surface',
  outline: 'text-primary',
  ghost: 'text-on-surface-variant',
  destructive: 'text-error',
};

const VARIANT_SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: '#223336',
  secondary: '#e5e2e1',
  outline: '#d5e8ec',
  ghost: '#bacbb9',
  destructive: '#ffb4ab',
};

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  md: 'rounded-full px-6 py-3.5',
  sm: 'rounded-lg px-4 py-1.5',
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  md: 'text-[15px] font-inter-bold font-bold',
  sm: 'text-[14px] leading-[20px] font-inter-semibold font-semibold',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  icon,
  iconPosition = 'leading',
  disabled,
  className,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-1.5 active:scale-95 ${SIZE_CONTAINER[size]} ${
        VARIANT_CONTAINER[variant]
      } ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-40' : ''} ${className ?? ''}`}
      style={style}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_SPINNER_COLOR[variant]} />
      ) : (
        <>
          {iconPosition === 'leading' && icon}
          <Text className={`${SIZE_TEXT[size]} ${VARIANT_TEXT[variant]}`}>{children}</Text>
          {iconPosition === 'trailing' && icon}
        </>
      )}
    </Pressable>
  );
}
