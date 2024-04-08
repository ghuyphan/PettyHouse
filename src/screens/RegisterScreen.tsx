import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Keyboard } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TextDialog from '../components/modal/textDialog';
import pb from '../services/pocketBase';
import BackButton from '../components/button/backButton';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validationUtils';


const RegisterScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordVisibility, setPasswordVisibility] = useState({ password: false, confirmPassword: false });
    const [showDialog, setShowDialog] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Input validation
    const [userNameError, setUserNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [userNameErrorText, setUserNameErrorText] = useState('');
    const [emailErrorText, setEmailErrorText] = useState('');
    const [passwordErrorText, setPasswordErrorText] = useState('');
    const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState('');

    //Text dialog
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onDismissDialog = () => {
        setShowDialog(false);
        if (isSuccess) {
            navigation.navigate('Login' as never);
        }
    };
    /**
     * Validates the email and password inputs and sets corresponding error states.
     *
     */
    const validateInputs = async () => {
        // const userNameValidation = validateUsername(userName, t);
        // setUserNameError(!!userNameValidation);
        // setUserNameErrorText(userNameValidation || '');

        const emailValidation = validateEmail(email, t);
        setEmailError(!!emailValidation);
        setEmailErrorText(emailValidation || '');

        const passwordValidation = validatePassword(password, t);
        setPasswordError(!!passwordValidation);
        setPasswordErrorText(passwordValidation || '');

        const confirmPasswordValidation = validateConfirmPassword(confirmPassword, password, t);
        setConfirmPasswordError(!!confirmPasswordValidation);
        setConfirmPasswordErrorText(confirmPasswordValidation || '');

        // return !userNameValidation && !emailValidation && !passwordValidation && !confirmPasswordValidation;
        return !emailValidation && !passwordValidation && !confirmPasswordValidation;
    };

    /**
     * Handles the login process.
     *
     * @return {Promise<void>} - A promise that resolves when the login process is complete.
     */
    const handleRegister = async () => {
        // // Validate inputs before submitting
        const isValid = await validateInputs();
        if (!isValid) {
            return;
        }
        try {
            Keyboard.dismiss();
            setIsLoading(true);
            await pb.collection('users').create({
                // username: userName, // Changed to username 
                email: email,
                password: password,
                passwordConfirm: confirmPassword
            });
            // Successful registration
            setShowDialog(true);
            setIsSuccess(true);
            setMessage(t('registrationSuccessMessage')); // Adjust as needed
            setIsLoading(false);

        } catch (error) {
            const errorData: { status: number; message: string } = error as { status: number; message: string };
            console.log(errorData);
            setIsLoading(false);
            setIsSuccess(false);
            setShowDialog(true);
            setMessage(t('usernameAlreadyExists'));
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
        setPasswordVisibility({
            ...passwordVisibility,
            [field]: !passwordVisibility[field]
        });
    };

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
            extraHeight={500}
            extraScrollHeight={500}
            scrollEnabled={true} enableAutomaticScroll={true}
        >
            <View
                style={{ flexGrow: 1, backgroundColor: '#b5e1eb' }}
            >
                <View style={styles.topContainer}>
                    <View style={styles.topMenuContainer}>
                        <BackButton onPress={() => navigation.navigate('Login' as never)} />
                        <Text style={styles.registerText}>{t('createAccount')}</Text>
                    </View>
                    <Image source={require('../../assets/images/dogSit.png')} style={styles.dogImage} />
                </View>

                <View style={styles.bottomContainer}>
                    <View style={styles.inputContainer}>
                        {/* <TextInput
                            mode='outlined'
                            style={styles.input}
                            label={t('userName')}
                            left={<TextInput.Icon icon="account" color="#b5e1eb" />}
                            value={userName}
                            onChangeText={setUserName}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={() => {
                                const error = validateUsername(userName, t);
                                setUserNameError(!!error);
                                setUserNameErrorText(error || '');
                            }}
                            error={userNameError}
                        />
                        <HelperText type="error" visible={userNameError} style={{ marginTop: -5 }}>{userNameErrorText}</HelperText> */}
                        <TextInput
                            mode='outlined'
                            style={styles.input}
                            label={t('email')}
                            left={<TextInput.Icon icon="email" color="#b5e1eb" />}
                            right={<TextInput.Icon icon="close-circle" color="#b5e1eb" size={20} onPress={() => setEmail('')} />}
                            value={email}
                            onChangeText={setEmail}
                            outlineColor='#ccc'
                            maxLength={40}
                            onBlur={() => {
                                const error = validateEmail(email, t);
                                setEmailError(!!error);
                                setEmailErrorText(error || '');
                            }}
                            error={emailError}

                        />
                        <HelperText type="error" visible={emailError} style={{ marginTop: -5 }}>{emailErrorText}</HelperText>
                        <TextInput
                            mode='outlined'
                            style={{ ...styles.input }}
                            label={t('password')}
                            left={<TextInput.Icon icon="key" color="#b5e1eb" />}
                            secureTextEntry={!passwordVisibility.password}
                            right={<TextInput.Icon icon={passwordVisibility.password ? "eye-off" : "eye"} onPress={() => togglePasswordVisibility('password')} color="#b5e1eb" />}
                            value={password}
                            onChangeText={setPassword}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={() => {
                                const error = validatePassword(password, t);
                                setPasswordError(!!error);
                                setPasswordErrorText(error || '');
                            }}
                            error={passwordError}
                        />
                        <HelperText type="error" visible={passwordError} style={{ marginTop: -5 }}>{passwordErrorText}</HelperText>
                        <TextInput
                            mode='outlined'
                            style={{ ...styles.input }}
                            label={t('confirmPassword')}
                            left={<TextInput.Icon icon="key" color="#b5e1eb" />}
                            secureTextEntry={!passwordVisibility.confirmPassword}
                            right={<TextInput.Icon icon={passwordVisibility.confirmPassword ? "eye-off" : "eye"} onPress={() => togglePasswordVisibility('confirmPassword')} color="#b5e1eb" />}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            outlineColor='#ccc'
                            maxLength={30}
                            onBlur={() => {
                                const error = validateConfirmPassword(confirmPassword, password, t);
                                setConfirmPasswordError(!!error);
                                setConfirmPasswordErrorText(error || '');
                            }}
                            error={confirmPasswordError}
                        />
                        <HelperText type="error" visible={confirmPasswordError} style={{ marginTop: -5 }}>{confirmPasswordErrorText}</HelperText>
                    </View>
                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        style={{ marginTop: 20, marginBottom: 50 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {!isLoading ? t('register') : t('registering')}
                    </Button>
                    <View
                        style={styles.signInContainer}
                    >
                        <Text style={styles.signInText}>{t('alreadyHaveAccount')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                            <Text
                                style={styles.signInButton}
                            >
                                {t('signinNow')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TextDialog
                icon={isSuccess ? "check-circle" : "alert-outline"}
                isVisible={showDialog}
                onDismiss={onDismissDialog}
                title={isSuccess ? t('registrationSuccess') : t('registrationError')}
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
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#b5e1eb',
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    topMenuContainer: {
        flexDirection: 'column',
    },
    registerText: {
        fontSize: 35,
        width: 260,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
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
        top: 100,
        right: 0,
        width: 180,
        height: 200,
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
    signInContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 10
    },
    signInText: {
        fontSize: 15,
        paddingBottom: 10,
    },
    signInButton: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#b5e1eb',
        padding: 10,
        marginLeft: -3
    }
});

export default RegisterScreen;
