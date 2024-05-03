import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface TextDialogRadioButtonProps {
    isVisible: boolean;
    onDismiss: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    dismissLabel?: string;
    confirmLabel?: string;
    dismissable?: boolean;
}

const TextDialogRadioButton: React.FC<TextDialogRadioButtonProps> = ({
    isVisible,
    onDismiss,
    onConfirm,
    title,
    confirmLabel = "Ok",
    dismissLabel = "Cancel",
    dismissable = true,
}) => {
    const [checkedValue, setCheckedValue] = React.useState<string>('');
    const [otherText, setOtherText] = React.useState<string>('');
    const [ t ] = useTranslation();

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={onDismiss} dismissable={dismissable} style={styles.dialogStyle}>
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content>
                    <RadioButton.Group onValueChange={value => setCheckedValue(value)} value={checkedValue}>
                        <RadioButtonItem label={t('offensiveReport')} value="offensive" />
                        <RadioButtonItem label={t('copyrightReport')} value="copyright" />
                        <RadioButtonItem label={t('privacyReport')} value="privacy" />
                        <RadioButtonItem label={t('scamReport')} value="scam" />
                        <RadioButtonItem label={t('spamReport')} value="spam" />
                        <RadioButtonItem label={t('otherReport')} value="other">
                            {checkedValue === 'other' && (
                                <TextInput
                                    placeholder={t('reasonReport')}
                                    value={otherText}
                                    onChangeText={setOtherText}
                                    outlineColor='#ccc'
                                    style={styles.input}
                                    mode='flat'
                                    maxLength={150}
                                />
                            )}
                        </RadioButtonItem>
                    </RadioButton.Group>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} labelStyle={styles.buttonLabel}>{dismissLabel}</Button>
                    <Button onPress={() => onConfirm(checkedValue)} disabled={checkedValue === 'other' && !otherText} labelStyle={styles.buttonLabel}>
                        {confirmLabel}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const RadioButtonItem = ({ label, value, children }: { label: string, value: string, children?: any }) => (
    <View style={styles.radioButtonContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RadioButton.Android value={value} />
            <Text style={styles.radioButtonLabel}>{label}</Text>
        </View>
        {children}
    </View>
);

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
    },
    dialogStyle: {
        backgroundColor: '#f0f9fc',
    },
    radioButtonContainer: {
        flexDirection: 'column',
        marginBottom: 10,
    },
    radioButtonLabel: {
        marginRight: 10,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        marginVertical: 10,
        backgroundColor: '#f0f9fc',
        width: '100%',
    },
});

export default TextDialogRadioButton;
