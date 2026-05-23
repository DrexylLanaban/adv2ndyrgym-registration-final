import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './context/AuthContext';

import SplashScreen from './screens/admin/SplashScreen';
import LoginScreen from './screens/admin/LoginScreen';
import RegisterScreen from './screens/admin/RegisterScreen';
import DashboardScreen from './screens/admin/DashboardScreen';
import MembershipScreen from './screens/admin/MembershipScreen';
import TransactionsScreen from './screens/admin/TransactionsScreen';
import SettingsScreen from './screens/admin/SettingsScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />

        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>

      </NavigationContainer>
    </AuthProvider>
  );
}