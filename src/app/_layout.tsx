import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: 'systemUltraThinMaterial',
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Alexandria Pantries' }} />
      <Stack.Screen 
        name="pantry/[id]" 
        options={{ title: 'Pantry Details' }} />
    </Stack>
  );
}