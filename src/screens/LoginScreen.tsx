import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Icon, Menu, HelperText, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { saveEmail } from '../reducers/authSlice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CountryFlag from "react-native-country-flag";
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import i18n from '../utils/i18n';
import TextDialog from '../components/modal/textDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNetworkStatus from '../hooks/useNetworkStatus';
import pb from '../services/pocketBase';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { snackBarVisible, onDismissSnackBar, dismissSnackBar } = useNetworkStatus();

    const dispatch = useDispatch();
    const [user, setuser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [userError, setuserError] = useState(false);
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
        const userValid = user.trim() !== '' && user.length >= 3;
        setuserError(!userValid);

        const passwordValid = password.trim() !== '' && password.length >= 8;
        setPasswordError(!passwordValid);

        return userValid && passwordValid;
    }
    const validateuser = () => {
        const userValid = user.trim() !== '';
        setuserError(!userValid);
        return userValid;
    };

    const validatePassword = () => {
        const passwordValid = password.trim() !== '' && password.length >= 8;
        console.log(password.length);
        console.log(passwordValid);
        setPasswordError(!passwordValid);
        return passwordValid;
    };
    const handleLogin = async () => {
        if (!validateInputsLogin()) {
            return;
        }
        try {
            setIsLoading(true);
            const userExists = await pb.collection("users").getFirstListItem(`username="${user}"`);
            const authData = await pb.collection('users').authWithPassword(user, password);
            console.log("Login successful, token:", authData.token);
            setIsLoading(false);
        } catch (error) {
            const errorData: { status: number; message: string } = error as { status: number; message: string };
            console.log(errorData); // Log the error information
            switch (errorData.status) {
                case 400:
                    setShowDialog(true);
                    setMessage(t('invalidCredentials'));
                    dispatch(saveEmail(user));
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
            extraHeight={130}
            extraScrollHeight={130}
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
                                contentStyle={{ backgroundColor: '#f0f9fc' }}

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
                            label={t('userName')}
                            left={<TextInput.Icon icon="account" color="#b5e1eb" />}
                            right={<TextInput.Icon icon="close-circle" color="#b5e1eb" size={20} onPress={() => setuser('')} />}
                            value={user}
                            onChangeText={setuser}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={validateuser}
                            error={userError}

                        />
                        <HelperText type="error" visible={userError} style={{ marginTop: -5 }}>{t('usernameMinLength')}</HelperText>
                        <TextInput
                            mode='outlined'
                            style={{ ...styles.input }}
                            label={t('password')}
                            left={<TextInput.Icon icon="key" color="#b5e1eb" />}
                            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={togglePasswordVisibility} color="#b5e1eb" />}
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
                        mode="contained"
                        onPress={handleLogin}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {!isLoading ? t('singin') : t('signingIn')}
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
            <Snackbar
                visible={snackBarVisible}
                onDismiss={onDismissSnackBar}
                duration={1000000000000000}
                action={{
                    label: t('close'),
                    labelStyle: { color: '#b5e1eb' },
                    onPress: () => {

                        dismissSnackBar();
                    }
                }}
            >
                {t('noInternet')}
            </Snackbar>
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
        paddingHorizontal: 16,
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
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f0f9fc',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        bottom: 30,
    },
    dogImage: {
        position: 'absolute',
        top: 130,
        right: 10,
        width: 160,
        height: 150,
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: 16,
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
        backgroundColor: '#fff',
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
        fontSize: 15,
        paddingBottom: 10,
    },
    signUpButton: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#b5e1eb',
        padding: 10,
        marginLeft: -3
    }
});

export default LoginScreen;
