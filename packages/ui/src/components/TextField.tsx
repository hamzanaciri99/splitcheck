import { View, Text, TextInput, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, className, ...rest }: Props) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-text-secondary text-xs font-medium">{label}</Text>}
      <TextInput
        placeholderTextColor="#6E6E73"
        className={`bg-surface border border-border rounded-xl px-4 py-3.5 text-text-primary text-[15px] ${
          className ?? ''
        }`}
        {...rest}
      />
    </View>
  );
}
