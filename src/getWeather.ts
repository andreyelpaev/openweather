import axios from 'axios';
import {StatusCodes, getReasonPhrase} from 'http-status-codes'
import {openweatherApiKey} from "./secrets";
import {OpenWeatherLonLatResponse, HttpEventRequest, OpenWeatherResponse} from "./types/public-api";
import {createClient} from '@redis/client'

const REDIS_PREFIX = process.env.REDIS_PREFIX;
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT;

axios.interceptors.request.use(async (config) => {
    const appId = await openweatherApiKey;
    config.params = {
        ...config.params,
        appid: appId
    }
    return config
})

const client = createClient({
    url: REDIS_ENDPOINT
});

export function respondJson(body: object, statusCode: number) {
    return {
        statusCode,
        body: JSON.stringify(body)
    };
};

export async function handler(event: HttpEventRequest<{ city: string }>) {

    await client.connect();
    await client.set(`${REDIS_PREFIX}-key`, 1234, {
        EX: 24 * 60 * 60
    });

    if (event.queryStringParameters === null) {
        return respondJson({error: getReasonPhrase(StatusCodes.BAD_REQUEST)}, StatusCodes.BAD_REQUEST)
    }

    try {
        const response = await axios.get<OpenWeatherLonLatResponse>('https://api.openweathermap.org/geo/1.0/direct', {
            params: {
                q: event.queryStringParameters.city
            }
        });

        if (response.status === StatusCodes.OK) {
            const lon = response.data[0]?.lon;
            const lat = response.data[0]?.lat;

            const weatherResponse = await axios.get<OpenWeatherResponse>('https://api.openweathermap.org/data/2.5/weather', {
                params: {
                    lat,
                    lon
                }
            });
            return respondJson({...weatherResponse.data}, StatusCodes.OK);
        }
    } catch (e) {
        if(axios.isAxiosError(e)) {
            return respondJson({error: e.message}, StatusCodes.BAD_REQUEST);
        }
    }
}