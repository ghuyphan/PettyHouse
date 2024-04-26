import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Icon } from 'react-native-paper';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

interface PopupDialogProps {
    isLoading: boolean;
    isError?: boolean;
    message?: string;
    containerPosition: SharedValue<number>;
    containerScale: SharedValue<number>;
    textColor?: string;
}


const PopupDialog: React.FC<PopupDialogProps> = ({ isLoading = false, isError = false, message, containerPosition, containerScale, textColor }) => {
    // if (!isLoading) return null;
    const animatedLoadingStyle = useAnimatedStyle(() => {
        return {
            bottom: containerPosition.value,
            justifyContent: 'center',
            alignItems: 'center',
            // padding: 10,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: '#f0f9fc',
            borderRadius: 50,
            transform: [{ scale: containerScale.value }]
        };
    });

    return (
        <View style={styles.loadingContainer}>
            <Animated.View style={{ ...animatedLoadingStyle }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {isError ? <Icon source="alert-circle-outline" size={25} color={'#8ac5db'} /> :
                    <ActivityIndicator animating={isLoading} size="small" color={'#8ac5db'} /> }
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15 }}>{message}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        marginTop: 10,
        color: '#fff',
        fontWeight: 'bold'
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'red',
    },
});

export default PopupDialog;
