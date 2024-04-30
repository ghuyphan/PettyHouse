import * as SecureStore from 'expo-secure-store';
import pb from '../services/pocketBase';
import { store } from '../store/store';
import { saveUserData, clearUserData } from '../reducers/userSlice';

// Replace with the actual interface based on PocketBase's response 
interface authData {
    token: string;
    // Adjust properties based on PocketBase's authRefresh() response
} 
interface UserData {
  id: string;
  username: string;
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  name: string;
  avatar: string;
}

// Initial Authorization Check on App Start
const checkInitialAuth = async () => {
    try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            pb.authStore.save(token, null);

            if (pb.authStore.isValid) {
                try {
                    const authData = await pb.collection('users').authRefresh();

                    // Integrate mapping logic
                    const userData = mapRecordModelToUserData(authData.record);

                    await SecureStore.setItemAsync('authToken', authData.token);
                    store.dispatch(saveUserData(userData));
                } catch (refreshError) {
                    console.log('Token is invalid or expired:', refreshError);
                    await SecureStore.deleteItemAsync('authToken'); 
                    store.dispatch(clearUserData()); 
                }
            } else {
                console.log('Initial token is invalid');
                await SecureStore.deleteItemAsync('authToken');
            }
        } else {
            console.log('No token found in SecureStore');
        }
    } catch (initialAuthError) {
        console.log('Error checking initial auth:', initialAuthError);
    }
};

// Define the mapping function (taken from the LoginScreen)
const mapRecordModelToUserData = (record: any): UserData => {
    return {
        id: record.id,
        username: record.username || '', 
        email: record.email || '', 
        emailVisibility: record.emailVisibility || false,
        verified: record.verified || false,
        name: record.name || '',
        avatar: record.avatar || ''
    };
};

export { checkInitialAuth };
