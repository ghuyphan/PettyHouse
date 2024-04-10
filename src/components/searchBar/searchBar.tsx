import React from 'react';
import { Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';

interface SearchbarComponentProps {
    onSearchUpdate: (query: string) => void;
}

const SearchbarComponent: React.FC<SearchbarComponentProps> = ({ onSearchUpdate }) => {
    const windowHeight = Dimensions.get('window').height;
    const searchbarTop = windowHeight * 0.06;
    const [searchQuery, setSearchQuery] = React.useState('');
    const { t } = useTranslation();

    const handleOnChangeText = (query: string) => {
        setSearchQuery(query);
        if (onSearchUpdate) {
            onSearchUpdate(query);
        }
    };

    return (
        <Searchbar
            placeholder={t('searchPlaceholder')}
            onChangeText={handleOnChangeText}
            value={searchQuery}
            iconColor='#b5e1eb'
            selectionColor={'#b5e1eb'}
            style={{ position: 'absolute', top: searchbarTop, left: 10, right: 10 }}
        />
    );
};

export default SearchbarComponent; 
