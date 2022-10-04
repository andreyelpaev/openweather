import React, {useState} from 'react'
import './App.css'
import {HttpResponseBody} from "../../src/types/http-response-body";

function App() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState<HttpResponseBody | null>(null);

    const handleSearch = () => {
        const fetchWeather = async () => {
            const data = await fetch(`https://esiz2pt9l0.execute-api.us-east-1.amazonaws.com/dev/v1/getCurrentWeather?city=${city}`)

            if (data.ok) {
                const json = await data.json()
                setWeather(json);
            } else {
                setWeather(null)
            }
        }

        fetchWeather()
    }

    return (
        <div className="weather-app">
            <div className="weather-app-controls">
                <input placeholder="Enter city" type="text" onChange={(e) => setCity(e.target.value)}/>
                <input type="button" value="Search" onClick={handleSearch}/>
            </div>
            {weather ? <MemozedWeatherResult {...weather} /> : <NotFound/>}
        </div>
    )
}

const NotFound = () => {
    return (
        <React.Fragment>
            <div>City not found!</div>
        </React.Fragment>
    )
}

const WeatherResult = (weather: HttpResponseBody) => {
    return (
        <React.Fragment>
            <div>City: {weather?.city}</div>
            <div>Temperature: {weather?.temperature}</div>
            <div>Wind speed: {weather?.wind.speed} km/h</div>
            <div>Wind direction: {weather?.wind.direction}</div>
            <div>Pressure: {weather?.weatherCondition.pressure}</div>
            <div>Humidity: {weather?.weatherCondition.humidity}</div>
        </React.Fragment>
    )
}

const MemozedWeatherResult = React.memo(WeatherResult)

export default App
