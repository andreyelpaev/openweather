import axios from 'axios';
import {StatusCodes, getReasonPhrase} from 'http-status-codes'
import {openweatherApiKey} from "./secrets";
import {OpenWeatherLonLatResponse, HttpEventRequest, OpenWeatherResponse, HttpResponseBody} from "./types/public-api";
import * as redis from "./redis-client";
import {degreeToHumanFormat} from "./utils/degrees-to-human-format";

axios.interceptors.request.use(async (config) => {
    const appId = await openweatherApiKey;
    config.params = {
        ...config.params,
        appid: appId
    }
    return config
})


export function respondJson(body: object, statusCode: number) {
    return {
        statusCode,
        body: JSON.stringify(body)
    };
}

const getGeo = async (city: string) => {
    const cache = await redis.get(city);
    if(cache) {
        return cache
    }
    const response = await axios.get<OpenWeatherLonLatResponse>('https://api.openweathermap.org/geo/1.0/direct', {
        params: {
            q: city
        }
    });

    if(response.status === StatusCodes.OK) {
        const lon = response.data[0]?.lon;
        const lat = response.data[0]?.lat;

        await redis.set(city, JSON.stringify({lon, lat}));

        return {
            lon,
            lat
        }
    }

}

const getWeather = async (lon: number, lat: number, city: string): Promise<HttpResponseBody> => {

    const redisWeatherPrefix = 'weather';
    const cache = await redis.get(`${city}-${redisWeatherPrefix}`);

    if(cache) {
        return cache
    }

    const response = await axios.get<OpenWeatherResponse>('https://api.openweathermap.org/data/2.5/weather', {
        params: {
            lat,
            lon
        }
    });

    const responseBody: HttpResponseBody = {
        city: response.data.name,
        temperature: response.data.main.temp,
        weatherCondition: {
            pressure: response.data.main.pressure,
            humidity: response.data.main.humidity,
            type: response.data.weather[0].main,
        },
        wind: {
            speed: response.data.wind.speed,
            direction: degreeToHumanFormat(response.data.wind.deg)
        }
    }

    await redis.set(redisWeatherPrefix, JSON.stringify(responseBody), {
        EX: 60
    })

    return responseBody
}

export async function handler(event: HttpEventRequest<{ city: string }>) {
    if (event.queryStringParameters === null) {
        return respondJson({error: getReasonPhrase(StatusCodes.BAD_REQUEST)}, StatusCodes.BAD_REQUEST)
    }

    try {
        const city = event.queryStringParameters.city;
        const geo = await getGeo(city);
        const weather = await getWeather(geo?.lon!, geo?.lat!, city);
        return respondJson({...weather}, StatusCodes.OK);

    } catch (e) {
        if(axios.isAxiosError(e)) {
            return respondJson({error: e.message}, StatusCodes.BAD_REQUEST);
        }
    }
}