import { createSlice, createAction } from "@reduxjs/toolkit";

interface AuthState {
    globalEmail: string | null;
}

const initialState: AuthState = {
    globalEmail: null,
}

const SAVE_EMAIL = "SAVE_EMAIL";
const CLEAR_USERNAME = "CLEAR_USERNAME";

export const saveEmail = createAction<string>(SAVE_EMAIL);
export const clearUser = createAction(CLEAR_USERNAME);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(saveEmail, (state, action) => {
            state.globalEmail = action.payload;
        });
    },
});

export default authSlice.reducer;