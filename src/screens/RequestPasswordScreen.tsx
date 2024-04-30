import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Keyboard } from 'react-native';
import { TextInput, Button, Icon, HelperText, Text, Banner } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import TextDialog from '../components/modal/textDialog';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import pb from '../services/pocketBase';
import { validateEmail } from '../utils/validationUtils';
import BackButton from '../components/button/backButton';

const RequestPasswordScreen = () => {
    const navigation = useNavigation();
    const [visible, setVisible] = useState(true);

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
    useEffect(() => {
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, [storedEmail]);
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
    const handleRequestPass = async () => {
        // // Validate inputs
        const isValid = await validateInputs();
        if (!isValid) {
            return;
        }
        try {
            Keyboard.dismiss();
            setIsLoading(true);
            await pb.collection('users').requestPasswordReset(
                email
            );
            // Successful registration
            setShowDialog(true);
            setIsSuccess(true);
            setMessage(t('emailSentSuccessMessage')); // Adjust as needed
            setIsLoading(false);

        } catch (error) {
            const errorData: { status: number; message: string } = error as { status: number; message: string };
            console.log(errorData);
            setIsLoading(false);
            setIsSuccess(false);
            setShowDialog(true);
            setMessage(t('emailSentErrorMessage')); // Adjust as needed
        }
    };

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
            extraScrollHeight={40}
            scrollEnabled={true}
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
                        )}
                    >
                        {t('forgotPasswordDescription')}
                    </Banner>
                    <View style={styles.inputContainer}>
                        <TextInput
                            mode='outlined'
                            style={styles.input}
                            label={t('email')}
                            left={<TextInput.Icon style={{ backgroundColor: 'transparent'}} icon="email" color="#b5e1eb" />}
                            right={email.length > 0 ? <TextInput.Icon style={{ backgroundColor: 'transparent' }} icon="close" color="#b5e1eb" onPress={() => setEmail('')} /> : null}
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
                        icon="email-fast"
                        mode="contained"
                        onPress={handleRequestPass}
                        style={{ marginTop: 20 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {!isLoading ? t('forgotPasswordButton') : t('forgotPasswordButtonProcessing')}
                    </Button>
                </View>
            </View>
            <TextDialog
                icon={isSuccess ? "email-outline" : "alert-outline"}
                isVisible={showDialog}
                onDismiss={onDismissDialog}
                title={isSuccess ? t('emailSentSuccess') : t('emailSentError')}
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
        top: 115,
        right: 5,
        width: 160,
        height: 160,
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
});

export default RequestPasswordScreen;
