import PocketBase from 'pocketbase';
import * as SecureStore from 'expo-secure-store';

const pb = new PocketBase('https://petty-house.pockethost.io');

export default pb;
