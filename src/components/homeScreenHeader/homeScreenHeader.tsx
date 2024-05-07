import React, { FC } from "react";
import { FAB, Text, ActivityIndicator, Snackbar, Icon } from 'react-native-paper';
import { View } from "react-native-reanimated/lib/typescript/Animated";

interface HomeScreenHeaderProps {
    haveRecordData: boolean;
    headTextWithData: string;
    headerTextNoData1: string;
}
const HomeScreenHeader: FC<HomeScreenHeaderProps> = ({ haveRecordData, headTextWithData, headerTextNoData1 }) => {

    return (
        <View>
            {haveRecordData ? <Text style={{ fontSize: 20 }}>{headTextWithData}</Text> :
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 20 }}>{headerTextNoData1}</Text>
                    <View style={{ padding: 5, borderRadius: 10, backgroundColor: '#8ac5db' }} >
                        <Icon source="paw" color={'#fff'} size={15} />
                    </View>

                    <Text style={{ fontSize: 20 }}>{t('noRecords')}</Text>
                </View>
            }
        </View>
    );
}