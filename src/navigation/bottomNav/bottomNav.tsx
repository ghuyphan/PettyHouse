import React from 'react';
import { View, StyleSheet } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../../screens/HomeScreen';
import SettingScreen from '../../screens/SettingScreen';

const Tab = createBottomTabNavigator();

export default function BottomNav() {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={{
                headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => (
                <BottomNavigation.Bar
                    shifting
                    navigationState={state}
                    safeAreaInsets={insets}
                    theme={{ colors: { primary: '#FFFF', secondaryContainer: '#d2edf7' } }}
                    activeColor='#8ac5db'
                    onTabPress={({ route, preventDefault }) => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (event.defaultPrevented) {
                            preventDefault();
                        } else {
                            navigation.dispatch({
                                ...CommonActions.navigate(route.name, route.params),
                                target: state.key,
                            });
                        }
                    }}
                    renderIcon={({ route, focused, color }) => {
                        const { options } = descriptors[route.key];
                        if (options.tabBarIcon) {
                            return options.tabBarIcon({ focused, color, size: 24 });
                        }

                        return null;
                    }}
                    getLabelText={({ route }) => {
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.title;
                        return label;
                    }}
                />
            )}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: t('explore'),
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? (
                            <Icon name="map-marker" size={size} color={color} />
                        ) : (
                            <Icon name="map-marker-outline" size={size} color={color} />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Nearby"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Gần đây',
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? (
                            <Icon name="calendar-blank" size={size} color={color} />
                        ) : (
                            <Icon name="calendar-blank-outline" size={size} color={color} />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Add"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Tạo mới',
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? (
                            <Icon name="plus-circle" size={size} color={color} />
                        ) : (
                            <Icon name="plus-circle-outline" size={size} color={color} />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Cá nhân',
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? (
                            <Icon name="account" size={size} color={color} />
                        ) : (
                            <Icon name="account-outline" size={size} color={color} />
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Account"
                component={SettingScreen}
                options={{
                    tabBarLabel: 'Tài khoản',
                    tabBarIcon: ({ focused, color, size }) => {
                        return focused ? (
                            <Icon name="cog" size={size} color={color} />
                        ) : (
                            <Icon name="cog-outline" size={size} color={color} />
                        );
                    },
                }}
            />
        </Tab.Navigator>
    );
}

function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Settings!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});