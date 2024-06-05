import React, { FC } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { IconButton } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the type for your route parameters
type RootStackParamList = {
    ImageViewer: { images: string[], initialIndex: number };
};

type ImageViewerScreenRouteProp = RouteProp<RootStackParamList, 'ImageViewer'>;

const ImageViewerScreen: FC = () => {
    const route = useRoute<ImageViewerScreenRouteProp>();
    const { images, initialIndex } = route.params;

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="close"
                    size={20}
                    iconColor='#8ac5db'
                    onPress={() => navigation.goBack()}
                    style={{ backgroundColor: '#f0f9fc' }}
                />
            </View>
            <ImageViewer
                imageUrls={images.filter(img => img).map(img => ({ url: img }))}
                style={styles.fullImage}
                enableSwipeDown={true}
                swipeDownThreshold={100}
                onSwipeDown={() => navigation.goBack()}
                useNativeDriver
                index={initialIndex}
                saveToLocalByLongPress={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: 'black'
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 1,
    },
    fullImage: {
        flex: 1,
    },
});

export default ImageViewerScreen;
