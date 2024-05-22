import React, { FC } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { IconButton } from 'react-native-paper';
import ImageViewer from 'react-native-image-zoom-viewer';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type ImageViewerScreenRouteProp = RouteProp<{ params: { images: string[], initialIndex: number } }, 'params'>;

const ImageViewerScreen: FC = () => {
    const route = useRoute<ImageViewerScreenRouteProp>();
    const { images, initialIndex } = route.params;

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="close"
                    size={20}
                    iconColor='#8ac5db'
                    onPress={() => {
                        // navigate back to the previous screen
                        // ensure to import useNavigation from @react-navigation/native
                        navigation.goBack();
                    }}
                    style={{ backgroundColor: '#f0f9fc' }}
                />
            </View>
            <ImageViewer
                imageUrls={images.map(img => ({ url: img }))}
                style={styles.fullImage}
                renderIndicator={() => null}
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
