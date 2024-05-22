import { createSlice } from '@reduxjs/toolkit';

interface PostData {
    postID: string | null;
    postTitle: string | null;
    postImage1: string | null;
    postImage2?: string | null;
    postImage3?: string | null;
    postLatitude: number | null;
    postLongitude: number | null;
    postLikes: number | null;
    postCreated: string | null;
    hasLiked: boolean;
    // userID: string | null;
    userName: string | null;
    avatar: string | null;
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
            // Reconstruct the postData from the action.payload
            state.postData = {
                postID: action.payload.post.id,
                postTitle: action.payload.post.title,
                postImage1: action.payload.post.image1,
                postImage2: action.payload.post.image2,
                postImage3: action.payload.post.image3,
                postLatitude: action.payload.post.coordinate?.latitude,
                postLongitude: action.payload.post.coordinate?.longitude,
                postLikes: action.payload.post.like,
                hasLiked: action.payload.post.hasLiked,
                // userID: action.payload.username,
                postCreated: action.payload.post.created,
                userName: action.payload.post.username,
                avatar: action.payload.post.avatar
            };
        },
        clearPost: (state) => {
            state.postData = null;
        },
    },
});

export const { savePost, clearPost } = postSlice.actions;
export default postSlice.reducer;
