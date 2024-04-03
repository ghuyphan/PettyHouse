import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Icon, HelperText, Snackbar, Banner } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TextDialog from '../components/modal/textDialog';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import pb from '../services/pocketBase';
import { validateEmail } from '../utils/validationHelpers';
import useNetworkStatus from '../hooks/useNetworkStatus';
import BackButton from '../components/button/backButton';

const RequestPasswordScreen = () => {
    const navigation = useNavigation();
    const { snackBarVisible, onDismissSnackBar, dismissSnackBar } = useNetworkStatus();
    const [visible, setVisible] = React.useState(true);

    const storedEmail = useSelector((state: RootState) => state.auth.globalEmail);
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Input validation
    const [emailError, setEmailError] = useState(false);
    const [emailErrorText, setEmailErrorText] = useState('');

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

        const emailValidation = validateEmail(email, t);
        setEmailError(!!emailValidation);
        setEmailErrorText(emailValidation || '');

        return !emailValidation;
    };
    /**
     * Handles the login process.
     *
     * @return {Promise<void>} - A promise that resolves when the login process is complete.
     */
    const handleRegister = async () => {
        // // Validate inputs
        const isValid = await validateInputs();
        if (!isValid) {
            return;
        }
        try {
            setIsLoading(true);
            await pb.collection('users').create({
                email,
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
                        <Text style={styles.forgotText}>{t('forgotPasswordTitle')}</Text>
                    </View>
                    <Image source={require('../../assets/images/dogKey.png')} style={styles.dogImage} />

                </View>
                <View style={styles.bottomContainer}>
                    <Banner
                        elevation={0}
                        visible={visible}
                        style={{ backgroundColor: '#fff', marginBottom: 10, borderRadius: 5, borderColor: '#ccc', borderWidth: 1 }}
                        icon={({ size }) => (
                            <Icon
                                source="information"
                                size={size}
                                color="#b5e1eb"
                            />
                        )}>
                        {t('forgotPasswordDescription')}
                    </Banner>
                    <View style={styles.inputContainer}>
                        <TextInput
                            mode='outlined'
                            style={styles.input}
                            label={t('email')}
                            left={<TextInput.Icon icon="email" color="#b5e1eb" />}
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
                    </View>
                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        style={{ marginTop: 20 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {!isLoading ? t('forgotPasswordButton') : t('forgotPasswordButtonProcessing')}
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
                icon={isSuccess ? "check-circle" : "alert-outline"}
                isVisible={showDialog}
                onDismiss={onDismissDialog}
                title={isSuccess ? t('registrationSuccess') : t('registrationError')}
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
    forgotText: {
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
        top: 130,
        right: 15,
        width: 140,
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

export default RequestPasswordScreen;
