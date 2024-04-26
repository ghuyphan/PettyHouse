
interface TypeMarker {
    id: string;
    coordinate: {
        latitude: number;
        longitude: number;
    };
    title: string;
    address: string;
    image: string;
    like: number;
    hasLiked: boolean;
    dislike: number;
    username: string;
    avatar: string;
    created: string;
}

export default TypeMarker