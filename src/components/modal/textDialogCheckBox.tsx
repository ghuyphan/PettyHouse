import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton, TextInput } from 'react-native-paper';

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

    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={onDismiss} dismissable={dismissable} style={styles.dialogStyle}>
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content>
                    <RadioButton.Group onValueChange={value => setCheckedValue(value)} value={checkedValue}>
                        <RadioButtonItem label="Offensive, hateful or sexually explicit" value="offensive" />
                        <RadioButtonItem label="Copyright or legal issues" value="copyright" />
                        <RadioButtonItem label="Privacy concern" value="privacy" />
                        <RadioButtonItem label="Scam or fraudulent" value="scam" />
                        <RadioButtonItem label="Spam or irrelevant" value="spam" />
                        <RadioButtonItem label="Other" value="other">
                            {checkedValue === 'other' && (
                                <TextInput
                                    mode="outlined"
                                    placeholder="Please share your reason"
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
        backgroundColor: '#fff',
        width: '100%',
    },
});

export default TextDialogRadioButton;
