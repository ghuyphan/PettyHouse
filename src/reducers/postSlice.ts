import { createSlice, createAction } from "@reduxjs/toolkit";

interface PostData {
    postID: string | null;
    postTitle: string | null;
    postContent: string | null;
    postImage: string | null;
    postLocation: string | null;
    postLatitude: number | null;
    postLongitude: number | null;
    postCategory: string | null;
    postLikes: number | null;
}
interface PostState {
    postData: PostData | null;
}

const initialState: PostState = {
    postData: null,
}

const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        savePost: (state, action) => {
            state.postData = action.payload;
        },
        clearPost: (state) => {
            state.postData = null;
        },
},
});

export const { savePost, clearPost } = postSlice.actions;
export default postSlice.reducer;
