import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen     from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EditorScreen    from './src/screens/EditorScreen';

const Stack = createNativeStackNavigator();

function Nav() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen}/>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen}/>
          <Stack.Screen name="Editor"    component={EditorScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Nav/>
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="light"/>
    </SafeAreaProvider>
  );
}
