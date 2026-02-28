import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import RoleSelectScreen from "./screens/RoleSelectScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import UserDashboard from "./screens/UserDashboard";
import AdminDashboard from "./screens/AdminDashboard";
import InventoryScreen from "./screens/InventoryScreen";
import RequestsScreen from "./screens/RequestsScreen";
import RecordsScreen from "./screens/RecordsScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Requests" component={RequestsScreen} />
        <Stack.Screen name="Records" component={RecordsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}