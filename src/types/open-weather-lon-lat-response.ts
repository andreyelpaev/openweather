type OpenWeatherLonLat = {
    name: string;
    localnames: {
        [key: string]: string;
    }
    lat: number;
    lon: number;
    country: string;
    state: string;
}

export type OpenWeatherLonLatResponse = OpenWeatherLonLat[]
