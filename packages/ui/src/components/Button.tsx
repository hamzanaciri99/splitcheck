import { Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

type Props = PressableProps & {
  children: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
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

export function Button({ children, variant = 'primary', fullWidth, disabled, className, style, ...rest }: Props) {
  return (
    <Pressable
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-full px-6 py-3.5 ${VARIANT_CONTAINER[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-40' : ''} ${className ?? ''}`}
      style={style}
      {...rest}
    >
      <Text className={`text-[15px] font-semibold ${VARIANT_TEXT[variant]}`}>{children}</Text>
    </Pressable>
  );
}
