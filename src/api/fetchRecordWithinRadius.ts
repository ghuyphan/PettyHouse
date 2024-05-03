import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';
import pb from '../services/pocketBase';

export async function fetchRecordsWithinRadius(centerLat: number, centerLon: number, radius: number) {
    try {
        const boundingBox = calculateBoundingBox(centerLat, centerLon, radius);
        let allRecords = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const potentialRecords = await pb.collection('posts').getList(page, 50, {
                filter: `latitude >= ${boundingBox.minLat} && latitude <= ${boundingBox.maxLat} && longitude >= ${boundingBox.minLon} && longitude <= ${boundingBox.maxLon} && visible = true`,
                expand: 'user,likes_via_post_id',
            });
        
            const filteredRecords = potentialRecords.items.filter(record => {
                const distance = getDistanceFromLatLonInKm(
                    { latitude: centerLat, longitude: centerLon },
                    { latitude: record.latitude, longitude: record.longitude }
                );
                return distance <= radius;
            });
        
            allRecords.push(...filteredRecords);
            hasMore = potentialRecords.items.length == 50; // Check if full page of items was returned
            page++;
        }
        
        return allRecords;
    } catch (error) {
        throw error;
    }
}
