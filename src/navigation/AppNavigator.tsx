import React from 'react';
import { Platform } from 'react-native';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { CardStyleInterpolators } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RequestPasswordScreen from '../screens/RequestPasswordScreen';
import BottomNav from './bottomNav/bottomNav';
import EditProfileScreen from '../screens/SettingSubScreens/EditProfile';
import CreateNewScreen from '../screens/CreateNewScreen';
import AvatarScreen from '../screens/ProfileSubScreens/AvatarScreen';
import UserProfileScreen from '../screens/HomeScreenSubScreens/UserProfileScreen';
import ImageViewerScreen from '../screens/ImageViewerScreen';

const Stack = createSharedElementStackNavigator();

interface AppNavigatorProps {
    initialRouteName: string;
}

function AppNavigator({ initialRouteName }: AppNavigatorProps) {
    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="RequestPassword"
                component={RequestPasswordScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="BottomNav"
                component={BottomNav}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="Avatar"
                component={AvatarScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
            />
            <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
            />
            <Stack.Screen
                name="CreateNew"
                component={CreateNewScreen}
                options={{
                    cardStyleInterpolator: Platform.select({
                        ios: CardStyleInterpolators.forVerticalIOS,
                        android: CardStyleInterpolators.forBottomSheetAndroid, // Different animation for Android
                    }),
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="ImageViewer"
                component={ImageViewerScreen}
                options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
            />

        </Stack.Navigator>
    );
}

export default AppNavigator;
