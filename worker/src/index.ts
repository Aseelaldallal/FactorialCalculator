import * as keys from './keys';
import * as redis from 'redis';

if (!keys.redisHost || !keys.redisPort) {
    throw new Error('Redis Environment variables not setup');
}

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: +keys.redisPort,
    retry_strategy: () => 1000, // try to reconnect every second
});

const sub = redisClient.duplicate();

const factorial = (index: number): number => {
    if (index === 1) {
        return 1;
    }
    return factorial(index - 1) * index;
};

sub.on('message', (channel, message) => {
    redisClient.hset('values', message, factorial(+message).toString());
});

sub.subscribe('insert');
