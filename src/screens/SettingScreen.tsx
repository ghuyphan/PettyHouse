import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Button, useTheme, Divider, Text, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { clearUserData } from '../reducers/userSlice';
import pb from '../services/pocketBase';
import TextDialog2Btn from '../components/modal/textDialog2Btn';
import i18n from '../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsProps { }

const SettingScreen: React.FC<SettingsProps> = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLanguageEnglish, setIsLanguageEnglish] = useState(true);

    const toggleLanguage = () => {
        setIsLanguageEnglish(!isLanguageEnglish);
        i18n.changeLanguage(isLanguageEnglish ? 'vi' : 'en');
        try {
            AsyncStorage.setItem('language', isLanguageEnglish ? 'en' : 'vi');
        } catch (error) {
            console.log('Error saving language:', error);
        }
    };

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
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <View style={styles.container}>
                <List.Section style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Help</Text>
                    <View style={styles.listItemContainer}>

                        <List.Item
                            title="Tracker Guide"
                            left={() => <List.Icon color={colors.primary} icon="book-open-variant" />}
                        />
                        <List.Item
                            title="Features Guide"
                            left={() => <List.Icon color={colors.primary} icon="format-list-bulleted" />}
                        />
                        <List.Item
                            title="Help Center"
                            left={() => <List.Icon color={colors.primary} icon="lifebuoy" />}
                        />
                    </View>
                </List.Section>
                <List.Section style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.listItemContainer}>
                        <List.Item
                            title="Notifications"
                            left={() => <List.Icon color={colors.primary} icon="bell-outline" />}
                        />
                        <List.Item
                            title="Measurement Units"
                            left={() => <List.Icon color={colors.primary} icon="ruler-square" />}
                        />
                        <List.Item
                            title="Enhance Accuracy"
                            left={() => <List.Icon color={colors.primary} icon="crosshairs-gps" />}
                        />
                    </View>
                </List.Section>
                <List.Section style={styles.listSection}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <View style={styles.listItemContainer}>
                        <List.Item
                            title="About"
                            left={() => <List.Icon color={colors.primary} icon="information-outline" />}
                        />
                        <List.Item
                            title="Shop"
                            left={() => <List.Icon color={colors.primary} icon="shopping-outline" />}
                        />
                        <List.Item
                            title="Blog"
                            left={() => <List.Icon color={colors.primary} icon="pencil-outline" />}
                        />
                        <List.Item
                            title="End Demo Mode"
                            left={() => <List.Icon color={colors.primary} icon="exit-to-app" />}
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
                    <Text style={{textAlign: 'center', color: 'gray', fontSize: 12}}>{t('version')}</Text>
                </View>
            </View>
            <TextDialog2Btn
                // icon='logout'
                isVisible={isVisible}
                onDismiss={() => setIsVisible(false)}
                onConfirm={() => { setIsVisible(false); logout() }}
                title={t('logout')+'?'}
                content='Are you sure you want to log out?'
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Match the background color
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#8ac5db', // This should be the color you want for your logout button
    },
    listSection: {
        marginTop: 10,
    },
    listItemContainer: {
        paddingLeft: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    listItemContainerRight: {
        paddingLeft: 20,
        // paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        marginTop: 10,
    },
    version: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    }
    // Define additional styles if necessary
});

export default SettingScreen;
