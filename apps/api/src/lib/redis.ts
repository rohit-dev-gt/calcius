import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('error', (err) => {
      console.warn('Redis connection error (non-fatal):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }
  return redisClient;
}

export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  try {
    const client = getRedisClient();
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch {
    // Redis failures are non-fatal — app continues without caching
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch {
    // non-fatal
  }
}

export async function redisExists(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  } catch {
    return false;
  }
}
