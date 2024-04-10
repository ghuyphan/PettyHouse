import React, {useState} from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { clearUserData } from '../reducers/userSlice';
import pb from '../services/pocketBase';
import TextDialog2Btn from '../components/modal/textDialog2Btn';

const SettingScreen = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const logout = async () => {
        setIsLoading(true);
        setIsVisible(true);
        try {
            await SecureStore.deleteItemAsync('authToken');
            dispatch(clearUserData());
            pb.authStore.clear();
            navigation.navigate('Login' as never);
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], // Navigate to the 'Home' screen after logout
                })
            ); 
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
    }
    return (
        <View style={styles.container}>
            <Text>{t('setting')}</Text>
            <Button loading={isLoading} disabled={isLoading} mode="contained" onPress={() => { logout()}}>Logout</Button>
            <TextDialog2Btn
                icon='alert-outline'
                isVisible={isVisible}
                onDismiss={() => setIsVisible(false)}
                title={t('loginError')}
                content={t('logoutError')}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffff',
    },

})
export default SettingScreen;