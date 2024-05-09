import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Keyboard } from 'react-native';
import { TextInput, Button, Icon, Menu, HelperText, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { saveEmail } from '../reducers/authSlice';
import { saveUserData } from '../reducers/userSlice';
import * as SecureStore from 'expo-secure-store';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CountryFlag from "react-native-country-flag";
import { useTranslation } from 'react-i18next';
import { useNavigation, CommonActions } from '@react-navigation/native';

import i18n from '../utils/i18n';
import TextDialog from '../components/modal/textDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../services/pocketBase';
import { validateEmail } from '../utils/validationUtils';

interface UserData {
    id: string;
    username: string;
    email: string;
    emailVisibility: boolean;
    verified: boolean;
    name: string;
    avatar: string;
}

const LoginScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [emailErrorText, setEmailErrorText] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    //Text dialog
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    //Language menu button
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => {
        setVisible(true);
    };
    const closeMenu = () => setVisible(false);
    const [flag, setFlag] = useState('');

    useEffect(() => {
        /**
         * Asynchronously loads the user's language preference from AsyncStorage and sets the language flag accordingly.
         */
        const loadLanguagePreference = async () => {
            try {
                const storedLanguage = await AsyncStorage.getItem('language');
                if (storedLanguage) {
                    switch (storedLanguage) {
                        case 'en':
                            setFlag('gb');
                            break;
                        case 'vi':
                            setFlag('vn');
                            break;
                    }

                } else {
                    setFlag('vn');
                }
            } catch (error) {
                console.error("Error loading language preference:", error);
            }
        }
        loadLanguagePreference();
    }, []);

    /**
     * Validates the user and password inputs and sets corresponding error states.
     *
     */
    const validateInputsLogin = () => {
        const emailValid = email.trim() !== '' && email.length >= 3;
        const emailMessage = validateEmail(email, t);
        setEmailErrorText(emailMessage || '');
        setEmailError(!emailValid);

        const passwordValid = password.trim() !== '' && password.length >= 8;
        setPasswordError(!passwordValid);

        return emailValid && passwordValid;
    }
    const validateEmailInput = () => {
        if (email.length > 0) {
            const emailValid = validateEmail(email, t);
            setEmailError(!!emailValid);
            setEmailErrorText(emailValid || '');
            return emailValid;
        }

    };

    const validatePassword = () => {
        if (password.length > 0) {
            const passwordValid = password.trim() !== '' && password.length >= 8;
            setPasswordError(!passwordValid);
            return passwordValid;
        }

    };
    const mapRecordModelToUserData = (record: any): UserData => {
        return {
            id: record.id,
            username: record.username || '', // Extract 'username', provide a default
            email: record.email || '',      // Extract 'email', provide a default
            emailVisibility: record.emailVisibility || false,
            verified: record.verified || false,
            name: record.name || '',
            avatar: record.avatar || ''
        };
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!validateInputsLogin()) {
            return;
        }
        try {
            setIsLoading(true);
            const authData = await pb.collection('users').authWithPassword(email, password);
            if (!authData.token) {
                throw new Error('Authentication error: Token not received');
            }
            if (authData.token) {
                // Save token to secure storage

                await SecureStore.setItemAsync('authToken', authData.token);
            }
            // Fetch user data
            const userRecord = await pb.collection('users').getOne(authData.record.id);
            const userData = mapRecordModelToUserData(userRecord);
            dispatch(saveUserData(userData));
            setEmail('');
            setPassword('');
            navigation.navigate('BottomNav' as never);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                })
            );
            setIsLoading(false);
        } catch (error) {
            const errorData: { status: number; message: string } = error as { status: number; message: string };
            console.log(errorData); // Log the error information
            switch (errorData.status) {
                case 400:
                    setShowDialog(true);
                    setMessage(t('invalidCredentials'));
                    dispatch(saveEmail(email));
                    break;
                case 404:
                    setShowDialog(true);
                    setMessage(t('noAccountFound'));
                    break;

            }
        }
        setIsLoading(false);
    };

    const handleLanguageChange = async (language: string) => {
        switch (language) {
            case 'en':
                setFlag('gb');
                break;
            case 'vi':
                setFlag('vn');
                break;
        }
        i18n.changeLanguage(language);
        try {
            await AsyncStorage.setItem('language', language);
        } catch (error) {
            console.log('Error saving language:', error);
        }
        closeMenu();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
            enableAutomaticScroll={true}
            extraScrollHeight={40}
        >
            <View
                style={{ flexGrow: 1, backgroundColor: '#b5e1eb' }}
            >
                <View style={styles.topContainer}>
                    <View style={styles.topMenuContainer}>
                        <View style={{ position: 'absolute', bottom: 120, left: -20 }}>
                            <Menu
                                visible={visible}
                                onDismiss={closeMenu}
                                anchor={
                                    <TouchableOpacity style={styles.languageButton} onPress={openMenu} >
                                        <CountryFlag
                                            isoCode={flag}
                                            size={25}
                                            style={{ borderRadius: 5, marginRight: 5 }}

                                        />
                                        <Icon
                                            source="chevron-down"
                                            size={20}
                                            color="#b5e1eb"
                                        />
                                    </TouchableOpacity>
                                }
                            >
                                <Menu.Item onPress={() => { handleLanguageChange('vi'); }} title="🇻🇳 Tiếng Việt" />
                                <Menu.Item onPress={() => { handleLanguageChange('en') }} title="🇬🇧 English" />
                            </Menu>
                        </View>

                        <Text style={styles.greetingText}>{t('welcome')}</Text>
                    </View>
                    <Image source={require('../../assets/images/dogWave.png')} style={styles.dogImage} />

                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            mode='outlined'
                            style={styles.input}
                            label={t('email')}
                            left={<TextInput.Icon style={{ backgroundColor: 'transparent' }} icon="account" color="#b5e1eb" />}
                            right={email.length > 0 && <TextInput.Icon style={{ backgroundColor: 'transparent' }} icon="close-circle" color="#b5e1eb" size={20} onPress={() => setEmail('')} />}
                            value={email}
                            onChangeText={setEmail}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={validateEmailInput}
                            error={emailError}

                        />
                        <HelperText type="error" visible={emailError} style={{ marginTop: -5 }}>{emailErrorText}</HelperText>
                        <TextInput
                            mode='outlined'
                            style={{ ...styles.input }}
                            label={t('password')}
                            left={<TextInput.Icon style={{ backgroundColor: 'transparent' }} icon="key" color="#b5e1eb" />}
                            right={password.length > 0 && <TextInput.Icon style={{ backgroundColor: 'transparent' }} color={'#b5e1eb'} icon={showPassword ? "eye-off" : "eye"} onPress={() => togglePasswordVisibility()} />}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={validatePassword}
                            error={passwordError}
                        />
                        <HelperText type="error" visible={passwordError} style={{ marginTop: -5, marginBottom: -15 }}>{t('passwordMinLength')}</HelperText>
                    </View>
                    <View style={styles.forgotPasswordContainer}>
                        <Button
                            compact={true}
                            labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                            style={{ marginBottom: 20 }}
                            onPress={() => navigation.navigate('RequestPassword' as never)}
                        >
                            {t('forgotPassword')}
                        </Button>
                    </View>
                    <Button
                        icon={"login"}
                        mode="contained"
                        onPress={handleLogin}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        style={{ marginBottom: 50 }}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {!isLoading ? t('signin') : t('signingIn')}
                    </Button>
                    <View
                        style={styles.signUpContainer}
                    >
                        <Text style={styles.signUpText}>{t('donnotHaveAccount')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                            <Text
                                style={styles.signUpButton}
                            >
                                {t('signupNow')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TextDialog
                icon='alert-outline'
                isVisible={showDialog}
                onDismiss={() => setShowDialog(false)}
                title={t('loginError')}
                content={message}
            />
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#b5e1eb',
    },
    topContainer: {
        height: 280,
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#b5e1eb',
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    topMenuContainer: {
        flexDirection: 'column',
    },
    greetingText: {
        fontSize: 38,
        width: 260,
        fontWeight: 'bold',
        color: '#fff',
    },
    languageButton: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#f0f9fc',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        bottom: 50,
    },
    dogImage: {
        position: 'absolute',
        top: 100,
        right: 0,
        width: 180,
        height: 200,
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#f0f9fc',
    },
    inputContainer: {
    },
    input: {
        width: '100%',
        // marginBottom: 5,
        // marginTop: 5,
    },
    forgotPasswordContainer: {
        width: '100%',
        alignItems: 'flex-end',
    },
    signUpContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 10
    },
    signUpText: {
        fontSize: 14,
        paddingBottom: 10,
    },
    signUpButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b5e1eb',
        padding: 10,
        marginLeft: -3
    }
});

export default LoginScreen;
