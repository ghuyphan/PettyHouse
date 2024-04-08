import { DEG_TO_RAD } from "../constants/degToRad";
import { EARTH_RADIUS } from "../constants/earthRadius";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export function calculateBoundingBox(latitude: number, longitude: number, radius: number) {
    const latT = radius / (EARTH_RADIUS * DEG_TO_RAD);
    const lonT = radius / (EARTH_RADIUS * Math.cos(latitude * DEG_TO_RAD) * DEG_TO_RAD);

    return {
        minLat: latitude - latT,
        maxLat: latitude + latT,
        minLon: longitude - lonT,
        maxLon: longitude + lonT
    };
}

// Haversine formula for accurate distance calculation
export function getDistanceFromLatLonInKm(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(point2.latitude - point1.latitude);
    const dLon = deg2rad(point2.longitude - point1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.latitude)) *
        Math.cos(deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg: number): number {
    return deg * DEG_TO_RAD;
}
