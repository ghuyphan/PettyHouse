import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from 'react-native-reanimated-skeleton';

interface CommentSkeletonLoadingProps {
    isLoading: boolean;
}
const CommentSkeletonLoading: FC<CommentSkeletonLoadingProps> = ({ isLoading }) => {
    return (
        <Skeleton
            containerStyle={{ marginBottom: 20, backgroundColor: '#fff', width: '100%', height: '100%', paddingHorizontal: 20, marginTop: 15 }}
            isLoading={isLoading}
            layout={[
                {
                    key: 'topRow1', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                // { key: 'username1', width: 120, height: 14, marginBottom: 4 },
                                { key: 'address1', width: 180, height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10
                },
                { key: 'title1', width: '80%', height: 14, marginBottom: 10 },
                { key: 'title1', width: '90%', height: 14, marginBottom: 10 },
                {
                    key: 'topRow1', children: [
                        { key: 'image1', width: '70%', height: 250, borderRadius: 15 },
                        { key: 'image1', width: '50%', height: 250, borderRadius: 15 },
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10
                },
                
                { key: 'divider', width: '100%', height: 5, marginVertical: 30, borderRadius: 50 },
                {
                    key: 'topRow2', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: '80%', height: 14, marginBottom: 4 },
                                { key: 'username1', width: '85%', height: 14, marginBottom: 4 },
                                { key: 'address1', width: '90%', height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5, flex: 1
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10
                },
                {
                    key: 'topRow3', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: '80%', height: 14, marginBottom: 4 },
                                { key: 'username1', width: '85%', height: 14, marginBottom: 4 },
                                { key: 'address1', width: '90%', height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5, flex: 1
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10
                },
                {
                    key: 'topRow4', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: '80%', height: 14, marginBottom: 4 },
                                { key: 'username1', width: '85%', height: 14, marginBottom: 4 },
                                { key: 'address1', width: '90%', height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5, flex: 1
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10
                },
                {
                    key: 'topRow5', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: '80%', height: 14, marginBottom: 4 },
                                { key: 'username1', width: '85%', height: 14, marginBottom: 4 },
                                { key: 'address1', width: '90%', height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5, flex: 1
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10
                },
                {
                    key: 'topRow6', children: [
                        { key: 'avatar1', width: 36, height: 36, borderRadius: 50, marginRight: 10 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: '80%', height: 14, marginBottom: 4 },
                                { key: 'username1', width: '85%', height: 14, marginBottom: 4 },
                                { key: 'address1', width: '90%', height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5, flex: 1
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10
                },

            ]}
        />
    )
};
export default CommentSkeletonLoading;