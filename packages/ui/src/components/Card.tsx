import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, className, ...rest }: Props) {
  return (
    <View className={`bg-surface-container border border-outline-variant rounded-xl ${className ?? ''}`} {...rest}>
      {children}
    </View>
  );
}
