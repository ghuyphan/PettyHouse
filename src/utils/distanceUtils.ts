import { DEG_TO_RAD } from "../constants/degToRad";
import { EARTH_RADIUS } from "../constants/earthRadius";

// Interface for coordinates
export interface Coordinates {
    latitude: number;
    longitude: number;
}

// Function to calculate the bounding box around a point given a distance
export function calculateBoundingBox(latitude: number, longitude: number, radius: number) {
    const radianLatitude = latitude * DEG_TO_RAD;
    const latT = radius / (EARTH_RADIUS * DEG_TO_RAD);
    const lonT = radius / (EARTH_RADIUS * Math.cos(radianLatitude) * DEG_TO_RAD);

    return {
        minLat: latitude - latT,
        maxLat: latitude + latT,
        minLon: longitude - lonT,
        maxLon: longitude + lonT
    };
}

// Haversine formula to calculate the great-circle distance between two points
export function getDistanceFromLatLonInKm(point1: Coordinates, point2: Coordinates): number {
    const dLat = deg2rad(point2.latitude - point1.latitude);
    const dLon = deg2rad(point2.longitude - point1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.latitude)) *
        Math.cos(deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;  // Distance in km
}

// Utility function to convert degrees to radians
function deg2rad(deg: number): number {
    return deg * DEG_TO_RAD;
}
