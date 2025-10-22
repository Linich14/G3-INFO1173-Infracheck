import { Stack } from 'expo-router'
import LoginScreen from '~/features/auth/screens/LoginScreen'

export default function SignIn() {
  return (
    <>
      <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
      <LoginScreen />
    </>
  )
}
