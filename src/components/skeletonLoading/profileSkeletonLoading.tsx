import React, { FC } from 'react';
import Skeleton from 'react-native-reanimated-skeleton';

interface ProfileSkeletonLoadingProps {
    isLoading: boolean;
}
const ProfileSkeletonLoading: FC<ProfileSkeletonLoadingProps> = ({ isLoading }) => {
    return (

        <Skeleton
            containerStyle={{ marginBottom: 20, backgroundColor: '#fff', width: '100%', height: '100%', paddingHorizontal: 20}}
            isLoading={isLoading}
            layout={[
                {
                    key: 'avatarRow', children: [
                        {
                            key: 'userDetails2', children: [
                                { key: 'fullname', width: 160, height: 30 },
                                { key: 'username', width: 200, height: 20 },
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5
                        },
                        { key: 'avatar', width: 65, height: 65, borderRadius: 50 },
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between', marginTop: 140
                },
                {
                    key: 'buttonRow', children: [
                        { key: 'button1', width: '50%', height: 40, borderRadius: 50 },
                        { key: 'button2', width: '50%', height: 40, borderRadius: 50 },
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between', gap: 5
                },
                { key: 'divider', width: '100%', height: 5, marginTop: 20, marginBottom: 40, borderRadius: 50 },
                {
                    key: 'topRow1', children: [
                        { key: 'avatar1', width: 30, height: 30, borderRadius: 50 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: 120, height: 14, marginBottom: 4 },
                                { key: 'address1', width: 180, height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5
                },
                { key: 'title1', width: '80%', height: 14, marginBottom: 10, marginLeft: 35 },
                { key: 'image1', width: '90%', height: 300, borderRadius: 15, marginBottom: 50, marginLeft: 35},
                {
                    key: 'topRow1', children: [
                        { key: 'avatar1', width: 30, height: 30, borderRadius: 50 },
                        {
                            key: 'userDetails1', children: [
                                { key: 'username1', width: 120, height: 14, marginBottom: 4 },
                                { key: 'address1', width: 180, height: 12 }
                            ], flexDirection: 'column', justifyContent: 'center', gap: 5
                        }
                    ], flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5
                },
                { key: 'title1', width: '80%', height: 14, marginBottom: 10, marginLeft: 35 },
                { key: 'image1', width: '90%', height: 300, borderRadius: 15, marginBottom: 50, marginLeft: 35},

            ]}
        />
    )
};
export default ProfileSkeletonLoading;