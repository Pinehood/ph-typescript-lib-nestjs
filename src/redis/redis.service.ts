import { Injectable } from "@nestjs/common";
import IORedis, {
  Redis,
  Cluster,
  RedisOptions,
  ClusterNode,
  ClusterOptions,
} from "ioredis";

@Injectable()
export class RedisService {
  private redis: Redis | Cluster;

  constructor() {}

  init(host: string, password: string, port: number, tls?: boolean): void {
    const clusterMode = host.includes(",");
    if (clusterMode === false) {
      const options: RedisOptions = {
        host,
        port,
        password,
      };
      this.redis = new IORedis(options);
      if (tls === true) {
        options.tls = {};
      }
    } else {
      const hosts = host.split(",");
      const nodes: ClusterNode[] = [];
      for (let i = 0; i < hosts.length; i++) {
        nodes.push({
          host: hosts[i],
          port,
        });
      }
      const options: ClusterOptions = {
        enableReadyCheck: false,
        slotsRefreshTimeout: 30000,
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
          password,
        },
      };
      if (tls === true) {
        options.redisOptions.tls = {};
      }
      this.redis = new Cluster(nodes, options);
    }
  }

  set(key: string, value: string): Promise<"OK"> {
    return this.redis.set(key, value);
  }

  setWithTtl(key: string, value: string, ttl: number): Promise<"OK"> {
    return this.redis.set(key, value, "EX", ttl);
  }

  async get(key: string): Promise<string> {
    try {
      return await this.redis.get(key);
    } catch {
      return "";
    }
  }

  listRemove(key: string, value: string): Promise<number> {
    return this.redis.lrem(key, 0, value);
  }

  listLength(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  listRange(key: string, start: number, end: number): Promise<string[]> {
    return this.redis.lrange(key, start, end);
  }

  listPush(key: string, value: any): Promise<number> {
    return this.redis.lpush(key, value);
  }

  async keyExists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  delete(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
