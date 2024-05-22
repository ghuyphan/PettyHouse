
interface TypeMarker {
    id: string;
    userId: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    address: string;
    image1: string;
    image2: string;
    image3: string;
    like: number;
    hasLiked: boolean;
    dislike: number;
    username: string;
    avatar: string;
    created: string;
}

export default TypeMarker