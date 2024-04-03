import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "../reducers/authSlice";
// import counterReducer from "../reducers/counterReducer";

const rootReducer = combineReducers({
    // counter: counterReducer
    auth : authSlice

});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;