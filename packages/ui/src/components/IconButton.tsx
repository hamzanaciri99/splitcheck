import { Pressable, type PressableProps } from 'react-native';

type Props = PressableProps & {
  children: React.ReactNode;
  accessibilityLabel: string;
  variant?: 'plain' | 'circle';
  size?: number;
};

export function IconButton({ children, variant = 'plain', size = 40, disabled, className, style, ...rest }: Props) {
  return (
    <Pressable
      disabled={disabled}
      className={`items-center justify-center rounded-full ${variant === 'circle' ? 'bg-surface-alt/80' : ''} ${
        disabled ? 'opacity-40' : ''
      } ${className ?? ''}`}
      style={[{ width: size, height: size }, style as object]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
