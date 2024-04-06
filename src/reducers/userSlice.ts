import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData { 
    id: string;
    username: string;
    email: string;
    emailVisibility: boolean;
    verified: boolean;
    name: string; 
}

interface AuthState {
    userData: UserData | null;
}

const initialState: AuthState = {
    userData: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        saveUserData: (state, action: PayloadAction<UserData>) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        },
        // Add reducers for updating emailVisibility, verified, or other fields if needed
    },
});

export const { saveUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;
