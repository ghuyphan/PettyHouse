import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';
import pb from '../services/pocketBase';

export async function fetchRecordsWithinRadius(centerLat: number, centerLon: number, radius: number) {
    try {
        const boundingBox = calculateBoundingBox(centerLat, centerLon, radius);
        const userID = pb.authStore.model;

        // Fetch reported post IDs by the current user
        const reportedPosts = new Set();
        const reports = await pb.collection('reports').getList(1, 50, {
            filter: `user_id = "${userID?.id}"`,
        });
        reports.items.forEach(report => reportedPosts.add(report.post_id));

        // Generate filter query for excluding reported posts
        const reportedPostsFilter = Array.from(reportedPosts).map(id => `id != "${id}"`).join(' && ');
        const exclusionFilter = reportedPostsFilter ? ` && (${reportedPostsFilter})` : '';

        // Fetch posts excluding the reported ones
        const filterQuery = `latitude >= ${boundingBox.minLat} && latitude <= ${boundingBox.maxLat} && longitude >= ${boundingBox.minLon} && longitude <= ${boundingBox.maxLon} && visible = true${exclusionFilter}`;
        const potentialRecords = await pb.collection('posts').getList(1, 50, {
            filter: filterQuery,
            expand: 'user,likes_via_post_id',
            sort: '-created',
        });

        const allRecords = potentialRecords.items.filter(record => {
            const distance = getDistanceFromLatLonInKm(
                { latitude: centerLat, longitude: centerLon },
                { latitude: record.latitude, longitude: record.longitude }
            );
            return distance <= radius;
        });

        return allRecords;
    } catch (error) {
        throw error;
    }
}
