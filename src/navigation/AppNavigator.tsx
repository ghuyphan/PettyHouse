import { Platform } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RequestPasswordScreen from "../screens/RequestPasswordScreen";
import BottomNav from "./bottomNav/bottomNav";
import EditProfileScreen from "../screens/SettingSubScreens/EditProfile";
import CreateNewScreen from "../screens/CreateNewScreen";

const Stack = createStackNavigator();

function AppNavigator({ initialRouteName }: { initialRouteName: string }) {
    return (
        <Stack.Navigator 
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen}  options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}  />
            <Stack.Screen name="Register" component={RegisterScreen}  options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}  />
            <Stack.Screen name="RequestPassword" component={RequestPasswordScreen}  options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} />
            <Stack.Screen name="BottomNav" component={BottomNav} options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}/>
            <Stack.Screen 
              name="CreateNew" 
              component={CreateNewScreen} 
              options={{
                cardStyleInterpolator: Platform.select({
                  ios: CardStyleInterpolators.forVerticalIOS,
                  android: CardStyleInterpolators.forBottomSheetAndroid // Different animation for Android
                }),
                gestureEnabled: false
              }} />
        </Stack.Navigator>
    );
}

export default AppNavigator;
