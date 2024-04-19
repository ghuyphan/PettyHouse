import * as Location from 'expo-location';
import { getDistanceFromLatLonInKm, calculateBoundingBox } from '../utils/distanceUtils';
import pb from '../services/pocketBase';

export async function fetchRecordsWithinRadius(centerLat: number, centerLon: number, radius: number) {
  try {
    const boundingBox = calculateBoundingBox(centerLat, centerLon, radius);

    const potentialRecords = await pb.collection('posts').getList(1, 50, {
      filter: `latitude >= ${boundingBox.minLat} && latitude <= ${boundingBox.maxLat} && longitude >= ${boundingBox.minLon} && longitude <= ${boundingBox.maxLon}`,
      expand: 'user' 
    });

    const filteredRecords = potentialRecords.items.filter(record => {
      const distance = getDistanceFromLatLonInKm(
        { latitude: centerLat, longitude: centerLon },
        { latitude: record.latitude, longitude: record.longitude }
      );
      return distance <= radius;
    });

    return filteredRecords;
  } catch (error) {
    throw error;
  }
}
