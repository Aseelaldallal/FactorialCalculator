import * as keys from './keys';
import * as bodyParser from 'body-parser';
import express from 'express';
import * as redis from 'redis';
import cors from 'cors';
import { Pool, PoolClient } from 'pg';

class App {
    public app: express.Application;
    private redisClient: redis.RedisClient;
    private redisPublisher: redis.RedisClient;
    private pgClient: Pool;

    constructor() {
        this.app = express();
        this.config();
        this.setupPostgres();
        this.setupRedis();
        this.setupRoutes();
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
    }

    private setupPostgres(): void {
        if (
            !keys.pgUser ||
            !keys.pgHost ||
            !keys.pgDatabase ||
            !keys.pgPassword ||
            !keys.pgPort
        ) {
            throw new Error('Postgres Environment variables not setup');
        }
        this.pgClient = new Pool({
            user: keys.pgUser,
            host: keys.pgHost,
            database: keys.pgDatabase,
            password: keys.pgPassword,
            port: +keys.pgPort,
        });

        this.pgClient.on('error', () => {
            throw new Error('Lost pg connection');
        });

        this.pgClient
            .query('CREATE TABLE IF NOT EXISTS values (number INT)')
            .catch((err) => {
                throw new Error(err);
            });
    }

    private setupRedis(): void {
        if (!keys.redisHost || !keys.redisPort) {
            throw new Error('Redis Environment variables not setup');
        }
        this.redisClient = redis.createClient({
            host: keys.redisHost,
            port: +keys.redisPort,
            retry_strategy: () => 1000,
        });
        this.redisPublisher = this.redisClient.duplicate();
    }

    private setupRoutes(): void {
        this.app.get('/', (req, res) => {
            res.send('Hi');
        });

        this.app.get('/values/all', async (req, res) => {
            const values = await this.pgClient.query('SELECT * from values');
            res.send(values.rows);
        });

        this.app.get('/values/current', async (req, res) => {
            this.redisClient.hgetall('values', (err, values) => {
                res.send(values);
            });
        });

        this.app.post('/values', (req, res) => {
            const index = req.body.index;
            if (parseInt(index, 10) > 40) {
                return res.status(422).send('Index too high');
            }
            this.redisClient.hset('values', index, 'Calculating');
            this.redisPublisher.publish('insert', index);
            this.pgClient.query('INSERT INTO values(number) VALUES($1)', [
                index,
            ]);
            res.send({ working: true });
        });
    }
}

export default new App().app;
