import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpGateScreen from '../screens/SignUpGateScreen';
import ClientSignupScreen from '../screens/ClientSignupScreen';
import ProviderSignupScreen from '../screens/ProviderSignupScreen';
import { colors } from '../theme';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ClientSignup: undefined;
  ProviderSignup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpGateScreen} />
      <Stack.Screen name="ClientSignup" component={ClientSignupScreen} />
      <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} />
    </Stack.Navigator>
  );
}