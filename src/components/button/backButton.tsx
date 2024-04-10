import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';

interface BackButtonProps {
    onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => (
    <View style={{ position: 'absolute', bottom: 120, left: -20 }}>
        <TouchableOpacity style={[styles.button]} onPress={onPress}>
            <Icon
                source="chevron-left"
                size={30}
                color="#b5e1eb"
            />
        </TouchableOpacity>
    </View>

);

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f0f9fc',
        alignItems: 'center',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        bottom: 50,
    },
})
export default BackButton;