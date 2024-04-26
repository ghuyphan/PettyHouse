import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import * as SecureStore from 'expo-secure-store';

interface SliderDialogProps {

    isVisible: boolean;
    onDismiss: () => void;
    onConfirm: (value: number) => void;
    title: string;
    radius: number;
    dismissLabel?: string; // Optional confirmation label
    confirmLabel?: string;
    dismissable?: boolean;
}

const SliderDialog: React.FC<SliderDialogProps> = ({
    isVisible,
    onDismiss,
    onConfirm,
    title,
    radius,
    confirmLabel = "Ok",
    dismissLabel = "Cancel",
    dismissable = true,
}) => {
    // State to store the slider's value
    const [sliderValue, setSliderValue] = useState(radius);
    useEffect(() => {
        setSliderValue(radius);
    }, [radius]);
    return (
        <Portal>
            <Dialog visible={isVisible} onDismiss={onDismiss} style={{ backgroundColor: '#f0f9fc' }} dismissable={dismissable}>
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content style={{ marginTop: 10}}>
                    <Slider
                        style={{ width: '100%', height: 40}}
                        minimumValue={1}
                        maximumValue={20}
                        minimumTrackTintColor="#8ac5db"
                        maximumTrackTintColor="#d2edf7"
                        step={1}
                        onValueChange={(value) => setSliderValue(value)} // Update the state value when the slider changes
                        value={sliderValue} // Set the Slider's value to the state value
                    />

                    {/* Display the current value of the slider */}
                    <Text style={{ fontSize: 16, textAlign: 'center' }}>{sliderValue} km</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss} labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#8ac5db' }}>{dismissLabel}</Button>
                    <Button onPress={() => onConfirm(sliderValue)} labelStyle={{ fontSize: 16, fontWeight: 'bold', color: '#8ac5db' }}>{confirmLabel}</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    title: {
        // textAlign: 'center',
    }
});

export default SliderDialog;

