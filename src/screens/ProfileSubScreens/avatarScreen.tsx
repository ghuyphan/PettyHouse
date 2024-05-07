import React from "react";
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import Animated, { useSharedValue } from 'react-native-reanimated';

const AvatarScreen: React.FC = () => {
    const userData = useSelector((state: RootState) => state.user.userData);
    const avatarUri = userData?.avatar;
    return (
        <View style={styles.container}>
            <Animated.View style={{ width: 100, height: 100, backgroundColor: 'green' }} sharedTransitionTag="avatar">
                {avatarUri ? (
                    <Avatar.Image source={{ uri: avatarUri }} size={65} />
                ) : (
                    <Avatar.Text label={userData?.username ? userData.username.slice(0, 2).toUpperCase() : ''} size={65} color="#fff" />
                )}
            </Animated.View>
        </View >
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
export default AvatarScreen;