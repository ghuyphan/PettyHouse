import React from "react";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RequestPasswordScreen from "../screens/RequestPasswordScreen";
import BottomNav from "../components/bottomNav/bottomNav";

const Stack = createStackNavigator();

function AppNavigator({ initialRouteName }: { initialRouteName: string }) {
    return (
        <Stack.Navigator 
          initialRouteName={initialRouteName} // Use the dynamic initialRouteName
          screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RequestPassword" component={RequestPasswordScreen} />
            <Stack.Screen name="BottomNav" component={BottomNav} options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} />
        </Stack.Navigator>
    );
}

export default AppNavigator;
