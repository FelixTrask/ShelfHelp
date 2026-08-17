import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
export default function ReportStatus() {
    const pantryName = 'Old Town Pantry';
    const currentStatus = 'Almost Empty';
    const lastUpdated = '2 hours ago'

    const [selectedStatus, setSelectedStatus] = useState('');
    return (
        <View>
            <Text>Report pantry status</Text>
            <Text>{pantryName}</Text>
            <Text>Current status: {currentStatus}</Text>
            <Text>Last updated: {lastUpdated}</Text>
            <Text>How stocked is this pantry right now?</Text>

            <Pressable onPress={() => setSelectedStatus('Stocked')}>
                <Text>Stocked</Text>
            </Pressable>

            <Pressable onPress={() => setSelectedStatus('Almost Empty')}>
                <Text>Almost Empty</Text>
            </Pressable>

            <Pressable onPress={() => setSelectedStatus('Empty')}>
                <Text>Empty</Text>
            </Pressable>

            <Pressable
            disabled={!selectedStatus}
            onPress={() => 
                Alert.alert('Thanks for the update!', `You marked ${pantryName} as ${selectedStatus}.`)}
            >
                <Text>Submit Report</Text>
            </Pressable>
        </View>
    );
}