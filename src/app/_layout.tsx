import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChallengeProvider } from '@/features/challenge/ChallengeProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ChallengeProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </ChallengeProvider>
    </SafeAreaProvider>
  );
}
