import {createClient} from '@redis/client'


const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT;
const REDIS_PREFIX = process.env.REDIS_PREFIX;

const client = createClient({
    url: REDIS_ENDPOINT
});

(async () => {
    await client.connect()
})();



const get = async (key: string) => {
    const result = await client.get(`${REDIS_PREFIX}-${key.toLowerCase()}`)
    return result ? JSON.parse(result) : null;
}

const set = async (key: string, value: object, options?: object) => {
    return await client.set(`${REDIS_PREFIX}-${key.toLowerCase()}`, JSON.stringify(value), options);
}

export {
    client,
    get,
    set
}