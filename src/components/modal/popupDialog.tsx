import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Icon, Surface } from 'react-native-paper';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

// Create an animated version of Surface
const AnimatedSurface = Animated.createAnimatedComponent(Surface);

interface PopupDialogProps {
    isLoading: boolean;
    isError?: boolean;
    message?: string;
    containerPosition: SharedValue<number>;
    containerScale: SharedValue<number>;
    textColor?: string;
}

const PopupDialog: React.FC<PopupDialogProps> = ({
    isLoading = false,
    isError = false,
    message,
    containerPosition,
    containerScale,
    textColor
}) => {
    const animatedLoadingStyle = useAnimatedStyle(() => ({
        bottom: containerPosition.value,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        transform: [{ scale: containerScale.value }]
    }));

    return (
        <View style={styles.loadingContainer}>
            <AnimatedSurface style={[animatedLoadingStyle, { paddingHorizontal: 15, paddingVertical: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {isError ? <Icon source="alert-circle-outline" size={25} color={'#8ac5db'} /> :
                    <ActivityIndicator animating={isLoading} size="small" color={'#8ac5db'} />}
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>{message}</Text>
                </View>
            </AnimatedSurface>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PopupDialog;
