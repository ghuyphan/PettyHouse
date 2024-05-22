import React, { useState, useEffect, useMemo } from 'react';
import { ViewStyle, View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { Image } from 'expo-image';
import moment from 'moment';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import DetailBottomSheetItem from './detailBottomSheetItem';
import { Avatar, IconButton, Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import TypeComment from '../../types/comments';
import TypeMarker from '../../types/markers';
import Animated, { AnimatedStyle, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import pb from '../../services/pocketBase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import CommentSkeletonLoading from '../skeletonLoading/commentSkeletonLoading';

interface DetailFlatListProps {
    debouncedToggleLike: (id: string) => void;
    headerAnimatedStyle: AnimatedStyle<ViewStyle>;
}

const DetailFlatList: React.FC<DetailFlatListProps> = ({
    debouncedToggleLike,
    headerAnimatedStyle
}) => {
    const { t } = useTranslation();
    const postData = useSelector((state: RootState) => state.post.postData);
    const [comments, setComments] = useState<TypeComment[]>([]);
    const [post, setPost] = useState<TypeMarker>();
    const createdDate = useMemo(() => moment(post?.created), [post?.created]);
    const currentDate = useMemo(() => moment(), []);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const timeAgoText = useMemo(() => {
        const timeDiffMinutes = currentDate.diff(createdDate, 'minutes');
        const timeDiffHours = Math.floor(timeDiffMinutes / 60);
        const timeDiffSeconds = currentDate.diff(createdDate, 'seconds');
        if (timeDiffSeconds < 60) {
            return t('justNow');
        } else if (timeDiffMinutes < 60) {
            return `${timeDiffMinutes} ${t('minutesAgo')}`;
        } else if (timeDiffHours < 24) {
            return `${timeDiffHours} ${t('hoursAgo')}`;
        } else {
            const daysDiff = Math.floor(timeDiffHours / 24);
            if (daysDiff < 7) {
                return `${daysDiff} ${t('daysAgo')}`;
            } else if (daysDiff < 31) {
                const weeksDiff = Math.floor(daysDiff / 7);
                return `${weeksDiff} ${weeksDiff > 1 ? t('weeksAgo') : t('weekAgo')}`;
            } else {
                const monthsDiff = currentDate.diff(createdDate, 'months');
                return `${monthsDiff} ${monthsDiff > 1 ? t('monthsAgo') : t('monthAgo')}`;
            }
        }
    }, [createdDate, currentDate, t]);


    const fetchPostData = async () => {
        if (!postData || !postData.postID) return; // Handle the case where postData or postID is null
        try {
            const postRecord = await pb.collection('posts').getOne(postData.postID, {
                expand: 'user,likes_via_post_id',
            });
            // Update post state with the fetched data
            setPost({
                id: postRecord.id,
                coordinate: postRecord.coordinate,
                title: postRecord.text,
                address: postRecord.address,
                image1: postRecord.image1,
                image2: postRecord.image2,
                image3: postRecord.image3,
                like: postRecord.likeCount,
                hasLiked: postRecord.expand?.likes_via_post_id?.some((like: any) => like.user_id === pb.authStore.model?.id) || false,
                dislike: postRecord.dislike,
                username: postRecord.expand?.user.username,
                avatar: postRecord.expand?.user.avatar,
                created: postRecord.created,
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching post data:", error);
        }
    };

    const fetchPostComment = async () => {
        setIsFetching(true);
        if (!postData) return;
        try {
            const records = await pb.collection('comments').getFullList({
                filter: `post_id = "${postData?.postID}"`,
                expand: 'user_id',
                sort: 'created',
            });

            const newComments = records.map(record => ({
                id: record.id,
                comment: record.comment, // Include the 'comment' property here
                username: record.expand?.user_id.username,
                avatar: record.expand?.user_id.avatar,
                created: record.created,
            }));

            setComments(newComments);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
        setIsFetching(false);
    };

    const scale = useSharedValue(1);

    const handleToggleLike = () => {
        scale.value = 1.1;  // Slightly scale up when liked
        const postId = postData?.postID;
        if (postId) {
            debouncedToggleLike(postId);
        }

        // Reset the scale after the animation is complete
        setTimeout(() => {
            scale.value = 1;  // Reset scale to normal
        }, 100);  // The delay should match the duration of the animation
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value, { damping: 3, stiffness: 150 }) }],
        };
    }, []);
    useEffect(() => {
        setIsLoading(true);
        fetchPostData();
        fetchPostComment();
    }, [postData]);

    const renderImages = () => {
        const images = [post?.image1, post?.image2, post?.image3].filter(img => img);
        if (images.length > 1) {
            return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 250 }} contentContainerStyle={{ gap: 5 }}>
                    {images.map((img, index) => (
                        <Image key={index} source={{ uri: img }} style={styles.image} />
                    ))}
                </ScrollView>
            );
        } else {
            return (
                <View>
                    <Image source={{ uri: post?.image1 }} style={styles.image} />
                </View>
            );
        }
    };
    return (
        <View
            style={styles.container}>
            {isLoading ? (
                <CommentSkeletonLoading isLoading={isLoading} />
            ) : <BottomSheetFlatList
                data={comments}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                refreshing={isFetching}
                onRefresh={fetchPostComment}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <Animated.View style={[headerAnimatedStyle, styles.header]}>
                            <Text style={{ fontSize: 20 }}>{t('comment')}</Text>
                        </Animated.View>
                        <View style={styles.userSection}>
                            {postData?.avatar ? (
                                <Avatar.Image source={{ uri: post?.avatar }} size={35} style={styles.avatar} />
                            ) : (
                                <Avatar.Text label={post?.username?.slice(0, 2).toUpperCase() ?? 'Default'} size={35} style={styles.avatar} color="#fff" />
                            )}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{post?.username}</Text>
                                <Text style={styles.date}>{timeAgoText}</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>
                            {post?.title}
                        </Text>
                        {renderImages()}
                        <View style={styles.actionSection}>
                            <View style={styles.likeDislikeButtons}>
                                <Animated.View style={animatedStyle}>
                                    <Button
                                        style={styles.likeButton}
                                        labelStyle={{ color: post?.hasLiked ? '#FF5733' : '#8ac5db', fontSize: 20 }}
                                        onPress={handleToggleLike}
                                        icon={post?.hasLiked ? 'heart' : 'heart-outline'}
                                    >
                                        <Text style={{ color: post?.hasLiked ? '#FF5733' : '#8ac5db', fontSize: 14 }}>{post?.like}</Text>
                                    </Button>
                                </Animated.View>
                            </View>
                        </View>
                        <View style={styles.divider} />
                    </View>
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyListContainer}>
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>{t('noComment')}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <DetailBottomSheetItem
                        item={item}
                        toggleLike={() => debouncedToggleLike(item.id)}
                        // toggleReport={(reason: string) => toggleReport(item.id, reason)}
                        isLastItem={comments.indexOf(item) === comments.length - 1}
                    // showDetail={showDetail}
                    />
                )}
            />}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}>
                <View style={styles.commentInput}>
                    {postData?.avatar ? (
                        <Avatar.Image source={{ uri: post?.avatar }} size={25} style={styles.avatar} />
                    ) : (
                        <Avatar.Text label={post?.username?.slice(0, 2).toUpperCase() ?? 'Default'} size={30} style={styles.avatar} color="#fff" />
                    )}
                    <TextInput
                        multiline
                        placeholder={t('writeComment')}
                        style={{ flex: 1 }}
                        selectionColor="#8ac5db"
                    />
                    <IconButton icon="send" size={20} style={styles.sendButton} iconColor='#8ac5db' onPress={() => { }} />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
    },
    headerContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 5,
        flexDirection: 'column',
    },
    header: {
    },
    avatar: {},
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8ac5db',
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    userInfo: {
        flexDirection: 'column',
        gap: 5
    },
    title: {
        fontSize: 14,
        width: '100%',
        marginBottom: 10
    },
    image: {
        borderRadius: 15,
        aspectRatio: 1
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        color: '#8ac5db',
        backgroundColor: 'transparent'
    },
    moreButton: {
        color: '#8ac5db',
        backgroundColor: 'transparent'
    },
    timeAgo: {
        color: '#8ac5db',
        fontSize: 14
    },
    likeDislikeButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    like: {
        color: '#8ac5db',
        fontSize: 14,
        alignItems: 'center',
        // marginBottom: 20,
        marginLeft: 10,
    },
    divider: {
        backgroundColor: '#f0f9fc',
        height: 5,
        width: '100%',
        marginBottom: 20,
        borderRadius: 5
    },
    emptyListContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentInput: {
        marginHorizontal: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 5,
        backgroundColor: '#f0f9fc',
        borderRadius: 50,
        marginBottom: 10
    },
    sendButton: {
        backgroundColor: '#f0f9fc',

    }
});

export default DetailFlatList;
