export type HttpResponseBody = {
    city: string;
    temperature: number;
    weatherCondition: {
        type: string;
        pressure: number;
        humidity: number;
    }
    wind: {
        speed: number;
        direction: string;
    }
}