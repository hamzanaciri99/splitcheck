import { View, Pressable } from 'react-native';
import { Icon, type IconName } from './Icon';
import { HeadlineLgMobile } from './Typography';

type Props = {
  title?: string;
  leftIcon?: IconName;
  onLeftPress?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
};

export function TopAppBar({ title = 'SplitCheck', leftIcon = 'menu', onLeftPress, rightIcon = 'bell', onRightPress }: Props) {
  return (
    <View className="absolute top-0 left-0 w-full z-50 flex-row items-center justify-between px-gutter h-16 bg-surface/70 backdrop-blur-xl border-b border-white/10">
      <Pressable onPress={onLeftPress} className="active:opacity-80 p-2 -ml-2">
        <Icon name={leftIcon} size={24} color="#d5e8ec" />
      </Pressable>
      <HeadlineLgMobile className="text-primary">{title}</HeadlineLgMobile>
      <Pressable onPress={onRightPress} className="active:opacity-80 p-2 -mr-2">
        <Icon name={rightIcon} size={24} color="#d5e8ec" />
      </Pressable>
    </View>
  );
}
