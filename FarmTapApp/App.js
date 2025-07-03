// File: App.js

import React, { useContext } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EquipmentListScreen from './src/screens/EquipmentListScreen';
import AddEquipmentScreen from './src/screens/AddEquipmentScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EquipmentDetailScreen from './src/screens/EquipmentDetailScreen';
import MyEquipmentScreen from './src/screens/MyEquipmentScreen';

// Import context
import { AuthProvider, AuthContext } from './src/context/AuthContext';

const AuthStackNav = createStackNavigator();
const AppStackNav = createStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  primary: '#2E7D32',
  white: '#FFFFFF',
  background: '#F8F9FA',
  tabInactive: '#6B7280',
  border: '#E5E7EB',
};

const LogoTitle = () => (
  <View style={styles.logoContainer}>
    <Ionicons name="leaf-outline" size={24} color={navTheme.white} />
    <Text style={styles.logoText}>FarmTap</Text>
  </View>
);

function AuthStack() {
  return (
    <AuthStackNav.Navigator
      // [CHANGED] Header title is now aligned left
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTintColor: navTheme.white,
        headerTitleAlign: 'left',
      }}
    >
      <AuthStackNav.Screen name="Login" component={LoginScreen} options={{ headerTitle: () => <LogoTitle /> }} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} options={{ headerTitle: () => <LogoTitle /> }} />
    </AuthStackNav.Navigator>
  );
}

function MainTabs() {
  const { user } = useContext(AuthContext);
  const isOwner = user?.authorities?.some(auth => auth.authority === 'Owner');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Let the parent StackNavigator handle the header
        tabBarActiveTintColor: navTheme.primary,
        tabBarInactiveTintColor: navTheme.tabInactive,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
      }}
    >
      <Tab.Screen
        name="ExploreTab"
        component={EquipmentListScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
        }}
      />
      {isOwner && (
        <Tab.Screen
          name="MyEquipmentTab"
          component={MyEquipmentScreen}
          options={{
            tabBarLabel: 'My Equipment',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'build' : 'build-outline'} size={24} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="BookingsTab"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <AppStackNav.Navigator
      // [CHANGED] Header title is now aligned left
      screenOptions={{
        headerStyle: styles.headerStyle,
        headerTintColor: navTheme.white,
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
      }}
    >
      <AppStackNav.Screen
        name="Main"
        component={MainTabs}
        options={({ route, navigation }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ExploreTab';
          return {
            headerTitle: () => <LogoTitle />,
            // [CHANGED] The profile icon is removed from the header entirely
            headerRight: () => {
              if (routeName === 'MyEquipmentTab') {
                return (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddEquipment')}
                    style={styles.headerButton}
                  >
                    <Ionicons name="add-circle-outline" size={28} color={navTheme.white} />
                  </TouchableOpacity>
                );
              }
              return null; // No button on any other tab
            },
          };
        }}
      />
      <AppStackNav.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{ headerTitle: 'Equipment Details' }}
      />
      <AppStackNav.Screen
        name="AddEquipment"
        component={AddEquipmentScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </AppStackNav.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={navTheme.primary} /></View>;
  }
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return <AuthProvider><AppNavigator /></AuthProvider>;
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: 'bold', color: navTheme.white, marginLeft: 8 },
  headerStyle: { backgroundColor: navTheme.primary, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, },
  headerTitleStyle: { fontWeight: 'bold', color: navTheme.white, },
  headerButton: { marginRight: 15 },
  tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: navTheme.border, height: 85, paddingTop: 8, paddingBottom: 25 },
  tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
});