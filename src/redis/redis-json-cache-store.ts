import { Cache } from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Injectable()
export class RedisJsonCacheStore {
  constructor(private readonly redis: RedisService) {}

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.setWithTtl(key, JSON.stringify(value), ttl);
  }

  async get<T>(key: string): Promise<T> {
    return JSON.parse(await this.redis.get(key));
  }

  async del?(key: string): Promise<void> {
    await this.redis.delete(key);
  }
}
