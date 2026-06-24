import { View, Text, TextInput, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, className, ...rest }: Props) {
  return (
    <View className="gap-1.5">
      {label && <Text className="font-sans text-[12px] text-on-surface-variant font-medium">{label}</Text>}
      <TextInput
        placeholderTextColor="#bacbb9"
        className={`bg-surface-container border border-outline-variant rounded-lg px-4 py-3.5 text-on-surface text-[15px] font-sans focus:border-primary ${
          className ?? ''
        }`}
        {...rest}
      />
    </View>
  );
}
