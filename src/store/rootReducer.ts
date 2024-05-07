import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../reducers/authSlice";
import userSlice from "../reducers/userSlice";
import postSlice from "../reducers/postSlice";
// import counterReducer from "../reducers/counterReducer";

const rootReducer = combineReducers({
    // counter: counterReducer
    auth : authSlice,
    user : userSlice,
    post : postSlice

});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;