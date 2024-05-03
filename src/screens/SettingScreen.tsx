import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate } from 'react-native-reanimated';
import { List, Button, useTheme, Avatar, Text, Switch, Icon } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { clearUserData } from '../reducers/userSlice';
import pb from '../services/pocketBase';
import TextDialog2Btn from '../components/modal/textDialog2Btn';
import i18n from '../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import EditProfileScreen from './SettingSubScreens/EditProfile';

interface SettingsProps { }

const SettingScreen: React.FC<SettingsProps> = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLanguageEnglish, setIsLanguageEnglish] = useState(true);
    const userData = useSelector((state: RootState) => state.user.userData);

    const scrollY = useSharedValue(0);

    const headerSmallStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [45, 50], [0, 1]);

        return {
            opacity: opacity,
        };
    });


    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const toggleLanguage = () => {
        setIsLanguageEnglish(!isLanguageEnglish);
        i18n.changeLanguage(isLanguageEnglish ? 'en' : 'vi');
        try {
            AsyncStorage.setItem('language', isLanguageEnglish ? 'en' : 'vi');
            AsyncStorage.getItem('language')
                .then((language) => {
                    console.log(language);
                })
                .catch((error) => {
                    console.error('Error retrieving language from AsyncStorage:', error);
                });
        } catch (error) {
            console.log('Error saving language:', error);
        }
    };

    useEffect(() => {
        AsyncStorage.getItem('language').then((value) => {
            if (value) {
                if (value === 'vi') {
                    setIsLanguageEnglish(true);
                } else {
                    setIsLanguageEnglish(false);
                }
            } else {
                console.log('Language not set');
            }
        }).catch((error) => {
            console.error('Error reading language:', error);
        });
    }, []);
    // Handle the logout logic
    const logout = async () => {
        try {
            setIsLoading(true);
            await SecureStore.deleteItemAsync('authToken');
            dispatch(clearUserData());
            pb.authStore.clear();
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], // Navigate to the 'Home' screen after logout
                })
            );
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
            navigation.navigate('Login' as never);
        }
    }
    return (
        <View style={styles.container}>
            
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{t('settings')}</Text>
                        {/* <Searchbar placeholder="Search" /> */}
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('EditProfile' as never)}>
                        <View style={styles.avatarContainer}>
                            {userData?.avatar ? (
                                <Avatar.Image source={{ uri: userData.avatar }} size={60} />
                            ) : (
                                <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={60} color="#fff" />
                            )}
                            <View style={styles.userInfo}>
                                {/* <Text style={styles.name}>{userData?.name}</Text> */}
                                <Text style={styles.userName}>@{userData?.username}</Text>
                                <View style={styles.verifiedContainer}>
                                <Icon source="check-circle" color={'#fff'} size={15} />
                                <Text style={styles.verifiedText}>{userData?.verified ? 'Đã xác thực' : 'Unverified User'}</Text>

                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <List.Section style={styles.listSection}>
                        {/* <List.Subheader style={{ marginHorizontal: -5 }}>Help</List.Subheader> */}
                        <View style={styles.listItemContainer}>

                            <List.Item
                                title="Tracker Guide"
                                left={() => <List.Icon color={colors.primary} icon="book-open-variant" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Features Guide"
                                left={() => <List.Icon color={colors.primary} icon="format-list-bulleted" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Help Center"
                                left={() => <List.Icon color={colors.primary} icon="lifebuoy" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                        </View>
                    </List.Section>
                    <List.Section style={styles.listSection}>
                        {/* <List.Subheader style={{ marginHorizontal: -5 }}>Settings</List.Subheader> */}
                        <View style={styles.listItemContainer}>
                            <List.Item
                                title="Notifications"
                                left={() => <List.Icon color={colors.primary} icon="bell-outline" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Measurement Units"
                                left={() => <List.Icon color={colors.primary} icon="ruler-square" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Enhance Accuracy"
                                left={() => <List.Icon color={colors.primary} icon="crosshairs-gps" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                        </View>
                    </List.Section>
                    <List.Section style={styles.listSection}>
                        {/* <List.Subheader style={{ marginHorizontal: -5 }}>More</List.Subheader> */}
                        <View style={styles.listItemContainer}>
                            <List.Item
                                title="About"
                                left={() => <List.Icon color={colors.primary} icon="information-outline" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Shop"
                                left={() => <List.Icon color={colors.primary} icon="shopping-outline" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="Blog"
                                left={() => <List.Icon color={colors.primary} icon="pencil-outline" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                            <List.Item
                                title="End Demo Mode"
                                left={() => <List.Icon color={colors.primary} icon="exit-to-app" />}
                                right={() => <List.Icon style={{marginRight: -10}} color={colors.primary} icon="chevron-right" />}
                            />
                        </View>
                    </List.Section>
                    <List.Section style={styles.listSection}>
                        <View style={styles.listItemContainerRight}>
                            <List.Item
                                title={t('languageSwitch')}
                                left={() => <List.Icon color={colors.primary} icon="translate" />}
                                right={() => <Switch value={isLanguageEnglish} onValueChange={toggleLanguage} />}
                            />
                        </View>
                    </List.Section>
                    <Button
                        icon="logout"
                        mode="contained"
                        loading={isLoading}
                        disabled={isLoading}
                        onPress={() => setIsVisible(true)}
                        style={styles.logoutButton}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        {t('logout')}
                    </Button>
                    <View style={styles.version}>
                        <Text style={{ textAlign: 'center', color: 'gray', fontSize: 12 }}>{t('version')}</Text>
                    </View>
                </View>
                <TextDialog2Btn
                    // icon='logout'
                    isVisible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    onConfirm={() => { setIsVisible(false); logout() }}
                    title={t('logout') + '?'}
                    content='Are you sure you want to log out?'
                />
            </Animated.ScrollView>
            <Animated.View style={[styles.headerSmall, headerSmallStyle]}>
                <Text style={styles.headerSmallText}>{t('settings')}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 130,
        paddingBottom: 10,
    },
    headerText: {
        fontSize: 30,
        marginBottom: 10,
    },
    headerSmall: {
        // marginTop: 60,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
        justifyContent: 'center',
        backgroundColor: '#f0f9fc',
        position: 'absolute',
        height: 100,
        top: 0,
        left: 0,
        right: 0,
    },
    headerSmallText: {
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#fff', // Match the background color
    },
    contentContainer: {
        flex: 1,
    },
    avatarContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f9fc',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 20,
        gap: 15,
    },
    userInfo: {
        flexDirection: 'column',
        gap: 5,
    },
    userName: {
        fontSize: 18,
        color: '#333',
    },
    name: {
        fontSize: 20,
        color: '#333',
        fontWeight: '600',
    },
    verifiedContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        backgroundColor: '#77DD77',
        padding: 5,
        borderRadius: 50,
        width: 120,
    },
    verifiedText: {
        color: '#fff',
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#8ac5db', // This should be the color you want for your logout button
    },
    listSection: {
        marginTop: 20,
    },
    listItemContainer: {
        paddingLeft: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    listItemContainerRight: {
        paddingLeft: 20,
        borderRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    version: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    }
    // Define additional styles if necessary
});

export default SettingScreen;
