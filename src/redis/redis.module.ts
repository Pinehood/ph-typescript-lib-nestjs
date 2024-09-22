import { Module } from "@nestjs/common";
import { RedisJsonCacheStore } from "./redis-json-cache-store";
import { RedisService } from "./redis.service";

@Module({
  providers: [RedisService, RedisJsonCacheStore],
  exports: [RedisService, RedisJsonCacheStore],
})
export class RedisMoudle {}
