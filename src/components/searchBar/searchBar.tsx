import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Searchbar, Text, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { useAnimatedStyle, interpolate, interpolateColor, SharedValue } from 'react-native-reanimated';

interface SearchbarComponentProps {
    onSearchUpdate: (query: string) => void;
    onSearchBarLayout?: (bottom: number) => void;
    bottomSheetPosition: SharedValue<number>;
    lastSnapPoint: number;
    bottomSheetRef: any
}

const SearchbarComponent: React.FC<SearchbarComponentProps> = ({
    onSearchUpdate,
    onSearchBarLayout,
    bottomSheetPosition,
    lastSnapPoint,
    bottomSheetRef,
}) => {
    const windowHeight = Dimensions.get('window').height;
    const searchbarTop = windowHeight * 0.055;
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColorInterpolation = interpolateColor(
            windowHeight - bottomSheetPosition.value,
            [lastSnapPoint - 100, lastSnapPoint],
            ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']
        );
        return {
            backgroundColor: backgroundColorInterpolation,
        };
    });

    const searchBarAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            windowHeight - bottomSheetPosition.value,
            [lastSnapPoint - 200, lastSnapPoint],
            [1, 0],
            'clamp'
        );
        const pointerEvents = opacity === 0 ? 'none' : 'auto';
        return {
            pointerEvents,
            opacity,
        };
    });

    const additionalContentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            windowHeight - bottomSheetPosition.value,
            [lastSnapPoint - 100, lastSnapPoint],
            [0, 1],
            'clamp'
        );
        return {
            opacity,  // Show the content when the search bar is transparent
            display: opacity === 1 ? 'flex' : 'none',  // Only display the content when fully visible
            top: searchbarTop + 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
        };
    });

    const handleOnChangeText = (query: string) => {
        setSearchQuery(query);
        if (onSearchUpdate) {
            onSearchUpdate(query);
        }
    };

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    height: 100,
                    left: 0,
                    right: 0,
                },
                animatedStyle,
            ]}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                const searchbarBottom = layout.y + layout.height;
                if (onSearchBarLayout) {
                    onSearchBarLayout(searchbarBottom);
                }
            }}
        >
            <Animated.View style={searchBarAnimatedStyle}>
                <Searchbar
                    placeholder={t('searchPlaceholder')}
                    onChangeText={handleOnChangeText}
                    value={searchQuery}
                    icon={'magnify'}
                    inputStyle={{ fontSize: 16 }}
                    style={{ position: 'absolute', top: searchbarTop, left: 20, right: 20 }}
                    selectionColor={'#000'}
                    elevation={3}
                />
            </Animated.View>
            <Animated.View style={additionalContentStyle}>
                <IconButton icon="chevron-down" size={25} iconColor='#8ac5db' style={{ backgroundColor: 'transparent'}} onPress={() => { bottomSheetRef.current?.snapToIndex(0) }} />
                <Text style={{ textAlign: 'center', fontSize: 18 }}>{t('lastestInYourArea')}</Text>
                <IconButton icon="magnify" size={25} iconColor='#8ac5db' style={{ backgroundColor: 'transparent' }} onPress={() => { }} />
            </Animated.View>
        </Animated.View>
    );
};

export default SearchbarComponent;
