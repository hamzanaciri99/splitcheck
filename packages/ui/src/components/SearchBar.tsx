import { View, TextInput, Pressable, Text, type TextInputProps } from 'react-native';
import { Icon } from './Icon';

type Props = Omit<TextInputProps, 'onPress'> & {
  /** When false, the bar is a static button: tapping it fires onPress instead of focusing a keyboard. */
  editable?: boolean;
  onPress?: () => void;
  containerClassName?: string;
};

export function SearchBar({
  editable = true,
  onPress,
  placeholder = 'Search',
  value,
  onChangeText,
  containerClassName,
  ...rest
}: Props) {
  if (!editable) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel="Search"
        className={`flex-row items-center gap-2 bg-surface-container border border-outline-variant rounded-full px-3.5 h-9 active:opacity-80 ${
          containerClassName ?? ''
        }`}
      >
        <Icon name="search" size={16} color="#bacbb9" />
        <Text className="font-sans text-on-surface-variant text-[13px]" numberOfLines={1}>
          {placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className={`flex-row items-center gap-2 bg-surface-container border border-outline-variant rounded-full px-3.5 h-9 ${
        containerClassName ?? ''
      }`}
    >
      <Icon name="search" size={16} color="#bacbb9" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#bacbb9"
        className="flex-1 font-sans text-on-surface text-[13px]"
        {...rest}
      />
    </View>
  );
}
