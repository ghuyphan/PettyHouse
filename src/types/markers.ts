
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
    dislike: number;
    username: string;
    avatar: string;
}

export default TypeMarker