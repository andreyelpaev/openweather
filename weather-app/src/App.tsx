import React, {useState} from 'react'
import './App.css'
import {HttpResponseBody} from "../../src/types/http-response-body";

function App() {
    const [city, setCity] = useState<string | null>(null);
    const [weather, setWeather] = useState<HttpResponseBody | null>(null);
    const [error, setError] = useState<{ error: boolean } | null>(null);

    const handleSearch = () => {
        const fetchWeather = async () => {
            const data = await fetch(`https://esiz2pt9l0.execute-api.us-east-1.amazonaws.com/dev/v1/getCurrentWeather?city=${city}`)

            if (data.ok) {
                const json = await data.json()
                setWeather(json);
                setError(null);
            } else {
                setError({error: true})
                setWeather(null)
            }
        }

        fetchWeather().catch(console.error)
    }

    return (
        <div className="weather-app">
            <div className="weather-app-controls">
                <input placeholder="Enter city" type="text" onChange={(e) => setCity(e.target.value)}/>
                <input type="button" value="Search" onClick={handleSearch}/>
            </div>
            {weather && <MemoizedWeatherResult {...weather} />}
            {error?.error && <NotFound />}
        </div>
    )
}

const NotFound = () => {
    return (
        <React.Fragment>
            <div className="weather-app-not-found">City not found!</div>
        </React.Fragment>
    )
}

const WeatherResult = (weather: HttpResponseBody) => {
    return (
        <div className="weather-app-results">
            <div className="weather-app-result-other">
                <div className="weather-app-result-item">
                    <span>Temperature:</span>
                    <span>{weather?.temperature} °F</span>
                </div>
                <div className="weather-app-result-item">
                    <span>City:</span>
                    <span>{weather?.city}</span>
                </div>
                <div className="weather-app-result-item">
                    <span>Wind speed:</span>
                    <span>{weather?.wind.speed} m/s</span>
                </div>
                <div className="weather-app-result-item">
                    <span>Wind direction:</span>
                    <span>{weather?.wind.direction}</span>
                </div>
                <div className="weather-app-result-item">
                    <span>Pressure: </span>
                    <span>{weather?.weatherCondition.pressure} hPa</span>
                </div>
                <div className="weather-app-result-item">
                    <span>Humidity:</span>
                    <span>{weather?.weatherCondition.humidity} %</span>
                </div>
            </div>
        </div>
    )
}

const MemoizedWeatherResult = React.memo(WeatherResult)

export default App
