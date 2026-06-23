import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon } from '@splitcheck/ui';

export default function GroupsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-5 py-4">
        <Text className="text-text-primary text-[22px] font-extrabold">Groups</Text>
        <Text className="text-text-secondary text-[13px] mt-0.5">Manage your split groups</Text>
      </View>

      <View className="flex-1 justify-center items-center px-10 gap-3">
        <Icon name="users" size={64} color="#6E6E73" />
        <Text className="text-text-primary text-lg font-bold mt-2">No Groups Yet</Text>
        <Text className="text-text-secondary text-sm text-center leading-5">
          Create a group with your friends to easily split recurring bills and expenses.
        </Text>
        <View className="mt-2">
          <Button variant="primary" icon={<Icon name="plus" size={16} color="#0D0D0F" />}>
            Create Group
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
