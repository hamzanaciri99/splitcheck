import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, HeadlineMd, BodyMd } from '@splitcheck/ui';
import { AppBottomNav } from '@/components/AppBottomNav';

export default function GroupsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-gutter py-4">
        <Text className="font-jakarta-bold font-bold text-[22px] text-on-background">Groups</Text>
        <Text className="font-sans text-on-surface-variant text-[13px] mt-0.5">Manage your split groups</Text>
      </View>

      <View className="flex-1 justify-center items-center px-10 gap-3">
        <Icon name="users" size={64} color="#859585" />
        <HeadlineMd className="text-on-surface mt-2">No Groups Yet</HeadlineMd>
        <BodyMd className="text-on-surface-variant text-center">
          Create a group with your friends to easily split recurring bills and expenses.
        </BodyMd>
        <View className="mt-2">
          <Button variant="primary" icon={<Icon name="plus" size={16} color="#223336" />}>
            Create Group
          </Button>
        </View>
      </View>

      <AppBottomNav active="groups" />
    </SafeAreaView>
  );
}
