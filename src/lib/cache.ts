import { Cache as MemCache } from "memory-cache";
import { createClient } from "redis";
import { logger } from "./logger";

export class Cache<T> {
    private logger;

    private memCache;
    private redisClient;

    private isRedisAvailable = true;
    constructor(private namespace: string) {
        this.logger = logger.child().withGroup(`${this.namespace}:cache`);
        this.memCache = new MemCache<string, T>();
        this.redisClient = createClient();
        this.redisClient.on("error", async () => {
            this.logger.error("Redis connection error, using memory-cache");
            this.isRedisAvailable = false;
            this.redisClient.destroy();
        });
        this.redisClient.connect();
    }
    private getKey(key: string) {
        return `${this.namespace}:${key}`;
    }
    /**
     * Get a value from cache.
     *
     * @param key Cache key.
     * @returns Cache value.
     */
    public async get(key: string) {
        if (this.isRedisAvailable) {
            const redisValue = await this.redisClient.get(this.getKey(key));
            if (redisValue) {
                try {
                    return JSON.parse(redisValue);
                } catch {
                    return Buffer.from(redisValue, "base64");
                }
            }
        } else return this.memCache.get(this.getKey(key));
    }
    /**
     * Put a value into cache.
     *
     * @param key Cache key.
     * @param value Cache value.
     * @param ttl Cache TTL in milliseconds.
     */
    public async put(key: string, value: T, ttl: number) {
        if (this.isRedisAvailable) {
            if (Buffer.isBuffer(value)) {
                await this.redisClient.set(
                    this.getKey(key),
                    value.toString("base64"),
                    {
                        expiration: {
                            type: "EX",
                            value: Math.trunc(ttl / 1000),
                        },
                    },
                );
            } else {
                await this.redisClient.set(
                    this.getKey(key),
                    JSON.stringify(value),
                    {
                        expiration: {
                            type: "EX",
                            value: Math.trunc(ttl / 1000),
                        },
                    },
                );
            }
        } else this.memCache.put(this.getKey(key), value, ttl);
    }
}
