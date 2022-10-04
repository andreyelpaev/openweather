import {SecretsManager} from "@aws-sdk/client-secrets-manager";
import {OpenWeatherSecret} from "./types/public-api";

const client = new SecretsManager({
    region: 'us-east-1',
})

export const openWeatherApiKey = new Promise<string>((resolve, reject) => {
    client.getSecretValue({SecretId: 'prod/openweather/key'}, (err, data) => {
        if (err) {
            reject(err)
        }
        const secret = JSON.parse(data?.SecretString!) as OpenWeatherSecret
        resolve(secret.openweather_key)
    });
});